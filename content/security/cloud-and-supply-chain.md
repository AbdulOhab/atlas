---
title: "Cloud, Containers and Supply Chain"
order: 8
summary: "Securing what the code runs on and is built from: Docker and Node.js images, Kubernetes, IaC, CI/CD and GitHub Actions, cloud architecture, network segmentation, workload identity, databases, microservice architecture, serverless, dependencies, SBOMs and zero trust."
category: "Security"
level: Intermediate
---

# Cloud, Containers and Supply Chain

Securing what the code runs on and is built from: Docker and Node.js images, Kubernetes, IaC, CI/CD and GitHub Actions, cloud architecture, network segmentation, workload identity, databases, microservice architecture, serverless, dependencies, SBOMs and zero trust.

## Docker Security

> **Source:** [Docker Security](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Docker is the most popular containerization technology. When used correctly, it can enhance security compared to running applications directly on the host system. However, certain misconfigurations can reduce security levels or introduce new vulnerabilities.

The aim of this cheat sheet is to provide a straightforward list of common security errors and best practices to assist in securing your Docker containers.

### Rules

#### RULE \#0 - Keep Host and Docker up to date

To protect against known container escape vulnerabilities like [Leaky Vessels](https://snyk.io/blog/cve-2024-21626-runc-process-cwd-container-breakout/), which typically result in the attacker gaining root access to the host, it's vital to keep both the host and Docker up to date. This includes regularly updating the host kernel as well as the Docker Engine.

This is due to the fact that containers share the host's kernel. If the host's kernel is vulnerable, the containers are also vulnerable. For example, the kernel privilege escalation exploit, [Dirty COW](https://github.com/scumjr/dirtycow-vdso), executed inside a well-insulated container would still result in root access on a vulnerable host.

#### RULE \#1 - Do not expose the Docker daemon socket (even to the containers)

Docker socket _/var/run/docker.sock_ is the UNIX socket that Docker is listening to. This is the primary entry point for the Docker API. The owner of this socket is root. Giving someone access to it is equivalent to giving unrestricted root access to your host.

**Do not enable _tcp_ Docker daemon socket.** If you are running docker daemon with `-H tcp://0.0.0.0:XXX` or similar you are exposing unencrypted and unauthenticated direct access to the Docker daemon, if the host is internet connected this means the docker daemon on your computer can be used by anyone from the public internet.
If you really, **really** have to do this, you should secure it. Check how to do this following [Docker official documentation](https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-socket-option).

**Do not expose _/var/run/docker.sock_ to other containers**. If you are running your docker image with `-v /var/run/docker.sock://var/run/docker.sock` or similar, you should change it. Mounting the socket read-only does not make the Docker API read-only: a process that can connect to the socket can still send requests that modify containers or the host. Docker grants access to all daemon commands by default; filesystem mount flags do not replace [API authorization](https://docs.docker.com/engine/extend/plugins_authorization/). Equivalent in the docker compose file is something like this:

```yaml
volumes:
  - "/var/run/docker.sock:/var/run/docker.sock"
```

#### RULE \#2 - Set a user

Configuring the container to use an unprivileged user is the best way to prevent privilege escalation attacks. This can be accomplished in three different ways as follows:

1. During runtime using `-u` option of `docker run` command e.g.:

```bash
docker run -u 4000 alpine
```

2. During build time. Simply add user in Dockerfile and use it. For example:

```dockerfile
FROM alpine
RUN groupadd -r myuser && useradd -r -g myuser myuser
#    <HERE DO WHAT YOU HAVE TO DO AS A ROOT USER LIKE INSTALLING PACKAGES ETC.>
USER myuser
```

3. Enable user namespace support (`--userns-remap=default`) in [Docker daemon](https://docs.docker.com/engine/security/userns-remap/#enable-userns-remap-on-the-daemon)

More information about this topic can be found at [Docker official documentation](https://docs.docker.com/engine/security/userns-remap/). For additional security, you can also run in rootless mode, which is discussed in [Rule \#11](#rule-11---run-docker-in-rootless-mode).

In Kubernetes, this can be configured in [Security Context](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/) using the `runAsUser` field with the user ID e.g:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: example
spec:
  containers:
    - name: example
      image: gcr.io/google-samples/node-hello:1.0
      securityContext:
        runAsUser: 4000 # <-- This is the pod user ID
```

As a Kubernetes cluster administrator, you can configure a hardened default using the [`Restricted` level](https://kubernetes.io/docs/concepts/security/pod-security-standards/#restricted) with built-in [Pod Security admission controller](https://kubernetes.io/docs/concepts/security/pod-security-admission/), if greater customization is desired consider using [Admission Webhooks](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#what-are-admission-webhooks) or a [third party alternative](https://kubernetes.io/docs/concepts/security/pod-security-standards/#alternatives).

#### RULE \#3 - Limit capabilities (Grant only specific capabilities, needed by a container)

[Linux kernel capabilities](http://man7.org/linux/man-pages/man7/capabilities.7.html) are a set of privileges that can be used by privileged. Docker, by default, runs with only a subset of capabilities.
You can change it and drop some capabilities (using `--cap-drop`) to harden your docker containers, or add some capabilities (using `--cap-add`) if needed.
Remember not to run containers with the `--privileged` flag - this will add ALL Linux kernel capabilities to the container.

The most secure setup is to drop all capabilities `--cap-drop all` and then add only required ones. For example:

```bash
docker run --cap-drop all --cap-add CHOWN alpine
```

**And remember: Do not run containers with the _--privileged_ flag!!!**

In Kubernetes this can be configured in [Security Context](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/) using `capabilities` field e.g:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: example
spec:
  containers:
    - name: example
      image: gcr.io/google-samples/node-hello:1.0
      securityContext:
        capabilities:
          drop:
            - ALL
          add: ["CHOWN"]
```

As a Kubernetes cluster administrator, you can configure a hardened default using the [`Restricted` level](https://kubernetes.io/docs/concepts/security/pod-security-standards/#restricted) with built-in [Pod Security admission controller](https://kubernetes.io/docs/concepts/security/pod-security-admission/), if greater customization is desired consider using [Admission Webhooks](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#what-are-admission-webhooks) or a [third party alternative](https://kubernetes.io/docs/concepts/security/pod-security-standards/#alternatives).

#### RULE \#4 - Prevent in-container privilege escalation

Always run your docker images with `--security-opt=no-new-privileges` in order to prevent privilege escalation. This will prevent the container from gaining new privileges via `setuid` or `setgid` binaries.

In Kubernetes, this can be configured in [Security Context](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/) using `allowPrivilegeEscalation` field e.g.:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: example
spec:
  containers:
    - name: example
      image: gcr.io/google-samples/node-hello:1.0
      securityContext:
        allowPrivilegeEscalation: false
```

As a Kubernetes cluster administrator, you can configure a hardened default using the [`Restricted` level](https://kubernetes.io/docs/concepts/security/pod-security-standards/#restricted) with built-in [Pod Security admission controller](https://kubernetes.io/docs/concepts/security/pod-security-admission/), if greater customization is desired consider using [Admission Webhooks](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#what-are-admission-webhooks) or a [third party alternative](https://kubernetes.io/docs/concepts/security/pod-security-standards/#alternatives).

#### RULE \#5 - Be mindful of Inter-Container Connectivity

Inter-Container Connectivity (icc) is enabled by default, allowing all containers to communicate with each other through the [`docker0` bridged network](https://docs.docker.com/network/drivers/bridge/). Instead of using the `--icc=false` flag with the Docker daemon, which completely disables inter-container communication, consider defining specific network configurations. This can be achieved by creating custom Docker networks and specifying which containers should be attached to them. This method provides more granular control over container communication.

For detailed guidance on configuring Docker networks for container communication, refer to the [Docker Documentation](https://docs.docker.com/network/#communication-between-containers).

In Kubernetes environments, [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/) can be used to define rules that regulate pod interactions within the cluster. These policies provide a robust framework to control how pods communicate with each other and with other network endpoints. Additionally, [Network Policy Editor](https://networkpolicy.io/) simplifies the creation and management of network policies, making it more accessible to define complex networking rules through a user-friendly interface.

#### RULE \#5a - Be careful when mapping container ports to the host with firewalls like UFW

[UFW (Uncomplicated Firewall)](https://ubuntu.com/server/docs/how-to/security/firewalls/#ufw-uncomplicated-firewall) is a popular host-based firewall for Linux. A common misconception is that firewall rules protect all inbound traffic — including traffic destined for Docker containers. However, **Docker manages its own `iptables` and `nftables` rules directly and bypasses UFW entirely**. Note that other tools that use `iptables` or `nftables` can also have conflicts similar to UFW. If you are using other firewall tools, you should check if they are working correctly.

When you publish a port with `-p 8000:8000`, Docker inserts `iptables` rules that open that port to **all interfaces and all source addresses**, and these rules are typically accepted before explicit firewall `DENY` rules are applied. As a result, traffic may be allowed through regardless of any `DENY` rules you have set, which can unintentionally expose container services to the public internet.

##### Recommended Mitigations

**Option 1 — Bind published ports to localhost only:**

Bind the host side of the port mapping to `127.0.0.1` so the service is only reachable locally, not from external networks:

```bash
# Vulnerable: exposes port on all interfaces
docker run -p 8000:8000 myimage

# Safe: binds only to localhost
docker run -p 127.0.0.1:8000:8000 myimage
```

In a Docker Compose file:

```yaml
services:
  web:
    image: myimage
    ports:
      - "127.0.0.1:8000:8000"  # safe — localhost only
```

**Option 2 — Use `ufw-docker` (or equivalent) to enforce firewall rules over Docker networks:**

For UFW specifically, the [ufw-docker](https://github.com/chaifeng/ufw-docker) project provides a script and supplemental `iptables` rules that patch Docker's networking to respect UFW policies, allowing you to use standard UFW commands to control traffic to containers:

```bash
# Install ufw-docker integration rules
sudo ufw-docker install

# Allow external access to a specific container port
sudo ufw-docker allow mycontainer 8000/tcp
```

Refer to the [Docker and iptables documentation](https://docs.docker.com/engine/network/packet-filtering-firewalls/) for a deeper explanation of how Docker interacts with the host firewall.

#### RULE \#6 - Use Linux Security Module (seccomp, AppArmor, or SELinux) for Runtime Security

**First of all, do not disable default security profile!** Always start with Docker’s or your host’s default profile as a baseline.

**Security Profile Recommendations:**

- **Seccomp**: Restrict syscalls to the minimum required for your container. Use Docker’s default seccomp profile as a starting point and customize per workload. [Docker Seccomp](https://docs.docker.com/engine/security/seccomp/)

- **AppArmor**: Apply per-container AppArmor profiles to enforce mandatory access controls. [Docker AppArmor](https://docs.docker.com/engine/security/apparmor/)

- **SELinux**: Enable SELinux on the host and ensure containers are labeled properly. Enforce SELinux policies to prevent unauthorized access to host resources. [SELinux Guide for Docker](https://docs.docker.com/engine/security/)

**Runtime Security Improvements:**

- **Behavioral Monitoring**: Use tools like [Falco](https://falco.org/), [Tetragon](https://tetragon.io/), or [Cilium eBPF](https://cilium.io/) to detect unexpected or malicious container activity. Examples: Unexpected exec calls, privilege escalation attempts, unusual network connections.

- **Anomaly Detection**: Continuously monitor container processes, filesystem changes, and network activity to identify abnormal patterns in real time.

- **Kubernetes Security Context**: Configure pods or containers with seccomp and AppArmor profiles in Kubernetes. [Configure a Security Context for a Pod or Container](https://kubernetes.io/docs/tutorials/security/seccomp/)

#### RULE \#7 - Limit resources (memory, CPU, file descriptors, processes, restarts)

The best way to avoid DoS attacks is by limiting resources. You can limit [memory](https://docs.docker.com/config/containers/resource_constraints/#memory), [CPU](https://docs.docker.com/config/containers/resource_constraints/#cpu), maximum number of restarts (`--restart=on-failure:<number_of_restarts>`), maximum number of file descriptors (`--ulimit nofile=<number>`) and maximum number of processes (`--ulimit nproc=<number>`).

[Check documentation for more details about ulimits](https://docs.docker.com/engine/reference/commandline/run/#set-ulimits-in-container---ulimit)

You can also do this for Kubernetes: [Assign Memory Resources to Containers and Pods](https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/), [Assign CPU Resources to Containers and Pods](https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/) and [Assign Extended Resources to a Container](https://kubernetes.io/docs/tasks/configure-pod-container/extended-resource/)

#### RULE \#8 - Set filesystem and volumes to read-only

**Run containers with a read-only filesystem** using `--read-only` flag. For example:

```bash
docker run --read-only alpine sh -c 'echo "whatever" > /tmp'
```

If an application inside a container has to save something temporarily, combine `--read-only` flag with `--tmpfs` like this:

```bash
docker run --read-only --tmpfs /tmp alpine sh -c 'echo "whatever" > /tmp/file'
```

The Docker Compose `compose.yml` equivalent would be:

```yaml
version: "3"
services:
  alpine:
    image: alpine
    read_only: true
```

Equivalent in Kubernetes in [Security Context](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/):

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: example
spec:
  containers:
    - name: example
      image: gcr.io/google-samples/node-hello:1.0
      securityContext:
        readOnlyRootFilesystem: true
```

In addition, if the volume is mounted only for reading **mount them as a read-only**
It can be done by appending `:ro` to the `-v` like this:

```bash
docker run -v volume-name:/path/in/container:ro alpine
```

Or by using `--mount` option:

```bash
docker run --mount source=volume-name,destination=/path/in/container,readonly alpine
```

#### RULE \#9 - Integrate container scanning tools into your CI/CD pipeline

[CI/CD pipelines](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html) are a crucial part of the software development lifecycle and should include various security checks such as lint checks, static code analysis, and container scanning.

Many issues can be prevented by following some best practices when writing the Dockerfile. However, adding a security linter as a step in the build pipeline can go a long way in avoiding further headaches. Some issues that are commonly checked are:

- Ensure a `USER` directive is specified
- Ensure the base image version is pinned
- Ensure the OS packages versions are pinned
- Avoid the use of `ADD` in favor of `COPY`
- Avoid curl bashing in `RUN` directives

References:

- [Docker Baselines on DevSec](https://dev-sec.io/baselines/docker/)
- [Use the Docker command line](https://docs.docker.com/engine/reference/commandline/cli/)
- [Overview of Docker Compose v2 CLI](https://docs.docker.com/compose/reference/overview/)
- [Configuring Logging Drivers](https://docs.docker.com/config/containers/logging/configure/)
- [View logs for a container or service](https://docs.docker.com/config/containers/logging/)
- [Dockerfile Security Best Practices](https://cloudberry.engineering/article/dockerfile-security-best-practices/)

Container scanning tools are especially important as part of a successful security strategy. They can detect known vulnerabilities, secrets and misconfigurations in container images and provide a report of the findings with recommendations on how to fix them. Some examples of popular container scanning tools are:

- Free
    - [Clair](https://github.com/quay/clair)
    - [Grype](https://github.com/anchore/grype)
    - [Trivy](https://github.com/aquasecurity/trivy)
- Commercial
    - [Snyk](https://snyk.io/) **(open source and free option available)**
    - [Anchore](https://github.com/anchore/grype/) **(open source and free option available)**
    - [Docker Scout](https://www.docker.com/products/docker-scout/) **(open source and free option available)**
    - [JFrog XRay](https://jfrog.com/xray/)
    - [Qualys](https://www.qualys.com/apps/container-security/)

To detect secrets in images:

- [ggshield](https://github.com/GitGuardian/ggshield) **(open source and free option available)**
- [Gitleaks](https://github.com/gitleaks/gitleaks) **(open source)**
- [TruffleHog](https://github.com/trufflesecurity/trufflehog) **(open source)**

To detect misconfigurations in Kubernetes:

- [kubeaudit](https://github.com/Shopify/kubeaudit)
- [kubesec.io](https://kubesec.io/)
- [kube-bench](https://github.com/aquasecurity/kube-bench)

To detect misconfigurations in Docker:

- [inspec.io](https://www.inspec.io/docs/reference/resources/docker/)
- [dev-sec.io](https://dev-sec.io/baselines/docker/)
- [Docker Bench for Security](https://github.com/docker/docker-bench-security)

#### RULE \#10 - Keep the Docker daemon logging level at `info`

By default, the Docker daemon is configured to have a base logging level of `info`. This can be verified by checking the daemon configuration file `/etc/docker/daemon.json` for the`log-level` key. If the key is not present, the default logging level is `info`. Additionally, if the docker daemon is started with the `--log-level` option, the value of the `log-level` key in the configuration file will be overridden. To check if the Docker daemon is running with a different log level, you can use the following command:

```bash
ps aux | grep '[d]ockerd.*--log-level' | awk '{for(i=1;i<=NF;i++) if ($i ~ /--log-level/) print $i}'
```

Setting an appropriate log level, configures the Docker daemon to log events that you would want to review later. A base log level of 'info' and above would capture all logs except the debug logs. Until and unless required, you should not run docker daemon at the 'debug' log level.

#### Rule \#11 - Run Docker in rootless mode

[Rootless mode](https://docs.docker.com/engine/security/rootless/#how-it-works) runs the Docker daemon and containers without host-root privileges, reducing the impact of daemon or runtime compromise. It does not guarantee protection against host privilege escalation through [kernel vulnerabilities](https://docs.docker.com/desktop/troubleshoot-and-support/faqs/linuxfaqs/#why-does-docker-desktop-for-linux-run-a-vm); the shared kernel remains part of the security boundary. Unlike rootless mode, `userns-remap` leaves the daemon running with root privileges.

Evaluate the [specific requirements](https://cheatsheetseries.owasp.org/cheatsheets/Attack_Surface_Analysis_Cheat_Sheet.html) and [security posture](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) of your environment to determine if rootless mode is the best choice for you. For environments where security is a paramount concern and the [limitations of rootless mode](https://docs.docker.com/engine/security/rootless/#known-limitations) do not interfere with operational requirements, it is a strongly recommended configuration. Alternatively consider using [Podman](#podman-as-an-alternative-to-docker) as an alternative to Docker.

> Rootless mode allows running the Docker daemon and containers as a non-root user to mitigate potential vulnerabilities in the daemon and the container runtime.
> Rootless mode does not require root privileges even during the installation of the Docker daemon, as long as the [prerequisites](https://docs.docker.com/engine/security/rootless/#prerequisites) are met.

Read more about rootless mode and its limitations, installation and usage instructions on [Docker documentation](https://docs.docker.com/engine/security/rootless/) page.

#### RULE \#12 - Utilize Docker Secrets for Sensitive Data Management

Docker Secrets provide a secure way to store and manage sensitive data such as passwords, tokens, and SSH keys. Using Docker Secrets helps in avoiding the exposure of sensitive data in container images or in runtime commands.

```bash
docker secret create my_secret /path/to/super-secret-data.txt
docker service create --name web --secret my_secret nginx:latest
```

For local Docker Compose, [file-backed secrets are bind mounts](https://docs.docker.com/compose/how-tos/use-secrets/#use-secrets). Protect the source files on the host with appropriate access permissions and storage encryption; declaring a Compose secret does not encrypt these files. This differs from [Swarm-managed secrets](https://docs.docker.com/engine/swarm/secrets/#how-docker-manages-secrets), which are distributed over mutual TLS and stored in an encrypted Raft log:

```yaml
version: "3.8"
secrets:
  my_secret:
    file: ./super-secret-data.txt
services:
  web:
    image: nginx:latest
    secrets:
      - my_secret
```

While Docker Secrets generally provide a secure way to manage sensitive data in Docker environments, this approach is not recommended for Kubernetes, where secrets are stored in plaintext by default. In Kubernetes, consider using additional security measures such as etcd encryption, or third-party tools. Refer to the [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) and [Kubernetes Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Kubernetes_Security_Cheat_Sheet.html) for more information.

#### RULE \#13 - Enhance Supply Chain Security

Building on the principles in [Rule \#9](#rule-9---integrate-container-scanning-tools-into-your-cicd-pipeline), enhancing supply chain security involves implementing additional measures to secure the entire lifecycle of container images from creation to deployment. Some of the key practices include:

- [Image Provenance](https://slsa.dev/spec/v1.0/provenance): Document the origin and history of container images to ensure traceability and integrity.
- [SBOM Generation](https://cyclonedx.org/guides/CycloneDX%20One%20Pager.pdf): Create a Software Bill of Materials (SBOM) for each image, detailing all components, libraries, and dependencies for transparency and vulnerability management.
- [Image Signing](https://github.com/notaryproject/notary): Digitally sign images to verify their integrity and authenticity, establishing trust in their security.
- [Trusted Registry](https://snyk.io/learn/container-security/container-registry-security/): Store the documented, signed images with their SBOMs in a secure registry that enforces strict [access controls](https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html) and supports metadata management.
- [Secure Deployment](https://www.openpolicyagent.org/docs/latest/#overview): Implement secure deployment polices, such as image validation, runtime security, and continuous monitoring, to ensure the security of the deployed images.

### Podman as an alternative to Docker

[Podman](https://podman.io/) is an OCI-compliant, open-source container management tool developed by [Red Hat](https://www.redhat.com/en) that provides a Docker-compatible command-line interface and a desktop application for managing containers. It is designed to be a more secure and lightweight alternative to Docker, especially for environments where secure defaults are preferred. Some of the security benefits of Podman include:

1. Daemonless Architecture: Unlike Docker, which requires a central daemon (dockerd) to create, run, and manage containers, Podman directly employs the fork-exec model. When a user requests to start a container, Podman forks from the current process, then the child process execs into the container's runtime.
2. Rootless Containers: The fork-exec model facilitates Podman's ability to run containers without requiring root privileges. When a non-root user initiates a container start, Podman forks and execs under the user's permissions.
3. SELinux Integration: Podman is built to work with SELinux, which provides an additional layer of security by enforcing mandatory access controls on containers and their interactions with the host system.

## Node.js Docker

> **Source:** [Node.js Docker](https://cheatsheetseries.owasp.org/cheatsheets/NodeJS_Docker_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

The following cheatsheet provides production-grade guidelines for building optimized and [secure Node.js Docker](https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/). You’ll find it helpful regardless of the Node.js application you aim to build. This article will be helpful for you if:

- your aim is to build a frontend application using server-side rendering (SSR) Node.js capabilities for React.
- you’re looking for advice on how to properly build a Node.js Docker image for your microservices, running Fastify, NestJS or other application frameworks.

### 1) Use explicit and deterministic Docker base image tags

It may seem to be an obvious choice to build your image based on the `node` Docker image, but what are you actually pulling in when you build the image? Docker images are always referenced by tags, and when you don’t specify a tag the default, `:latest` tag is used.

So, in fact, by specifying the following in your Dockerfile, you always build the latest version of the Docker image that has been built by the **Node.js Docker working group**:

#### FROM node

The shortcomings of building based on the default `node` image are as follows:

1. Docker image builds are inconsistent. Just like we’re using `lockfiles` to get a deterministic [`npm ci`](https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html#2-enforce-the-lockfile) behavior every time we install npm packages, we’d also like to get deterministic docker image builds. If we build the image from node—which effectively means the `node:latest` tag—then every build will pull a newly built Docker image of `node`. We don’t want to introduce this sort of non-deterministic behavior.
2. The node Docker image is based on a full-fledged operating system, full of libraries and tools that you may or may not need to run your Node.js web application. This has two downsides. Firstly a bigger image means a bigger download size which, besides increasing the storage requirement, means more time to download and re-build the image. Secondly, it means you’re potentially introducing security vulnerabilities, that may exist in all of these libraries and tools, into the image.

In fact, the `node` Docker image is quite big and includes hundreds of security vulnerabilities of different types and severities. If you’re using it, then by default your starting point is going to be a baseline of 642 security vulnerabilities, and hundreds of megabytes of image data that is downloaded on every pull and build.

The recommendations for building better Docker images are:

1. Use small Docker images—this will translate to a smaller software footprint on the Docker image reducing the potential vulnerability vectors, and a smaller size, which will speed up the image build process
2. Use the Docker image digest, which is the static SHA256 hash of the image. This ensures that you are getting deterministic Docker image builds from the base image.

Based on this, let’s ensure that we use the Long Term Support (LTS) version of Node.js, and the minimal `alpine` image type to have the smallest size and software footprint on the image:

#### FROM node:lts-alpine

Nonetheless, this base image directive will still pull new builds of that tag. We can find the `SHA256` hash for it in the [Docker Hub for this Node.js tag](https://hub.docker.com/layers/node/library/node/lts-alpine/images/sha256-51e341881c2b77e52778921c685e711a186a71b8c6f62ff2edfc6b6950225a2f?context=explore), or by running the following command once we pulled this image locally, and locate the `Digest` field in the output:

    $ docker pull node:lts-alpine
    lts-alpine: Pulling from library/node
    0a6724ff3fcd: Already exists
    9383f33fa9f3: Already exists
    b6ae88d676fe: Already exists
    565e01e00588: Already exists
    Digest: sha256:b2da3316acdc2bec442190a1fe10dc094e7ba4121d029cb32075ff59bb27390a
    Status: Downloaded newer image for node:lts-alpine
    docker.io/library/node:lts-alpine

Another way to find the `SHA256` hash is by running the following command:

    $ docker images --digests
    REPOSITORY                     TAG              DIGEST                                                                    IMAGE ID       CREATED             SIZE
    node                           lts-alpine       sha256:b2da3316acdc2bec442190a1fe10dc094e7ba4121d029cb32075ff59bb27390a   51d926a5599d   2 weeks ago         116MB

Now we can update the Dockerfile for this Node.js Docker image as follows:

    FROM node@sha256:b2da3316acdc2bec442190a1fe10dc094e7ba4121d029cb32075ff59bb27390a
    WORKDIR /usr/src/app
    COPY . /usr/src/app
    RUN npm ci
    CMD "npm" "start"

However, the Dockerfile above, only specifies the Node.js Docker image name without an image tag which creates ambiguity for which exact image tag is being used—it’s not readable, hard to maintain and doesn’t create a good developer experience.

Let’s fix it by updating the Dockerfile, providing the full base image tag for the Node.js version that corresponds to that `SHA256` hash:

    FROM node:lts-alpine@sha256:b2da3316acdc2bec442190a1fe10dc094e7ba4121d029cb32075ff59bb27390a
    WORKDIR /usr/src/app
    COPY . /usr/src/app
    RUN npm ci
    CMD "npm" "start"

### 2) Install only production dependencies in the Node.js Docker image

The following Dockerfile directive installs all dependencies in the container, including `devDependencies`, which aren’t needed for a functional application to work. It adds an unneeded security risk from packages used as development dependencies, as well as inflating the image size unnecessarily.

**`RUN npm ci`**

Enforce deterministic builds with `npm ci`. This prevents surprises in a continuous integration (CI) flow because it halts if any deviations from the lockfile are made.

In the case of building a Docker image for production we want to ensure that we only install production dependencies in a deterministic way, and this brings us to the following recommendation for the best practice for installing npm dependencies in a container image:

**`RUN npm ci --omit=dev`**

The updated Dockerfile contents in this stage are as follows:

    FROM node:lts-alpine@sha256:b2da3316acdc2bec442190a1fe10dc094e7ba4121d029cb32075ff59bb27390a
    WORKDIR /usr/src/app
    COPY . /usr/src/app
    RUN npm ci --omit=dev
    CMD "npm" "start"

### 3) Optimize Node.js tooling for production

When you build your Node.js Docker image for production, you want to ensure that all frameworks and libraries are using the optimal settings for performance and security.

This brings us to add the following Dockerfile directive:

**`ENV NODE_ENV production`**

At first glance, this looks redundant, since we already specified only production dependencies in the `npm ci` phase—so why is this necessary?

Developers mostly associate the `NODE_ENV=production` environment variable setting with the installation of production-related dependencies, however, this setting also has other effects which we need to be aware of.

Some frameworks and libraries may only turn on the optimized configuration that is suited to production if that `NODE_ENV` environment variable is set to `production`. Putting aside our opinion on whether this is a good or bad practice for frameworks to take, it is important to know this.

As an example, the [Express documentation](https://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production) outlines the importance of setting this environment variable for enabling performance and security related optimizations:

The performance impact of the `NODE_ENV` variable could be very significant.

Many of the other libraries that you are relying on may also expect this variable to be set, so we should set this in our Dockerfile.

The updated Dockerfile should now read as follows with the `NODE_ENV` environment variable setting baked in:

    FROM node:lts-alpine@sha256:b2da3316acdc2bec442190a1fe10dc094e7ba4121d029cb32075ff59bb27390a
    ENV NODE_ENV production
    WORKDIR /usr/src/app
    COPY . /usr/src/app
    RUN npm ci --omit=dev
    CMD "npm" "start"

### 4) Don’t run containers as root

The principle of least privilege is a long-time security control from the early days of Unix and we should always follow this when we’re running our containerized Node.js web applications.

The threat assessment is pretty straight-forward—if an attacker is able to compromise the web application in a way that allows for [command injection](https://owasp.org/www-community/attacks/Command_Injection) or [directory path traversal](https://owasp.org/www-community/attacks/Path_Traversal), then these will be invoked with the user who owns the application process. If that process happens to be root then they can do virtually everything within the container, including [attempting a container escape or [privilege escalation](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/03-Testing_for_Privilege_Escalation). Why would we want to risk it? You’re right, we don’t.

Repeat after me: **“friends don’t let friends run containers as root!”**

The official `node` Docker image, as well as its variants like `alpine`, include a least-privileged user of the same name: `node`. However, it’s not enough to just run the process as `node`. For example, the following might not be ideal for an application to function well:

    USER node
    CMD "npm" "start"

The reason for that is the `USER` Dockerfile directive only ensures that the process is owned by the `node` user. What about all the files we copied earlier with the `COPY` instruction? They are owned by root. That’s how Docker works by default.

The complete and proper way of dropping privileges is as follows, also showing our up to date Dockerfile practices up to this point:

    FROM node:lts-alpine@sha256:b2da3316acdc2bec442190a1fe10dc094e7ba4121d029cb32075ff59bb27390a
    ENV NODE_ENV production
    WORKDIR /usr/src/app
    COPY --chown=node:node . /usr/src/app
    RUN npm ci --omit=dev
    USER node
    CMD "npm" "start"

### 5) Properly handle events to safely terminate a Node.js Docker web application

One of the most common mistakes I see with blogs and articles about containerizing Node.js applications when running in Docker containers is the way that they invoke the process. All of the following and their variants are bad patterns you should avoid:

- `CMD “npm” “start”`
- `CMD [“yarn”, “start”]`
- `CMD “node” “server.js”`
- `CMD “start-app.sh”`

Let’s dig in! I’ll walk you through the differences between them and why they’re all patterns to avoid.

The following concerns are key to understanding the context for properly running and terminating Node.js Docker applications:

1. An orchestration engine, such as Docker Swarm, Kubernetes, or even just Docker engine itself, needs a way to send signals to the process in the container. Mostly, these are signals to terminate an application, such as `SIGTERM` and `SIGKILL`.
2. The process may run indirectly, and if that happens then it’s not always guaranteed that it will receive these signals.
3. The Linux kernel treats processes that run as process ID 1 (PID) differently than any other process ID.

Equipped with that knowledge, let’s begin investigating the ways of invoking the process for a container, starting off with the example from the Dockerfile we’re building:

**`CMD "npm" "start"`**

The caveat here is two fold. Firstly, we’re indirectly running the node application by directly invoking the npm client. Who’s to say that the npm CLI forwards all events to the node runtime? It actually doesn’t, and we can easily test that.

Make sure that in your Node.js application you set an event handler for the `SIGHUP` signal which logs to the console every time you’re sending an event. A simple code example should look as follows:

    function handle(signal) {
       console.log(`*^!@4=> Received event: ${signal}`)
    }
    process.on('SIGHUP', handle)

Then run the container, and once it’s up specifically send it the `SIGHUP` signal using the `docker` CLI and the special `--signal` command-line flag:

**`$ docker kill --signal=SIGHUP elastic_archimedes`**

Nothing happened, right? That’s because the npm client doesn’t forward any signals to the node process that it spawned.

The other caveat has to do with the different ways in which way you can specify the `CMD` directive in the Dockerfile. There are two ways, and they are not the same:

1. the shellform notation, in which the container spawns a shell interpreter that wraps the process. In such cases, the shell may not properly forward signals to your process.
2. the execform notation, which directly spawns a process without wrapping it in a shell. It is specified using the JSON array notation, such as: `CMD [“npm”, “start”]`. Any signals sent to the container are directly sent to the process.

Based on that knowledge, we want to improve our Dockerfile process execution directive as follows:

**`CMD ["node", "server.js"]`**

We are now invoking the node process directly, ensuring that it receives all of the signals sent to it, without it being wrapped in a shell interpreter.

However, this introduces another pitfall.

When processes run as PID 1 they effectively take on some of the responsibilities of an init system, which is typically responsible for initializing an operating system and processes. The kernel treats PID 1 in a different way than it treats other process identifiers. This special treatment from the kernel means that the handling of a `SIGTERM` signal to a running process won’t invoke a default fallback behavior of killing the process if the process doesn’t already set a handler for it.

<!-- textlint-disable terminology -->
To [quote the Node.js Docker working group recommendation](https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md#handling-kernel-signals) on this:  “Node.js was not designed to run as PID 1 which leads to unexpected behaviour when running inside of Docker. For example, a Node.js process running as PID 1 will not respond to SIGINT (CTRL-C) and similar signals”.
<!-- textlint-enable terminology -->

The way to go about it then is to use a tool that will act like an init process, in that it is invoked with PID 1, then spawns our Node.js application as another process while ensuring that all signals are proxied to that Node.js process. If possible, we’d like a small as possible tooling footprint for doing so to not risk having security vulnerabilities added to our container image.

One such tool is [dumb-init](https://engineeringblog.yelp.com/2016/01/dumb-init-an-init-for-docker.html) which is statically linked and has a small footprint. Here’s how we’ll set it up:

    RUN apk add dumb-init
    CMD ["dumb-init", "node", "server.js"]

This brings us to the following up to date Dockerfile. You’ll notice that we placed the `dumb-init` package install right after the image declaration, so we can take advantage of Docker’s caching of layers:

    FROM node:lts-alpine@sha256:b2da3316acdc2bec442190a1fe10dc094e7ba4121d029cb32075ff59bb27390a
    RUN apk add dumb-init
    ENV NODE_ENV production
    WORKDIR /usr/src/app
    COPY --chown=node:node . .
    RUN npm ci --omit=dev
    USER node
    CMD ["dumb-init", "node", "server.js"]

Good to know: `docker kill` and `docker stop` commands only send signals to the container process with PID 1. If you’re running a shell script that runs your Node.js application, then take note that a shell instance—such as `/bin/sh`, for example—doesn’t forward signals to child processes, which means your app will never get a `SIGTERM`.

### 6) Graceful tear down for your Node.js web applications

If we’re already discussing process signals that terminate applications, let’s make sure we’re shutting them down properly and gracefully without disrupting users.

When a Node.js application receives an interrupt signal, also known as `SIGINT`, or `CTRL+C`, it will cause an abrupt process kill, unless any event handlers were set of course to handle it in a different behavior. This means that connected clients to a web application will be immediately disconnected. Now, imagine hundreds of Node.js web containers orchestrated by Kubernetes, going up and down as needs arise to scale or manage errors. Not the greatest user experience.

You can easily simulate this problem. Here’s a stock Fastify web application example, with an inherent delayed response of 60 seconds for an endpoint:

    fastify.get('/delayed', async (request, reply) => {
     const SECONDS_DELAY = 60000
     await new Promise(resolve => {
         setTimeout(() => resolve(), SECONDS_DELAY)
     })
     return { hello: 'delayed world' }
    })

    const start = async () => {
     try {
       await fastify.listen(PORT, HOST)
       console.log(`*^!@4=> Process id: ${process.pid}`)
     } catch (err) {
       fastify.log.error(err)
       process.exit(1)
     }
    }

    start()

Run this application and once it’s running send a simple HTTP request to this endpoint:

`$ time curl https://localhost:3000/delayed`

Hit `CTRL+C` in the running Node.js console window and you’ll see that the curl request exited abruptly. This simulates the same experience your users would receive when containers tear down.

To provide a better experience, we can do the following:

1. Set an event handler for the various termination signals like `SIGINT` and `SIGTERM`.
2. The handler waits for clean up operations like database connections, ongoing HTTP requests and others.
3. The handler then terminates the Node.js process.

Specifically with Fastify, we can have our handler call on [fastify.close()](https://fastify.dev/docs/latest/Reference/Server/#close) which returns a promise that we will await, and Fastify will also take care to respond to every new connection with the HTTP status code 503 to signal that the application is unavailable.

Let’s add our event handler:

    async function closeGracefully(signal) {
       console.log(`*^!@4=> Received signal to terminate: ${signal}`)

       await fastify.close()
       // await db.close() if we have a db connection in this app
       // await other things we should cleanup nicely
       process.exit()
    }
    process.on('SIGINT', closeGracefully)
    process.on('SIGTERM', closeGracefully)

Admittedly, this is more of a generic web application concern than Dockerfile related, but is even more important in orchestrated environments.

### 7) Find and fix security vulnerabilities in your Node.js docker image

See [Docker Security Cheat Sheet - Use static analysis tools](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html#rule-9-use-static-analysis-tools)

### 8) Use multi-stage builds

Multi-stage builds are a great way to move from a simple, yet potentially erroneous Dockerfile, into separated steps of building a Docker image, so we can avoid leaking sensitive information. Not only that, but we can also use a bigger Docker base image to install our dependencies, compile any native npm packages if needed, and then copy all these artifacts into a small production base image, like our alpine example.

#### Prevent sensitive information leak

The use-case here to avoid sensitive information leakage is more common than you think.

If you’re building Docker images for work, there’s a high chance that you also maintain private npm packages. If that’s the case, then you probably needed to find some way to make that secret `NPM_TOKEN` available to the npm install.

Here’s an example for what I’m talking about:

    FROM node:lts-alpine@sha256:b2da3316acdc2bec442190a1fe10dc094e7ba4121d029cb32075ff59bb27390a
    RUN apk add dumb-init
    ENV NODE_ENV production
    ENV NPM_TOKEN 1234
    WORKDIR /usr/src/app
    COPY --chown=node:node . .
    #RUN npm ci --omit=dev
    RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc && \
       npm ci --omit=dev
    USER node
    CMD ["dumb-init", "node", "server.js"]

Doing this, however, leaves the `.npmrc` file with the secret npm token inside the Docker image. You could attempt to improve it by deleting it afterwards, like this:

    RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc && \
       npm ci --omit=dev
    RUN rm -rf .npmrc

However, now the `.npmrc` file is available in a different layer of the Docker image. If this Docker image is public, or someone is able to access it somehow, then your token is compromised. A better improvement would be as follows:

    RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc && \
       npm ci --omit=dev; \
       rm -rf .npmrc

The problem now is that the Dockerfile itself needs to be treated as a secret asset, because it contains the secret npm token inside it.

Luckily, Docker supports a way to pass arguments into the build process:

    ARG NPM_TOKEN
    RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc && \
       npm ci --omit=dev; \
       rm -rf .npmrc

And then we build it as follows:

**`$ docker build . -t nodejs-tutorial --build-arg NPM_TOKEN=1234`**

I know you were thinking that we’re all done at this point but, sorry to disappoint 🙂

That’s how it is with security—sometimes the obvious things are yet just another pitfall.

What’s the problem now, you ponder? Build arguments passed like that to Docker are kept in the history log. Let’s see with our own eyes. Run this command:

**`$ docker history nodejs-tutorial`**

which prints the following:

    IMAGE          CREATED              CREATED BY                                      SIZE      COMMENT
    b4c2c78acaba   About a minute ago   CMD ["dumb-init" "node" "server.js"]            0B        buildkit.dockerfile.v0
    <missing>      About a minute ago   USER node                                       0B        buildkit.dockerfile.v0
    <missing>      About a minute ago   RUN |1 NPM_TOKEN=1234 /bin/sh -c echo "//reg…   5.71MB    buildkit.dockerfile.v0
    <missing>      About a minute ago   ARG NPM_TOKEN                                   0B        buildkit.dockerfile.v0
    <missing>      About a minute ago   COPY . . # buildkit                             15.3kB    buildkit.dockerfile.v0
    <missing>      About a minute ago   WORKDIR /usr/src/app                            0B        buildkit.dockerfile.v0
    <missing>      About a minute ago   ENV NODE_ENV=production                         0B        buildkit.dockerfile.v0
    <missing>      About a minute ago   RUN /bin/sh -c apk add dumb-init # buildkit     1.65MB    buildkit.dockerfile.v0

Did you spot the secret npm token there? That’s what I mean.

There’s a great way to manage secrets for the container image, but this is the time to introduce multi-stage builds as a mitigation for this issue, as well as showing how we can build minimal images.

#### Introducing multi-stage builds for Node.js Docker images

Just like that principle in software development of Separation of Concerns, we’ll apply the same ideas in order to build our Node.js Docker images. We’ll have one image that we use to build everything that we need for the Node.js application to run, which in a Node.js world, means installing npm packages, and compiling native npm modules if necessary. That will be our first stage.

The second Docker image, representing the second stage of the Docker build, will be the production Docker image. This second and last stage is the image that we actually optimize for and publish to a registry, if we have one. That first image that we’ll refer to as the `build` image, gets discarded and is left as a dangling image in the Docker host that built it, until it gets cleaned.

Here is the update to our Dockerfile that represents our progress so far, but separated into two stages:

    # --------------> The build image
    FROM node:latest AS build
    ARG NPM_TOKEN
    WORKDIR /usr/src/app
    COPY package*.json /usr/src/app/
    RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc && \
       npm ci --omit=dev && \
       rm -f .npmrc

    # --------------> The production image
    FROM node:lts-alpine@sha256:b2da3316acdc2bec442190a1fe10dc094e7ba4121d029cb32075ff59bb27390a
    RUN apk add dumb-init
    ENV NODE_ENV production
    USER node
    WORKDIR /usr/src/app
    COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
    COPY --chown=node:node . /usr/src/app
    CMD ["dumb-init", "node", "server.js"]

As you can see, I chose a bigger image for the `build` stage because I might need tooling like `gcc` (the GNU Compiler Collection) to compile native npm packages, or for other needs.

In the second stage, there’s a special notation for the `COPY` directive that copies the `node_modules/` folder from the build Docker image into this new production base image.

Also, now, do you see that `NPM_TOKEN` passed as build argument to the `build` intermediary Docker image? It’s not visible anymore in the `docker history nodejs-tutorial` command output because it doesn’t exist in our production docker image.

### 9) Keeping unnecessary files out of your Node.js Docker images

You have a `.gitignore` file to avoid polluting the git repository with unnecessary files, and potentially sensitive files too, right? The same applies to Docker images.

Docker has a `.dockerignore` which will ensure it skips sending any glob pattern matches inside it to the Docker daemon. Here is a list of files to give you an idea of what you might be putting into your Docker image that we’d ideally want to avoid:

    .dockerignore
    node_modules
    npm-debug.log
    Dockerfile
    .git
    .gitignore

As you can see, the `node_modules/` is actually quite important to skip because if we hadn’t ignored it, then the simplistic Dockerfile version that we started with would have caused the local `node_modules/` folder to be copied over to the container as-is.

    FROM node@sha256:b2da3316acdc2bec442190a1fe10dc094e7ba4121d029cb32075ff59bb27390a
    WORKDIR /usr/src/app
    COPY . /usr/src/app
    RUN npm ci
    CMD "npm" "start"

In fact, it’s even more important to have a `.dockerignore` file when you are practicing multi-stage Docker builds. To refresh your memory on how the 2nd stage Docker build looks like:

    # --------------> The production image
    FROM node:lts-alpine
    RUN apk add dumb-init
    ENV NODE_ENV production
    USER node
    WORKDIR /usr/src/app
    COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
    COPY --chown=node:node . /usr/src/app
    CMD ["dumb-init", "node", "server.js"]

The importance of having a `.dockerignore` is that when we do a `COPY . /usr/src/app` from the 2nd Dockerfile stage, we’re also copying over any local node\_modules/ to the Docker image. That’s a big no-no as we may be copying over modified source code inside `node_modules/`.

On top of that, since we’re using the wildcard `COPY .` we may also be copying into the Docker image sensitive files that include credentials or local configuration.

The take-away here for a `.dockerignore` file is:

- Skip potentially modified copies of `node_modules/` in the Docker image.
- Saves you from secrets exposure such as credentials in the contents of `.env` or `aws.json` files making their way into the Node.js Docker image.
- It helps speed up Docker builds because it ignores files that would have otherwise caused a cache invalidation. For example, if a log file was modified, or a local environment configuration file, all would’ve caused the Docker image cache to invalidate at that layer of copying over the local directory.

### 10) Mounting secrets into the Docker build image

One thing to note about the `.dockerignore` file is that it is an all or nothing approach and can’t be turned on or off per build stages in a Docker multi-stage build.

Why is it important? Ideally, we would want to use the `.npmrc` file in the build stage, as we may need it because it includes a secret npm token to access private npm packages. Perhaps it also needs a specific proxy or registry configuration to pull packages from.

This means that it makes sense to have the `.npmrc` file available to the `build` stage—however, we don’t need it at all in the second stage for the production image, nor do we want it there as it may include sensitive information, like the secret npm token.

One way to mitigate this `.dockerignore` caveat is to mount a local file system that will be available for the build stage, but there’s a better way.

Docker supports a relatively new capability referred to as Docker secrets, and is a natural fit for the case we need with `.npmrc`. Here is how it works:

- When we run the `docker build` command we will specify command-line arguments that define a new secret ID and reference a file as the source of the secret.
- In the Dockerfile, we will add flags to the `RUN` directive to install the production npm, which mounts the file referred by the secret ID into the target location—the local directory `.npmrc` file which is where we want it available.
- The `.npmrc` file is mounted as a secret and is never copied into the Docker image.
- Lastly, let’s not forget to add the `.npmrc` file to the contents of the `.dockerignore` file so it doesn’t make it into the image at all, for either the build nor production images.

Let’s see how all of it works together. First the updated `.dockerignore` file:

    .dockerignore
    node_modules
    npm-debug.log
    Dockerfile
    .git
    .gitignore
    .npmrc

Then, the complete Dockerfile, with the updated RUN directive to install npm packages while specifying the `.npmrc` mount point:

    # --------------> The build image
    FROM node:latest AS build
    WORKDIR /usr/src/app
    COPY package*.json /usr/src/app/
    RUN --mount=type=secret,mode=0644,id=npmrc,target=/usr/src/app/.npmrc npm ci --omit=dev

    # --------------> The production image
    FROM node:lts-alpine
    RUN apk add dumb-init
    ENV NODE_ENV production
    USER node
    WORKDIR /usr/src/app
    COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
    COPY --chown=node:node . /usr/src/app
    CMD ["dumb-init", "node", "server.js"]

And finally, the command that builds the Node.js Docker image:

    docker build . -t nodejs-tutorial --secret id=npmrc,src=.npmrc

**Note:** Secrets are a new feature in Docker and if you’re using an older version, you might need to enable it Buildkit as follows:

    DOCKER_BUILDKIT=1 docker build . -t nodejs-tutorial --build-arg NPM_TOKEN=1234 --secret id=npmrc,src=.npmrc

## Kubernetes Security

> **Source:** [Kubernetes Security](https://cheatsheetseries.owasp.org/cheatsheets/Kubernetes_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Overview

This cheat sheet provides a starting point for securing a Kubernetes cluster. It is divided into the following categories:

- Receive Alerts for Kubernetes Updates
- INTRODUCTION: What is Kubernetes?
- Securing Kubernetes hosts
- Securing Kubernetes components
- Using the Kubernetes dashboard
- Kubernetes Security Best Practices: Build Phase
- Kubernetes Security Best Practices: Deploy Phase
- Kubernetes Security Best Practices: Runtime Phase

For more information about Kubernetes, refer to the Appendix.

### Receive Alerts for Security Updates and Reporting Vulnerabilities

Join the kubernetes-announce group (<https://kubernetes.io/docs/reference/issues-security/security/>) for emails about security announcements. See the security reporting page (<https://kubernetes.io/docs/reference/issues-security/security>) for more on how to report vulnerabilities.

### INTRODUCTION: What Is Kubernetes?

Kubernetes is an open source container orchestration engine for automating deployment, scaling, and management of containerized applications. The open source project is hosted by the Cloud Native Computing Foundation (CNCF).

When you deploy Kubernetes, you get a cluster. A Kubernetes cluster consists of a set of worker machines, called nodes that run containerized applications. The control plane manages the worker nodes and the Pods in the cluster.

#### Control Plane Components

The control plane's components make global decisions about the cluster, as well as detecting and responding to cluster events. It consists of components such as kube-apiserver, etcd, kube-scheduler, kube-controller-manager and cloud-controller-manager.

**Component:** kube-apiserver
**Description:** Exposes the Kubernetes API. The API server is the front end for the Kubernetes control plane.

**Component:** etcd
**Description:** A consistent and highly-available key-value store used as Kubernetes' backing store for all cluster data.

**Component:** kube-scheduler
**Description:** Watches for newly created Pods with no assigned node, and selects a node for them to run on.

**Component:** kube-controller-manager
**Description:** Runs controller processes. Logically, each controller is a separate process, but to reduce complexity, they are all compiled into a single binary and run in a single process.

**Component:** cloud-controller-manager
**Description:** The cloud controller manager lets you link your cluster into your cloud provider's API, and separates out the components that interact with that cloud platform from components that just interact with your cluster.

#### Node Components

Node components run on every node, maintaining running pods and providing the Kubernetes runtime environment. It consists of components such as kubelet, kube-proxy and container runtime.

**Component:** kubelet
**Description:** An agent that runs on each node in the cluster. It makes sure that containers are running in a Pod.

**Component:** kube-proxy
**Description:** A network proxy that runs on each node in your cluster, implementing part of the Kubernetes Service concept.

**Container:** runtime
**Description:** The container runtime is the software that is responsible for running containers |

### SECTION 1: Securing Kubernetes Hosts

Kubernetes can be deployed in different ways: on bare metal, on-premise, and in the public cloud (a custom Kubernetes build on virtual machines OR use a managed service). Since Kubernetes is designed to be highly portable, customers can easily and migrate their workloads and switch between multiple installations.

Because Kubernetes can be designed to fit a large variety of scenarios, this flexibility is a weakness when it comes to securing Kubernetes clusters. The engineers responsible for deploying the Kubernetes platform must know about all the potential attack vectors and vulnerabilities for their clusters.

To harden the underlying hosts for Kubernetes clusters, we recommend that you install the latest version of the operating systems, harden the operating systems, implement necessary patch management and configuration management systems, implement essential firewall rules and undertake specific datacenter-based security measures.

#### Updating Kubernetes

Since no one can track all potential attack vectors for your Kubernetes cluster, the first and best defense is to always run the latest stable version of Kubernetes.

In case vulnerabilities are found in running containers, it is recommended to always update the source image and redeploy the containers. **Try to avoid direct updates to the running containers as this can break the image-container relationship.**

```
Example: apt-update
```

**Upgrading containers is extremely easy with the Kubernetes rolling updates feature - this allows gradually updating a running application by upgrading its images to the latest version.**

##### Release schedule for Kubernetes

The Kubernetes project maintains release branches for the most recent three minor releases and it backports the applicable fixes, including security fixes, to those three release branches, depending on severity and feasibility. Patch releases are cut from those branches at a regular cadence, plus additional urgent releases, when required. Hence it is always recommended to upgrade the Kubernetes cluster to the latest available stable version. It is recommended to refer to the version skew policy for further details <https://kubernetes.io/docs/setup/release/version-skew-policy/>.

There are several techniques such as rolling updates, and node pool migrations that allow you to complete an update with minimal disruption and downtime.

--

### SECTION 2: Securing Kubernetes Components

This section discusses how to secure Kubernetes components. It covers the following topics:

- Securing the Kubernetes Dashboard
- Restricting access to etcd (Important)
- Controlling network access to sensitive ports
- Controlling access to the Kubernetes API
- Implementing role-based access control in Kubernetes
- Limiting access to Kubelets

--

#### Securing the Kubernetes Dashboard

The Kubernetes dashboard is a webapp for managing your cluster. It is not a part of the Kubernetes cluster itself, it has to be installed by the owners of the cluster. Thus, there are a lot of tutorials on how to do this. Unfortunately, most of them create a service account with very high privileges. This caused Tesla and some others to be hacked via such a poorly configured K8s dashboard. (Reference: Tesla cloud resources are hacked to run cryptocurrency-mining malware - <https://arstechnica.com/information-technology/2018/02/tesla-cloud-resources-are-hacked-to-run-cryptocurrency-mining-malware/>)

To prevent attacks via the dashboard, you should follow some tips:

- Do not expose the dashboard without additional authentication to the public. There is no need to access such a powerful tool from outside your LAN
- Turn on Role-Based Access Control (see below), so you can limit the service account the dashboard uses
- Do not grant the service account of the dashboard high privileges
- Grant permissions per user, so each user only can see what they are supposed to see
- If you are using network policies, you can block requests to the dashboard even from internal pods (this will not affect the proxy tunnel via kubectl proxy)
- Before version 1.8, the dashboard had a service account with full privileges, so check that there is no role binding for cluster-admin left.
- Deploy the dashboard with an authenticating reverse proxy, with multi-factor authentication enabled. This can be done with either embedded OIDC `id_tokens` or using Kubernetes Impersonation. This allows you to use the dashboard with the user's credentials instead of using a privileged `ServiceAccount`. This method can be used on both on-prem and managed cloud clusters.

--

#### Restricting Access To etcd (IMPORTANT)

etcd is a critical Kubernetes component which stores information on states and secrets, and it should be protected differently from the rest of your cluster. Write access to the API server's etcd is equivalent to gaining root on the entire cluster, and even read access can be used to escalate privileges fairly easily.

The Kubernetes scheduler will search etcd for pod definitions that do not have a node. It then sends the pods it finds to an available kubelet for scheduling. Validation for submitted pods is performed by the API server before it writes them to etcd, so malicious users writing directly to etcd can bypass many security mechanisms - e.g. PodSecurityPolicies.

Administrators should always use strong credentials from the API servers to their etcd server, such as mutual auth via TLS client certificates, and it is often recommended to isolate the etcd servers behind a firewall that only the API servers may access.

##### Limiting access to the primary etcd instance

Allowing other components within the cluster to access the primary etcd instance with read or write access to the full keyspace is equivalent to granting cluster-admin access. Using separate etcd instances for other components or using etcd ACLs to restrict read and write access to a subset of the keyspace is strongly recommended.

--

#### Controlling Network Access to Sensitive Ports

It is highly recommended to configure authentication and authorization on the cluster and cluster nodes. Since Kubernetes clusters usually listen on a range of well-defined and distinctive ports, it is easier for attackers to identify the clusters and attack them.

An overview of the default ports used in Kubernetes is provided below. Make sure that your network blocks access to ports, and you should seriously consider limiting access to the Kubernetes API server to trusted networks.

**Control plane node(s):**

| Protocol | Port Range | Purpose                 |
| -------- | ---------- | ----------------------- |
| TCP      | 6443       | Kubernetes API Server   |
| TCP      | 2379-2380  | etcd server client API  |
| TCP      | 10250      | Kubelet API             |
| TCP      | 10259      | kube-scheduler          |
| TCP      | 10257      | kube-controller-manager |
| TCP      | 10255      | Read-Only Kubelet API   |

**Worker nodes:**

| Protocol | Port Range  | Purpose                |
| -------- | ----------- | ---------------------- |
| TCP      | 10248       | Kubelet Healthz API    |
| TCP      | 10249       | Kube-proxy Metrics API |
| TCP      | 10250       | Kubelet API            |
| TCP      | 10255       | Read-Only Kubelet API  |
| TCP      | 10256       | Kube-proxy Healthz API |
| TCP      | 30000-32767 | NodePort Services      |

--

#### Controlling Access To The Kubernetes API

The first line of defense of Kubernetes against attackers is limiting and securing access to API requests, because those requests are used to control the Kubernetes platform. For more information, refer to the documentation at <https://kubernetes.io/docs/reference/access-authn-authz/controlling-access/>.

This part contains the following topics:

- How Kubernetes handles API authorization
- External API Authentication for Kubernetes (recommended)
- Kubernetes Built-In API Authentication (not recommended)
- Implementing role-based access in Kubernetes
- Limiting access to Kubelets

--

##### How Kubernetes handles API authorization

In Kubernetes, you must be authenticated (logged in) before your request can be authorized (granted permission to access), and Kubernetes expects attributes that are common to REST API requests. This means that existing organization-wide or cloud-provider-wide access control systems which may handle other APIs work with Kubernetes authorization.

When Kubernetes authorizes API requests using the API server, permissions are denied by default. It evaluates all of the request attributes against all policies and allows or denies the request. All parts of an API request must be allowed by some policy in order to proceed.

--

##### External API Authentication for Kubernetes (RECOMMENDED)

Due to the weakness of Kubernetes' internal mechanisms for authenticating APIs, we strongly recommended that larger or production clusters use one of the external API authentication methods.

- [OpenID Connect](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#openid-connect-tokens) (OIDC) lets you externalize authentication, use short lived tokens, and leverage centralized groups for authorization.
- Managed Kubernetes distributions such as GKE, EKS and AKS support authentication using credentials from their respective IAM providers.
- [Kubernetes Impersonation](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation) can be used with both managed cloud clusters and on-prem clusters to externalize authentication without having to have access to the API server configuration parameters.

In addition to choosing the appropriate authentication system, API access should be considered privileged and use Multi-Factor Authentication (MFA) for all user access.

For more information, consult Kubernetes authentication reference documentation at <https://kubernetes.io/docs/reference/access-authn-authz/authentication>.

--

##### Options for Kubernetes Built-In API Authentication (NOT RECOMMENDED)

Kubernetes provides a number of internal mechanisms for API server authentication but these are usually only suitable for non-production or small clusters. We will briefly discuss each internal mechanism and explain why you should not use them.

- [Static Token File](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#static-token-file): Authentication makes use of clear text tokens stored in a CSV file on API server node(s). WARNING: You cannot modify credentials in this file until the API server is restarted.

- [X509 Client Certs](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#x509-client-certs) are available but are unsuitable for production use, since Kubernetes does [not support certificate revocation](https://github.com/kubernetes/kubernetes/issues/18982). As a result, these user credentials cannot be modified or revoked without rotating the root certificate authority key and re-issuing all cluster certificates.

- [Service Accounts Tokens](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#service-account-tokens) are also available for authentication. Their primary intended use is to allow workloads running in the cluster to authenticate to the API server, however they can also be used for user authentication.

--

#### Implementing Role-Based Access Control in Kubernetes

Role-based access control (RBAC) is a method for regulating access to computer or network resources based on the roles of individual users within your organization. Fortunately, Kubernetes comes with an integrated Role-Based Access Control (RBAC) component with default roles that allow you to define user responsibilities depending on what actions a client might want to perform. You should use the Node and RBAC authorizers together in combination with the NodeRestriction admission plugin.

The RBAC component matches an incoming user or group to a set of permissions linked to roles. These permissions combine verbs (get, create, delete) with resources (pods, services, nodes) and can be namespace or cluster scoped. RBAC authorization uses the rbac.authorization.k8s.io API group to drive authorization decisions, allowing you to dynamically configure policies through the Kubernetes API.

To enable RBAC, start the API server with the --authorization-mode flag set to a comma-separated list that includes RBAC; for example:

```bash
kube-apiserver --authorization-mode=Example,RBAC --other-options --more-options
```

For detailed examples of utilizing RBAC, refer to Kubernetes documentation at <https://kubernetes.io/docs/reference/access-authn-authz/rbac>

--

#### Limiting access to the Kubelets

Kubelets expose HTTPS endpoints which grant powerful control over the node and containers. By default Kubelets allow unauthenticated access to this API. Production clusters should enable Kubelet authentication and authorization.

For more information, refer to Kubelet authentication/authorization documentation at <https://kubernetes.io/docs/reference/access-authn-authz/kubelet-authn-authz/>

--

### SECTION 3: Kubernetes Security Best Practices: Build Phase

During the build phase, you should secure your Kubernetes container images by building secure images and scanning those images for any known vulnerabilities.

--

#### What is a container image?

A container image (CI) is an immutable, lightweight, standalone package that contains everything required to run an application — the application code, runtime, system libraries, configuration and system tools. Images are built as layered, read-only artifacts that are portable between hosts but share the host machine’s operating system kernel. See Docker: What is a container? (<https://www.docker.com/resources/what-container>).

Your CIs must be built on a approved and secure base image. This base image must be scanned and monitored at regular intervals to ensure that all CIs are based on a secure and authentic image. Implement strong governance policies that determine how images are built and stored in trusted image registries.

--

##### Ensure that CIs are up to date

Ensure your images (and any third-party tools you include) are up-to-date and use the latest versions of their components.

--

#### Only use authorized images in Your environment

Downloading and running CIs from unknown sources is very dangerous. Make sure that only images adhering to the organization’s policy are allowed to run, or else the organization is open to risk of running vulnerable or even malicious containers.

--

#### Use A CI Pipeline To Control and Identify Vulnerabilities

The Kubernetes container registry serves as a central repository of all container images in the system. Depending on your needs, you can utilize a public repository or have a private repository as the container registry. We recommend that you store your approved images in a private registry and only push approved images to these registries, which automatically reduces the number of potential images that enter your pipeline down to a fraction of the hundreds of thousands of publicly available images.

Also, we strongly recommend that you add a CI pipeline that integrates security assessment (like vulnerability scanning) into the build process. This pipeline should vet all code that is approved for production and is used to build the images. After an image is built, it should be scanned for security vulnerabilities. Only if no issues are found, then the image would be pushed to a private registry then deployed to production. If the security assessment mechanism fails any code, it should create a failure in the pipeline, which will help you find images with security problems and prevent them from entering the image registry.

Many source code repositories provide scanning capabilities (e.g. [Github](https://docs.github.com/en/code-security/supply-chain-security), [GitLab](https://docs.gitlab.com/ee/user/application_security/container_scanning/index.html)), and many CI tools offer integration with open source vulnerability scanners such as [Trivy](https://github.com/aquasecurity/trivy) or [Grype](https://github.com/anchore/grype).

Projects are developing image authorization plugins for Kubernetes that prevent unauthorized images from shipping. For more information, refer to the PR <https://github.com/kubernetes/kubernetes/pull/27129>.

--

#### Minimize Features in All CIs

As a best practice, Google and other tech giants have strictly limiting the code in their runtime container for years. This approach improves the signal-to-noise of scanners (e.g. CVE) and reduces the burden of establishing provenance to just what you need.

Consider using minimal CIs such as distroless images (see below). If this is not possible, do not include OS package managers or shells in CIs because they may have unknown vulnerabilities. If you absolutely must include any OS packages, remove the package manager at a later step in the generation process.

--

##### Use distroless or empty images when possible

Distroless images sharply reduce the attack surface because they do not include shells and contain fewer packages than other images. For more information on distroless images, refer to <https://github.com/GoogleContainerTools/distroless>.

An empty image, ideal for statically compiled languages like Go, because the image is empty - the attack surface it is truly minimal - only your code!

For more information, refer to <https://hub.docker.com/_/scratch>

---

### SECTION 4: Kubernetes Security Best Practices: Deploy Phase

Once a Kubernetes infrastructure is in place, you must configure it securely before any workloads are deployed. And as you configure your infrastructure, ensure that you have visibility into what CIs are being deployed and how they are being deployed or else you will not be able to identify and respond to security policy violations. Before deployment, your system should know and be able to tell you:

- **What is being deployed** - including information about the image being used, such as components or vulnerabilities, and the pods that will be deployed.
- **Where it is going to be deployed** - which clusters, namespaces, and nodes.
- **How it is deployed** - whether it runs privileged, what other deployments it can communicate with, the pod security context that is applied, if any.
- **What it can access** - including secrets, volumes, and other infrastructure components such as the host or orchestrator API.
- **Is it compliant?** - whether it complies with your policies and security requirements.

--

#### Code that uses namespaces to isolate Kubernetes resources

Namespaces give you the ability to create logical partitions, enforce separation of your resources and limit the scope of user permissions.

--

##### Setting the namespace for a request

To set the namespace for a current request, use the --namespace flag. Refer to the following examples:

```bash
kubectl run nginx --image=nginx --namespace=<insert-namespace-name-here>
kubectl get pods --namespace=<insert-namespace-name-here>
```

--

##### Setting the namespace preference

You can permanently save the namespace for all subsequent kubectl commands in that context with:

```bash
kubectl config set-context --current --namespace=<insert-namespace-name-here>
```

Then validate it with the following command:

```bash
kubectl config view --minify | grep namespace:
```

Learn more about namespaces at <https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces>

--

#### Use the ImagePolicyWebhook to govern image provenance

We strongly recommend that you use the admission controller ImagePolicyWebhook to prevent unapproved images from being used, reject pods that use unapproved images, and refuse CIs that meet the following criteria:

- Images that haven’t been scanned recently
- Images that use a base image that’s not explicitly allowed
- Images from insecure registries

Learn more about webhook at <https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#imagepolicywebhook>

--

#### Implement continuous security vulnerability scanning

Since new vulnerabilities are always being discovered, you may not always know if your containers may have recently-disclosed vulnerabilities (CVEs) or outdated packages. To maintain a strong security posture, do regular production scanning of first-party containers (applications you have built and previously scanned) as well as third-party containers (which are sourced from trusted repository and vendors).

Open Source projects such as [Trivy](https://github.com/aquasecurity/trivy), [Grype](https://github.com/anchore/grype), and [Clair](https://github.com/quay/clair) can assist in identifying and prioritizing vulnerabilities.

--

#### Apply security context to your pods and containers

Use [Pod and container security contexts](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/) to restrict process privileges and filesystem access. Set `readOnlyRootFilesystem: true` in each container's `securityContext` to prevent writes to its root filesystem. This does not make mounted volumes read-only or prevent attacks that do not require filesystem writes.

When you are configuring the security context for your pods, only grant the privileges that are needed for the resources to function in your containers and volumes. Some of the important parameters in the security context property are:

Security Context Settings:

1. SecurityContext->**runAsNonRoot**
   Description: Indicates that containers should run as non-root user.

2. SecurityContext->**Capabilities**
   Description: Controls the Linux capabilities assigned to the container.

3. SecurityContext->**readOnlyRootFilesystem**
   Description: Controls whether a container will be able to write into the root filesystem.

4. PodSecurityContext->**runAsNonRoot**
   Description: Prevents running a container with 'root' user as part of the pod |

##### Security context example: A pod definition that includes security context parameters

This illustrative manifest assumes an application image configured to run as a numeric non-root user and without writes to the root filesystem. Replace the example image with your application image.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hello-world
spec:
  securityContext:
    runAsNonRoot: true
  containers:
    - name: app
      image: registry.example.com/app:tag
      securityContext:
        readOnlyRootFilesystem: true
```

For more information on security context for Pods, refer to the documentation at <https://kubernetes.io/docs/tasks/configure-pod-container/security-context>

--

#### Continuously assess the privileges used by containers

We strongly recommend that all your containers should adhere to the principle of least privilege, since your security risk is heavily influenced by the capabilities, role bindings, and privileges given to containers. Each container should only have the minimum privileges and capabilities that allows it to perform its intended function.

##### Utilize Pod Security Standards and the Built-in Pod Security Admission Controller to enforce container privilege levels

Pod Security Standards combined with the Pod Security Admission Controller allow cluster administrators to enforce requirements on a pods `securityContext` fields. Three Pod Security Standard profiles exist:

- **Privileged**: Unrestricted, allows for known privilege escalations. Intended for use with system and infrastructure level workloads that require privilege to operate properly. All securityContext settings are permitted
- **Baseline**: Minimally restrictive policy designed for common containerized workloads while preventing known privilege escalations. Targeted at developers and operators of non-critical applications. The most dangerous securityContext settings, such as securityContext.privileged, hostPID, hostPath, hostIPC, are not permitted.
- **Restricted**: The most restrictive policy, designed to enforce current Pod hardening practices at the expense of some compatibility. Intended for security critical workloads or untrusted users. Restricted includes all of the enforcements from the baseline policy, in addition to much more restrictive requirements, such as requiring the dropping of all capabilities, enforcing runAsNotRoot, and more.

Each of the profiles have defined settings baselines that can be found in more detail [here](https://kubernetes.io/docs/concepts/security/pod-security-standards/#profile-details).

The Pod Security Admission Controller allows you to enforce, audit, or warn upon the violation of a defined policy. `audit` and `warn` modes can be utilized to determine if a particular Pod Security Standard would normally prevent the deployment of a pod when set to `enforce` mode.

Below is an example of a namespace that would only allow Pods to be deployed that conform to the restricted Pod Security Standard:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: policy-test
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

Cluster administrators should properly organize and and enforce policy on cluster namespaces, only permitting the privileged policy on namespaces where it is absolutely required, such as for critical cluster services that require access to the underlying host. Namespaces should be set to the lowest Pod Security Policy that can be enforced and supports their risk level.

If more granular policy enforcement is required beyond the three profiles (Privileged, Baseline, Restricted), Third party admission controllers like OPA Gatekeeper or Kyverno, or built-in Validating Admission Policy can be utilized.

##### Use Pod security policies to control the security-related attributes of pods, which includes container privilege levels

> **Warning**
> Kubernetes deprecated Pod Security Policies in favor of Pod Security Standards and the Pod Security Admission Controller, and was removed from Kubernetes in v1.25. Consider using Pod Security Standards and the Pod Security Admission Controller instead.

All security policies should include the following conditions:

- Application processes do not run as root.
- Privilege escalation is not allowed.
- The root filesystem is read-only.
- The default (masked) /proc filesystem mount is used.
- Avoid sharing the host network or process namespace. [NetworkPolicy behavior for `hostNetwork` Pods depends on the network plugin](https://kubernetes.io/docs/concepts/services-networking/network-policies/#networkpolicy-and-hostnetwork-pods); verify enforcement rather than assuming these Pods receive the same isolation as other Pods.
- Unused and unnecessary Linux capabilities are eliminated.
- Use SELinux options for more fine-grained process controls.
- Give each application its own Kubernetes Service Account.
- If a container does not need to access the Kubernetes API, do not let it mount the service account credentials.

For more information on Pod security policies, refer to the documentation at <https://kubernetes.io/docs/concepts/policy/pod-security-policy/>.

--

#### Providing extra security with a service mesh

A service mesh is an infrastructure layer that can handle communications between services in applications quickly, securely and reliably, which can help reduce the complexity of managing microservices and deployments. They provide a uniform way to secure, connect and monitor microservices. and a service mesh is great at resolving operational challenges and issues when running those containers and microservices.

##### Advantages of a service mesh

A service mesh provides the following advantages:

1. Observability

It generates tracing and telemetry metrics, which make it easy to understand your system and quickly root cause any problems.

2. Specialized security features

It provides security features which quickly identify any compromising traffic that enters your cluster and can secure the services inside your network if they are properly implemented. It can also help you manage security through mTLS, ingress and egress control, and more.

3. Ability to secure microservices with mTLS

Since securing microservices is hard, there are many tools that address microservices security. However, the service mesh is the most elegant solution for addressing encryption of on-the-wire traffic within the network.

It provides defense with mutual TLS (mTLS) encryption of the traffic between your services, and the mesh can automatically encrypt and decrypt requests and responses, which removes that burden from application developers. The mesh can also improve performance by prioritizing the reuse of existing, persistent connections, which reduces the need for the computationally expensive creation of new ones. With service mesh, you can secure traffic over the wire and also make strong identity-based authentication and authorizations for each microservice.

We see that a service mesh has a lot of value of enterprise companies, because a mesh allows you to see whether mTLS is enabled and working between each of your services. Also, you can get immediate alerts if the security status changes.

4. Ingress & egress control

It allows you to monitor and address compromising traffic as it passes through the mesh. For example, if Istio integrates with Kubernetes as an ingress controller, it can take care of load balancing for ingress. This allows defenders to add a level of security at the perimeter with ingress rules, while egress control allows you to see and manage external services and control how your services interact with traffic.

5. Operational Control

It can help security and platform teams set the right macro controls to enforce access controls, while allowing developers to make customizations they need to move quickly within these guardrails.

6. Ability to manage RBAC

A service mesh can help defenders implement a strong Role Based Access Control (RBAC) system, which is arguably one of the most critical requirements in large engineering organizations. Even a secure system can be easily circumvented by over-privileged users or employees, and an RBAC system can:

- Restrict privileged users to least privileges necessary to perform job responsibilities
- Ensure that access to systems are set to “deny all” by default
- Help developers make sure that proper documentation detailing roles and responsibilities are in place, which is one of the most critical security concerns in the enterprise.

##### Disadvantages of the security mesh

Though a service mesh has many advantages, they also bring in a unique set of challenges and a few of them are listed below:

- Adds A New Layer of Complexity

When proxies, sidecars and other components are introduced an already sophisticated environment, it dramatically increases the complexity of development and operations.

- Additional Expertise Is Required

If a mesh like Istio is added on top of an orchestrator such as Kubernetes, operators need to become experts in both technologies.

- Infrastructure Can Be Slowed

Because a service mesh is an invasive and intricate technology, it can significantly slow down an architecture.

- Requires Adoption of Yet Another Platform

Since service meshes are invasive, they force developers and operators to adapt to a highly opinionated platform and conform to its rules.

#### Implementing centralized policy management

There are numerous projects which are able to provide centralized policy management for a Kubernetes cluster, including the [Open Policy Agent](https://www.openpolicyagent.org/) (OPA) project, [Kyverno](https://kyverno.io/), or the [Validating Admission Policy](https://kubernetes.io/docs/reference/access-authn-authz/validating-admission-policy/) (a built-in feature released to general availability in 1.30). In order to provide an example with some depth, we will focus on OPA in this cheat sheet.

OPA was started in 2016 to unify policy enforcement across different technologies and systems, and it can be used to enforce policies on a platform like Kubernetes. Currently, OPA is part of CNCF as an incubating project. It can create a unified method of enforcing security policy in the stack. While developers can impose fine-grained control over the cluster with RBAC and Pod security policies, these technologies only apply to the cluster but not outside the cluster.

Since OPA is a general-purpose, domain-agnostic policy enforcement tool that is not based on any other project, the policy queries and decisions do not follow a specific format. Thus it can be integrated with APIs, the Linux SSH daemon, an object store like Ceph, and you can use any valid JSON data as request attributes as long as it provides the required data. OPA allows you to choose what is input and what is output--for example, you can opt to have OPA return a True or False JSON object, a number, a string, or even a complex data object.

##### Most common use cases of OPA

###### OPA for application authorization

OPA can provide developers with an already-developed authorization technology so the team doesn’t have to develop one from scratch. It uses a declarative policy language purpose built for writing and enforcing rules such as, “Alice can write to this repository,” or “Bob can update this account.” This technology provides a rich suite of tools that can allow developers to integrate policies into their applications and allow end users to also create policy for their tenants.

If you already have a homegrown application authorization solution, you may not want to swap in OPA. But if you want to improve developer efficiency by moving to a solution that scales with microservices and allows you to decompose monolithic apps, you’re going to need a distributed authorization system and OPA (or one of the related competitors) could be the answer.

###### OPA for Kubernetes admission control

Since Kubernetes gives developers tremendous control over the traditional silos of "compute, networking and storage," they can use it to set up their network exactly the way they want and set up storage exactly the way they want. But this means that administrators and security teams must make sure that developers don’t shoot themselves (or their neighbors) in the foot.

OPA can address these security concerns by allowing security to build policies that require all container images to be from trusted sources, prevent developers from running software as root, make sure storage is always marked with the encrypt bit and storage does not get deleted just because a pod gets restarted, that limits internet access, etc.

It can also allow administrators to make sure that policy changes don’t inadvertently do more damage than good. OPA integrates directly into the Kubernetes API server and it has complete authority to reject any resource that the admission policy says does not belong in a cluster—-whether it is compute-related, network-related, storage-related, etc. Moreover, policy can be run out-of-band to monitor results and OPA's policies can be exposed early in the development lifecycle (e.g. the CICD pipeline or even on developer laptops) if developers need feedback early.

###### OPA for service mesh authorization

And finally, OPA can regulate use of service mesh architectures. Often, administrators ensure that compliance regulations are satisfied by building policies into the service mesh even when modification to source code is involved. Even if you’re not embedding OPA to implement application authorization logic (the top use case discussed above), you can control the APIs microservices by putting authorization policies into the service mesh. But if you are motivated by security, you can implement policies in the service mesh to limit lateral movement within a microservice architecture.

#### Limiting resource usage on a cluster

Use Kubernetes [ResourceQuota](https://kubernetes.io/docs/concepts/policy/resource-quotas/) to limit aggregate resource requests, limits, and object counts within a namespace, reducing resource-exhaustion risks between tenants. This is a built-in admission control; it does not require OPA.

Use [LimitRange](https://kubernetes.io/docs/concepts/policy/limit-range/) for per-Pod or per-container minimum and maximum allocations and default requests or limits. ResourceQuota does not supply these defaults or enforce a minimum allocation for each Pod.

The example below permits at most four non-terminal Pods in the namespace. Across those Pods, total CPU requests cannot exceed 1 CPU and total memory requests cannot exceed 1 GiB; total CPU limits cannot exceed 2 CPUs and total memory limits cannot exceed 2 GiB. These are namespace totals, not a per-Pod range.

`compute-resources.yaml`:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-resources
spec:
  hard:
    pods: "4"
    requests.cpu: "1"
    requests.memory: 1Gi
    limits.cpu: "2"
    limits.memory: 2Gi
```

Assign a resource quota to namespace:

```bash
kubectl create -f ./compute-resources.yaml --namespace=myspace
```

For more information on configuring resource quotas, refer to the Kubernetes documentation at <https://kubernetes.io/docs/concepts/policy/resource-quotas/>.

#### Use Kubernetes network policies to control traffic between pods and clusters

A compromised application can attack neighboring applications. By default, Pods are non-isolated for ingress and egress. Configure policies for each direction you need to restrict; allowing inbound traffic does not itself configure an outbound policy.

It is strongly recommended that developers implement network segmentation, because it is a key security control that ensures that containers can only communicate with other approved containers and prevents attackers from pursuing lateral movement across containers. However, applying network segmentation in the cloud is challenging because of the “dynamic” nature of container network identities (IPs).

Use the current [`networking.k8s.io/v1` NetworkPolicy API](https://kubernetes.io/docs/concepts/services-networking/network-policies/). Your cluster must use a network plugin that enforces NetworkPolicy; creating the resource alone has no effect without one.

This illustrative ingress policy selects `segment=backend` Pods in `tenant-a` and allows TCP port 80 from `segment=frontend` Pods in that same namespace. Policies are additive: another policy can allow additional traffic. This policy does not restrict egress, and traffic from a Pod's own node remains allowed.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: pol1
  namespace: tenant-a
spec:
  podSelector:
    matchLabels:
      segment: backend
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              segment: frontend
      ports:
        - port: 80
          protocol: TCP
```

For more information on configuring network policies, refer to the Kubernetes documentation at <https://kubernetes.io/docs/concepts/services-networking/network-policies>.

#### Securing data

##### Keep secrets as secrets

It is important to learn how sensitive data such as credentials and keys are stored and accessed in your infrastructure. Kubernetes keeps them in a "secret," which is a small object that contains sensitive data, like a password or token.

It is best for secrets to be mounted into read-only volumes in your containers, rather than exposing them as environment variables. Also, secrets must be kept separate from an image or pod or anyone with access to the image would have access to the secret as well, even though a pod is not able to access the secrets of another pod. Complex applications that handle multiple processes and have public access are especially vulnerable in this regard.

##### Encrypt secrets at rest

Always encrypt your backups using a well reviewed backup and encryption solution and consider using full disk encryption where possible, because the etcd database contains any information accessible via the Kubernetes API. Access to this database could provide an attacker with significant visibility into the state of your cluster.

Kubernetes [supports encryption at rest](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/) for Secret resources in etcd, but the API server stores resources without at-rest encryption by default. Configure a non-`identity` encryption provider as the first provider for Secrets and [rewrite existing Secrets](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/#ensure-all-secrets-are-encrypted) to encrypt previously stored data. This helps protect secrets against read access to etcd or backups, but does not protect them if an attacker also obtains the decryption keys.

##### Alternatives to Kubernetes Secret resources

Since an external secrets manager can store and manage your secrets rather than storing them in Kubernetes Secrets, you may want to consider this security alternative. A manager provides a number of benefits over using Kubernetes Secrets, including the ability to handle secrets across multiple clusters (or clouds), and the ability to control and rotate secrets centrally.

For more information on Secrets and their alternatives, refer to the documentation at <https://kubernetes.io/docs/concepts/configuration/secret/>.

Also see the [Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) cheat sheet for more details and best practices on managing secrets.

##### Finding exposed secrets

We strongly recommend that you review the secret material present on the container against the principle of 'least privilege' and assess the risk posed by a compromise.

Remember that open-source tools such as [Trivy](https://github.com/aquasecurity/trivy) and [Gitleaks](https://github.com/gitleaks/gitleaks) can scan container filesystems for sensitive resources, such as API tokens, passwords, and keys. Such resources would be accessible to any user who had access to the unencrypted container filesystem, whether during build, at rest in a registry or backup, or running.

---

### SECTION 5: Kubernetes Security Best Practices: Runtime Phase

When the Kubernetes infrastructure enters the runtime phase, containerized applications are exposed to a slew of new security challenges. You must gain visibility into your running environment so you can detect and respond to threats as they arise.

If you proactively secure your containers and Kubernetes deployments at the build and deploy phases, you can greatly reduce the likelihood of security incidents at runtime and the subsequent effort needed to respond to them.

First, monitor the most security-relevant container activities, including:

- Process activity
- Network communications among containerized services
- Network communications between containerized services and external clients and servers

Detecting anomalies by observing container behavior is generally easier in containers than in virtual machines because of the declarative nature of containers and Kubernetes. These attributes allow easier introspection into what you have deployed and its expected activity.

#### Use Pod Security Admission to prevent risky containers/Pods from being deployed

The previously recommended [Pod Security Policy](https://kubernetes.io/docs/concepts/policy/pod-security-policy/) is deprecated and replaced by [Pod Security Admission](https://kubernetes.io/docs/concepts/security/pod-security-admission/), a new feature that allows you to enforce security policies on pods in a Kubernetes cluster.

It is recommended to use the `baseline` level as a minimum security requirement for all pods to ensure a standard level of security across the cluster. However, clusters should strive to apply the `restricted` level which follows pod hardening best practices.

For more information on configuring Pod Security Admission, refer to the documentation at <https://kubernetes.io/docs/tasks/configure-pod-container/enforce-standards-admission-controller/>.

#### Container Runtime Security

If containers are hardened containers at runtime, security teams have the ability to detect and respond to threats and anomalies while the containers or workloads are in a running state. Typically, this is carried out by intercepting the low-level system calls and looking for events that may indicate compromise. Some examples of events that should trigger an alert would include:

- A shell is run inside a container
- A container mounts a sensitive path from the host such as /proc
- A sensitive file is unexpectedly read in a running container such as /etc/shadow
- An outbound network connection is established

Open source tools such as Falco from Sysdig can help operators get up and running with container runtime security by providing defenders with a large number of out-of-the-box detections as well as the ability to create custom rules.

#### Container Sandboxing

When container runtimes are permitted to make direct calls to the host kernel, the kernel often interacts with hardware and devices to respond to the request. Though Cgroups and namespaces give containers a certain amount of isolation, the kernel still presents a large attack surface. When defenders have to deal with multi-tenant and highly untrusted clusters, they often add additional layer of sandboxing to ensure that container breakout and kernel exploits are not present. Below, we will explore a few OSS technologies that help further isolate running containers from the host kernel:

- Kata Containers: Kata Containers is an OSS project that uses stripped-down VMs to keep the resource footprint minimal and maximize performance to ultimately isolate containers further.
- gVisor : gVisor is a more lightweight kernel than a VM (even stripped down). It is its own independent kernel written in Go and sits in the middle of a container and the host kernel. It is a strong sandbox--gVisor supports ~70% of the linux system calls from the container but ONLY uses about 20 system calls to the host kernel.
- Firecracker: It is a super lightweight VM that runs in user space. Since it is locked down by seccomp, cgroup, and namespace policies, the system calls are very limited. Firecracker is built with security in mind, however it may not support all Kubernetes or container runtime deployments.

#### Preventing containers from loading unwanted kernel modules

Because Linux kernel automatically loads kernel modules from disk if needed in certain circumstances, such as when a piece of hardware is attached or a filesystem is mounted, this can be a significant attack surface. Of particular relevance to Kubernetes, even unprivileged processes can cause certain network-protocol-related kernel modules to be loaded, just by creating a socket of the appropriate type. This situation may allow attackers to exploit a security hole in kernel modules that the administrator assumed was not in use.

To prevent specific modules from being automatically loaded, you can uninstall them from the node, or add rules to block them. On most Linux distributions, you can do that by creating a file such as `/etc/modprobe.d/kubernetes-blacklist.conf` with contents like:

```conf
# DCCP is unlikely to be needed, has had multiple serious
# vulnerabilities, and is not well-maintained.
blacklist dccp

# SCTP is not used in most Kubernetes clusters, and has also had
# vulnerabilities in the past.
blacklist sctp
```

To block module loading more generically, you can use a Linux Security Module (such as SELinux) to completely deny the module_request permission to containers, preventing the kernel from loading modules for containers under any circumstances. (Pods would still be able to use modules that had been loaded manually, or modules that were loaded by the kernel on behalf of some more-privileged process).

#### Compare and analyze different runtime activity in pods of the same deployments

When containerized applications are replicated for high availability, fault tolerance, or scale reasons, these replicas should behave nearly identically. If a replica has significant deviations from the others, defenders would want further investigation. Your Kubernetes security tool should be integrated with other external systems (email, PagerDuty, Slack, Google Cloud Security Command Center, SIEMs [security information and event management], etc.) and leverage deployment labels or annotations to alert the team responsible for a given application when a potential threat is detected. If you chose to use a commercial Kubernetes security vendor, they should support a wide array of integrations with external tools.

#### Monitor network traffic to limit unnecessary or insecure communication

Containerized applications typically make extensive use of cluster networking, so observing active networking traffic is a good way to understand how applications interact with each other and identify unexpected communication. You should observe your active network traffic and compare that traffic to what is allowed based on your Kubernetes network policies.

At the same time, comparing the active traffic with what’s allowed gives you valuable information about what isn’t happening but is allowed. With that information, you can further tighten your allowed network policies so that it removes superfluous connections and decreases your overall attack surface.

Open source projects like <https://github.com/kinvolk/inspektor-gadget> or <https://github.com/deepfence/PacketStreamer> may help with this, and commercial security solutions provide varying degrees of container network traffic analysis.

#### If breached, scale suspicious pods to zero

Contain a successful breach by using Kubernetes native controls to scale suspicious pods to zero or kill then restart instances of breached applications.

#### Rotate infrastructure credentials frequently

The shorter the lifetime of a secret or credential, the harder it is for an attacker to make use of that credential. Set short lifetimes on certificates and automate their rotation. Use an authentication provider that can control how long issued tokens are available and use short lifetimes where possible. If you use service account tokens in external integrations, plan to rotate those tokens frequently. For example, once the bootstrap phase is complete, a bootstrap token used for setting up nodes should be revoked or its authorization removed.

#### Logging

Kubernetes supplies cluster-based logging, which allows you to log container activity into a central log hub. When a cluster is created, the standard output and standard error output of each container can be ingested using a Fluentd agent running on each node (into either Google Stackdriver Logging or into Elasticsearch) and viewed with Kibana.

##### Enable audit logging

Kubernetes [audit logging](https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/) records API activity according to the configured audit policy for later analysis. Enable audit logging and archive the audit file on a secure server.

Ensure logs that are monitoring for anomalous or unwanted API calls, especially any authorization failures (these log entries will have a status message “Forbidden”). Authorization failures could mean that an attacker is trying to abuse stolen credentials.

Managed Kubernetes providers, including GKE, provide access to this data in their cloud console and may allow you to set up alerts on authorization failures.

###### Audit logs

Audit logs can be useful for compliance as they should help you answer the questions of what happened, who did what and when. Kubernetes provides flexible auditing of kube-apiserver requests based on policies. These help you track all activities in chronological order.

Here is an illustrative [`audit.k8s.io/v1` audit event](https://kubernetes.io/docs/reference/config-api/apiserver-audit.v1/#audit-k8s-io-v1-Event):

```json
{
  "kind":"Event",
  "apiVersion":"audit.k8s.io/v1",
  "level":"Metadata",
  "auditID":"23bc44ds-2452-242g-fsf2-4242fe3ggfes",
  "stage":"RequestReceived",
  "requestURI":"/api/v1/namespaces/default/persistentvolumeclaims",
  "verb":"list",
  "user": {
    "username":"user@example.org",
    "groups":[ "system:authenticated" ]
  },
  "sourceIPs":[ "172.12.56.1" ],
  "objectRef": {
    "resource":"persistentvolumeclaims",
    "namespace":"default",
    "apiVersion":"v1"
  },
  "requestReceivedTimestamp":"2019-08-22T12:00:00Z",
  "stageTimestamp":"2019-08-22T12:00:00Z"
}
```

##### Define Audit Policies

Audit policy sets rules which define what events should be recorded and what data is stored when an event includes. The audit policy object structure is defined in the audit.k8s.io API group. When an event is processed, it is compared against the list of rules in order. The first matching rule sets the "audit level" of the event.

The known audit levels are:

- None - don't log events that match this rule
- Metadata - log request metadata (requesting user, timestamp, resource, verb, etc.) but not request or response body
- Request - log event metadata and request body but not response body. This does not apply for non-resource requests
- RequestResponse - log event metadata, request and response bodies. This does not apply for non-resource requests

You can pass a file with the policy to kube-apiserver using the --audit-policy-file flag. If the flag is omitted, no events are logged. Note that the rules field must be provided in the audit policy file. A policy with no (0) rules is treated as illegal.

##### Understanding Logging

One main challenge with logging Kubernetes is understanding what logs are generated and how to use them. Let’s start by examining the overall picture of Kubernetes' logging architecture.

###### Container logging

The first layer of logs that can be collected from a Kubernetes cluster are those being generated by your containerized applications. The easiest method for logging containers is to write to the standard output (stdout) and standard error (stderr) streams.

Manifest is as follows.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: example
spec:
  containers:
    - name: example
      image: busybox
      args: [/bin/sh, -c, 'while true; do echo $(date); sleep 1; done']
```

To apply the manifest, run:

```bash
kubectl apply -f example.yaml
```

To take a look the logs for this container, run:

```bash
kubectl log <container-name> command.
```

For persisting container logs, the common approach is to write logs to a log file and then use a sidecar container. As shown below in the pod configuration above, a sidecar container will run in the same pod along with the application container, mounting the same volume and processing the logs separately.

An example of a Pod Manifest is seen below:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: example
spec:
  containers:
  - name: example
    image: busybox
    args:
    - /bin/sh
    - -c
    - >
      while true;
      do
        echo "$(date)\n" >> /var/log/example.log;
        sleep 1;
      done
    volumeMounts:
    - name: varlog
      mountPath: /var/log
  - name: sidecar
    image: busybox
    args: [/bin/sh, -c, 'tail -f /var/log/example.log']
    volumeMounts:
    - name: varlog
      mountPath: /var/log
  volumes:
  - name: varlog
    emptyDir: {}
```

###### Node logging

When a container running on Kubernetes writes its logs to stdout or stderr streams, the container engine streams them to the logging driver set by the Kubernetes configuration.

In most cases, these logs will end up in the /var/log/containers directory on your host. Docker supports multiple logging drivers but unfortunately, driver configuration is not supported via the Kubernetes API.

Once a container is terminated or restarted, kubelet stores logs on the node. To prevent these files from consuming all of the host’s storage, the Kubernetes node implements a log rotation mechanism. When a container is evicted from the node, all containers with corresponding log files are evicted.

Depending on what operating system and additional services you’re running on your host machine, you might need to take a look at additional logs.

For example, systemd logs can be retrieved using the following command:

```bash
journalctl -u
```

###### Cluster logging

In the Kubernetes cluster itself, there is a long list of cluster components that can be logged as well as additional data types that can be used (events, audit logs). Together, these different types of data can give you visibility into how Kubernetes is performing as a system.

Some of these components run in a container, and some of them run on the operating system level (in most cases, a systemd service). The systemd services write to journald, and components running in containers write logs to the /var/log directory, unless the container engine has been configured to stream logs differently.

##### Events

Kubernetes events can indicate any Kubernetes resource state changes and errors, such as exceeded resource quota or pending pods, as well as any informational messages.

The following command returns all events within a specific namespace:

```bash
kubectl get events -n <namespace>

NAMESPACE LAST SEEN TYPE   REASON OBJECT MESSAGE
kube-system  8m22s  Normal   Scheduled            pod/metrics-server-66dbbb67db-lh865                                       Successfully assigned kube-system/metrics-server-66dbbb67db-lh865 to aks-agentpool-42213468-1
kube-system     8m14s               Normal    Pulling                   pod/metrics-server-66dbbb67db-lh865                                       Pulling image "aksrepos.azurecr.io/mirror/metrics-server-amd64:v0.2.1"
kube-system     7m58s               Normal    Pulled                    pod/metrics-server-66dbbb67db-lh865                                       Successfully pulled image "aksrepos.azurecr.io/mirror/metrics-server-amd64:v0.2.1"
kube-system     7m57s               Normal     Created                   pod/metrics-server-66dbbb67db-lh865                                       Created container metrics-server
kube-system     7m57s               Normal    Started                   pod/metrics-server-66dbbb67db-lh865                                       Started container metrics-server
kube-system     8m23s               Normal    SuccessfulCreate          replicaset/metrics-server-66dbbb67db             Created pod: metrics-server-66dbbb67db-lh865
```

The following command will show the latest events for this specific Kubernetes resource:

```bash
kubectl describe pod <pod-name>

Events:
  Type    Reason     Age   From                               Message
  ----    ------     ----  ----                               -------
  Normal  Scheduled  14m   default-scheduler                  Successfully assigned kube-system/coredns-7b54b5b97c-dpll7 to aks-agentpool-42213468-1
  Normal  Pulled     13m   kubelet, aks-agentpool-42213468-1  Container image "aksrepos.azurecr.io/mirror/coredns:1.3.1" already present on machine
  Normal  Created    13m   kubelet, aks-agentpool-42213468-1  Created container coredns
  Normal  Started    13m   kubelet, aks-agentpool-42213468-1  Started container coredns
```

### SECTION 5: Securing a managed-service Kubernetes on Cloud Service Provider

#### AWS

There are few open source tools that can help you on securing your managed-service Kubernetes on AWS [(EKS)](https://aws.amazon.com/eks/)

- [hardeneks](https://github.com/aws-samples/hardeneks)
- [MKAD](https://github.com/DataDog/managed-kubernetes-auditing-toolkit) (Managed Kubernetes Auditing Toolkit) from DataDog

### SECTION 6: Supply Chain Security

Container supply chain security is critical for preventing attacks that exploit vulnerabilities in the software delivery process. A compromised supply chain can lead to malicious code being deployed into production environments, potentially affecting thousands of containers and applications.

Supply chain attacks in Kubernetes environments typically target:

- Base images and dependencies
- Build processes and CI/CD pipelines
- Container registries
- Deployment manifests and Helm charts
- Third-party libraries and packages

Recent high-profile attacks (SolarWinds, Codecov, ua-parser-js) demonstrate the severe impact of supply chain compromises.

#### Best practices for securing the container supply chain

1. Use trusted base images: Start with minimal, verified base images from reputable sources to reduce vulnerabilities.
2. Implement image scanning: Regularly scan container images for vulnerabilities using tools like Clair, Trivy, or Aqua Security.
3. Secure CI/CD pipelines: Ensure that build processes are secure, with proper access controls and monitoring.
4. Sign and verify images: Use image signing tools like Notary or Cosign to ensure the integrity of container images.
5. Use private registries: Store container images in private registries with access controls to prevent unauthorized access.
6. Monitor for vulnerabilities: Continuously monitor for new vulnerabilities in dependencies and base images.
7. Implement runtime security: Use tools to monitor container behavior at runtime and detect anomalies.

### SECTION 7: Final Thoughts

#### Embed security into the container lifecycle as early as possible

You must integrate security earlier into the container lifecycle and ensure alignment and shared goals between security and DevOps teams. Security can (and should) be an enabler that allows your developers and DevOps teams to confidently build and deploy applications that are production-ready for scale, stability and security.

#### Use Kubernetes-native security controls to reduce operational risk

Leverage the native controls built into Kubernetes whenever available in order to enforce security policies so that your security controls don’t collide with the orchestrator. Instead of using a third-party proxy or shim to enforce network segmentation, you could use Kubernetes network policies to ensure secure network communication.

#### Leverage the context that Kubernetes provides to prioritize remediation efforts

Note that manually triaging security incidents and policy violations is time consuming in sprawling Kubernetes environments.

For example, a deployment containing a vulnerability with severity score of 7 or greater should be moved up in remediation priority if that deployment contains privileged containers and is open to the Internet but moved down if it’s in a test environment and supporting a non-critical app.

---

![Kubernetes Architecture](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Kubernetes_Architecture.png)

## Infrastructure as Code Security Cheatsheet

> **Source:** [Infrastructure as Code Security Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Infrastructure_as_Code_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

<!---
Copyright 2021 Nokia
Licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License
SPDX-License-Identifier: CC-BY-SA-3.0
--->

### Introduction

Infrastructure as code (IaC), also known as software-defined infrastructure, allows the configuration and deployment of infrastructure components faster with consistency by allowing them to be defined as a code and also enables repeatable deployments across environments.

#### Security best practices

Here are some of the security best practices for IaC that can be easily integrated into the Software Development Lifecycle:

#### Develop and Distribute

- IDE plugins - Leverage standard security plug-ins in the integrated development environment (IDE) which helps in the early detection of potential risks and drastically reduces the time to address any issues later in the development cycle. Plugins such as TFLint, Checkov, Docker Linter, docker-vulnerability-extension, Security Scan, Contrast Security, etc., help in the security assessment of the IaC.
- Threat modeling - Build the threat modeling landscape earlier in the development cycle to ensure there is enough visibility of the high-risk, high-volume aspects of the code and flexibility to include security throughout to ensure the assets are safely managed.
- Managing secrets -  Secrets are confidential data and information such as application tokens required for authentication, passwords, and SSH (Secure Shell) keys. The problem is not the secrets, but where you store them. If you are using a simple text file or SCMs like Git, then the secrets can be easily exposed. Open-source tools such as truffleHog, git-secrets, GitGuardian and similar can be utilized to detect such vulnerable management of secrets. See the [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) for more information.
- Version control - Version control is the practice of tracking and managing changes to software code. Ensure all the changes to the IaC are tracked with the right set of information that helps in any revert operation. The important part is that you’re checking in those changes alongside the features they support and not separately. A feature’s infrastructure requirements should be a part of a feature’s branch or merge request. Git is generally used as the source code version control system.
- Principle of least privilege - define the access management policies based on the principle of least privilege with the following priority items:

    - Defining who is and is not authorized to create/update/run/delete the scripts and inventory.
    - Limiting the permissions of authorized IaC users to what is necessary to perform their tasks. The IaC scripts should ensure that the permissions granted to the various resources it creates are limited to what is required for them to perform their work.

- Static analysis - Analyzes code in isolation, identifying risks, misconfigurations, and compliance faults only relevant to the IaC itself. Tools such as kubescan, Snyk, Coverity etc, can be leveraged for static analysis of IaC.
- Open Source dependency check - Analyzes the open source dependencies such as OS packages, libraries, etc., to identify potential risks. Tools such as BlackDuck, Snyk, WhiteSource Bolt for GitHub, and similar can be leveraged for open source dependency analysis of IaC.
- Container image scan - Image scanning refers to the process of analyzing the contents and the build process of a container image in order to detect security issues, vulnerabilities or potential risks. Open-source tools such as Dagda, Clair, Trivy, Anchore, etc., can be leveraged for container image analysis.
CI/CD pipeline and Consolidated reporting - enabling the security checks to be made available in the CI/CD pipeline enables the analysis of each of the code changes, excludes the need for manual intervention, and enables maintaining the history of compliance. Along with consolidated reporting, these integrations enhance the speed of development of a secure IaC codebase. Open-source tools such as Jenkins, etc., can be leveraged to build the CI/CD pipelines, and DefectDojo and OWASP Glue can help in tying the checks together and visualizing the check results in a single dashboard.
- Artifact signing - Digital signing of artifacts at build time and validation of the signed data before use protects artifacts from tampering between build and runtime, thus ensuring the integrity and provenance of an artifact. Open-source tools such as TUF helps in the digital signing of artifacts.

#### Deploy

- Inventory management:
    - Commissioning - whenever a resource is deployed, ensure the resource is labeled, tracked and logged as part of the inventory management.
    - Decommissioning - whenever a resource deletion is initiated, ensure the underlying configurations are erased, data is securely deleted and the resource is completely removed from the runtime as well as from the inventory management.
    - Tagging - It is essential to tag cloud assets properly. During IaC operations, untagged assets are most likely to result in ghost resources that make it difficult to detect, visualize, and gain observability within the cloud environment and can affect the posture causing a drift. These ghost resources can add to billing costs, make maintenance difficult, and affect the reliability. The only solution to this is careful tagging and monitoring for untagged resources.
- Dynamic analysis - Dynamic analysis helps in evaluating any existing environments and services that it will interoperate with or run on. This helps in uncovering potential risks due to the interoperability. Open-source tools such as ZAP, Burp, GVM, etc., can be leveraged for dynamic analysis.

#### Runtime

- Immutability of infrastructure - The idea behind immutable infrastructure is to build the infrastructure components to an exact set of specifications. No deviation, no changes. If a change to a specification is required, then a whole new set of infrastructure is provisioned based on the updated requirements, and the previous infrastructure is taken out of service as obsolete.
- Logging - Keeping a record is a critical aspect to keeping an eye on risks. You should enable logging - both security logs and audit logs - while provisioning infrastructure, as they help assess the security risks related to sensitive assets. They also assist in analyzing the root cause of incidents and in identifying potential threats. Open-source tools such as ELK, etc., can be leveraged for log analysis.
- Monitoring - Continuous monitoring assists in looking out for any security and compliance violations, helps in identifying attacks and also provides alerts upon such incidents. Certain solutions also incorporate new technologies like AI to identify potential threats early. Open-source tools such as Prometheus, Grafana, etc., can be leveraged for monitoring of cloud infrastructure.
- Runtime threat detection: Implementing a runtime threat detection solution helps in recognizing unexpected application behavior and alerts on threats at runtime. Open-source tools such as Falco, etc., can be leveraged for runtime threat detection. Certain application such as Contrast (Contrast Community Edition) can also detect OWASP Top 10 attacks on the application during runtime and help block them in order to protect and secure the application.

## CI/CD Security

> **Source:** [CI/CD Security](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

CI/CD pipelines and processes facilitate efficient, repeatable software builds and deployments; as such, they occupy an important role in the modern SDLC. However, given their importance and popularity, CI/CD pipelines are also an appealing target for malicious hackers, and their security cannot be ignored. This goal of this cheat sheet is to provide developers practical guidelines for reducing risk associated with these critical components. This cheat sheet will focus on securing the pipeline itself. It will begin by providing some brief background information before proceeding with specific CI/CD security best practices.

#### Definition and Background

CI/CD refers to a set of largely automated processes used to build and deliver software; it is often portrayed as a pipeline consisting of a series of sequential, discrete steps. The pipeline generally begins when code under development is pushed to a repository and, if all steps complete successfully, ends with the software solution built, tested, and deployed to a production environment. CI/CD may be decomposed into two distinct parts: continuous integration (CI) and continuous delivery and/or continuous deployment (CD).  CI focuses on build and testing automation; continuous delivery focuses on promoting this built code to a staging or higher environment and, generally, performing additional automated testing. Continuous delivery and continuous deployment may not always be distinguished in definitions of CI/CD; however, according to [NIST](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-204C.pdf), continuous delivery requires code to be manually pushed to production whereas continuous deployment automates even this step.

The exact steps in a CI/CD pipeline may vary from organization to organization and from project to project; however, automation, and the repeatability and agility it brings, should be a core focus of any CI/CD implementation.

#### Understanding CI/CD Risk

Although CI/CD brings many benefits, it also increases an organization's attack surface. People, processes, and technology are all required for CI/CD and all can be avenues of attack; code repositories, automation servers such as Jenkins, deployment procedures, and the nodes responsible for running CI/CD pipelines are just a few examples of CI/CD components which can be exploited by malicious entities.  Furthermore, since CI/CD steps are frequently executed using high-privileged identities, successful attacks against CI/CD often have high damage potential. If an organization chooses to leverage the many benefits of CI/CD, it must also ensure it invests the resources required to properly secure it; the [Codecov](https://blog.gitguardian.com/codecov-supply-chain-breach/) and [SolarWinds](https://www.cyberark.com/resources/blog/the-anatomy-of-the-solarwinds-attack-chain) breaches are just two sobering examples of the potential impact of CI/CD compromise.

The specific methods attackers use to exploit CI/CD environments are diverse; however, certain risks are more prominent than others. Although one should not restrict themselves to knowledge of them, understanding the most prominent risks to CI/CD environments can help organizations allocate security resources more efficiently. [OWASP's Top 10 CI/CD Security Risks](https://owasp.org/www-project-top-10-ci-cd-security-risks/) is a valuable resources for this purpose; the project identifies the following as the top 10 CI/CD risks:

- CICD-SEC-1: Insufficient Flow Control Mechanisms
- CICD-SEC-2: Inadequate Identity and Access Management
- CICD-SEC-3: Dependency Chain Abuse
- CICD-SEC-4: Poisoned Pipeline Execution (PPE)
- CICD-SEC-5: Insufficient PBAC (Pipeline-Based Access Controls)
- CICD-SEC-6: Insufficient Credential Hygiene
- CICD-SEC-7: Insecure System Configuration
- CICD-SEC-8: Ungoverned Usage of Third-Party Services
- CICD-SEC-9: Improper Artifact Integrity Validation
- CICD-SEC-10: Insufficient Logging and Visibility

The remainder of this cheat sheet will focus on providing guidance for mitigating against these top 10 and other CI/CD risks.

### Secure Configuration

Time and effort must be invested into properly securing the components, such as SCM systems and automation servers (Jenkins, TeamCity, etc), that enable CI/CD processes. Regardless of the specific tools in use, one should never blindly rely on default vendor settings. At the same time, one must not adjust settings without fully understanding the implications, nor perform any needed configuration updates in an uncontrolled, entirely ad-hoc way. Change management and appropriate governance must be in place. Additionally, education is key; before leveraging a tool to perform critical, security sensitive operations such as code deployment, it is imperative one take time to understand the underlying technology. Secure configuration does not happen automatically; it requires education and planning.

Furthermore, one must also take steps to ensure the security of the operating systems, container images, web servers, or other infrastructure used to run or support the CI/CD components identified above.  These systems must be kept appropriately patched, and an inventory of these assets, including software versions, should also be maintained. These technologies should be hardened according to standards such as [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks) or [STIGs](https://public.cyber.mil/stigs/downloads/) where appropriate.

Beyond these general principles, some specific guideline relevant to CI/CD configuration will be explored below.

#### Secure SCM Configuration

CI/CD environments allow for code to be pushed to a repository and then deployed to a production environment with little to no manual intervention. However, this benefit can quickly become an attack vector if it allows untrusted, potentially malicious code to be deployed directly to a production system. Proper configuration of the SCM system can help mitigate this risk. Best practices include:

- Avoid the use of auto-merge rules in platforms such as [Gitlab](https://docs.gitlab.com/ee/user/project/merge_requests/merge_when_pipeline_succeeds.html), [Github](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request), or Bitbucket.
- Require pull requests to be reviewed before merging and ensure this review step cannot be bypassed.
- Leverage [protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).
- Require commits to be signed
- Carefully weigh the risk against the benefits of allowing ephemeral contributors. Limit the number and permissions of external contributions when possible.
- Enable MFA where available
- Avoid assigning default permissions for users and roles with access to your SCM assets. Carefully manage your permissions.
- Restrict the ability to fork private or internal repositories.
- Limit the option to change repository visibility to public.
You can find a wide variety of additional policies in this [documentation](https://policies.legitify.dev/).

To help navigate SCM configuration challenges, there are tools available, such as [Legitify](https://github.com/Legit-Labs/legitify), an open-source tool by [Legit security](https://www.legitsecurity.com/). Legitify scans SCM assets and identifies misconfigurations and security issues, including policies for all the above best practices (available for GitHub and GitLab).

#### Pipeline and Execution Environment

In addition to SCM systems, it is imperative that the automation servers responsible for running the pipelines are also configured securely. Examples of these technologies include Travis, TeamCity, Jenkins, and CircleCI. While the exact hardening process will vary according to the specific platform used, some general best practices include:

- Perform builds in appropriately isolated nodes (see Jenkins example [here](https://www.jenkins.io/doc/book/security/controller-isolation/))
- Ensure communication between the SCM and CI/CD platform is secured using widely accepted protocols such as TLS 1.2 or greater.
- Restrict access to CI/CD environments by IP if possible.
- If feasible, store the CI config file outside the repository that is hosting the code being built. If the file is stored alongside the code, it is imperative that the file is reviewed before any merge request is approved.
- Enable an appropriate level of logging (discussed more under [Visibility and Monitoring](#visibility-and-monitoring) below)
- Incorporate language appropriate SAST, DAST, IaC vulnerability scanning and related tools into the pipeline.
- Require manual approval and review before triggering production deployment.
- If pipelines steps are executed in  Docker image, avoid using the `--privileged` flag [ref](https://research.nccgroup.com/2022/01/13/10-real-world-stories-of-how-weve-compromised-ci-cd-pipelines/)
- Ensure the pipeline configuration code is version controlled ([ref](https://www.cisa.gov/sites/default/files/publications/ESF_SECURING_THE_SOFTWARE_SUPPLY_CHAIN_DEVELOPERS.PDF))
- Enforce MFA where possible

### IAM

Identity and Access Management (IAM) is the process of managing digital identities and controlling their access to digital resources. Examples of identities include system accounts, roles, groups, or individual user accounts. IAM has wide applications well beyond CI/CD, but mismanagement of identities and their underlying credentials are among the most prominent risks impacting CI/CD environments. The following subsections will highlight some IAM related security best practices that are especially relevant to CI/CD environments.

#### Secrets Management

Secrets, such as API keys or passwords, are often required for a CI/CD pipeline to execute successfully. Secrets in CI/CD environment are often numerous, with at least some providing substantial access to sensitive systems or operations. This combination introduces a challenge: how does one securely manage secrets while also allowing automated CI/CD processes to access them as needed? Following some simple guidelines can help substantially mitigate, though certainly not eliminate, risk.

First, one should take steps to reduce the likelihood that secrets can be stolen in a usable format. Secrets should **never** be hardcoded in code repositories or CI/CD configuration files. Employ tools such as [git-leaks](https://github.com/gitleaks/gitleaks) or [git-secrets](https://github.com/awslabs/git-secrets) to detect such secrets. Strive to prevent secrets from ever being committed in the first place and perform ongoing monitoring to detect any deviations. Secrets must also be removed from other artifacts such as Docker images and compiled binaries. Secrets must always be encrypted using industry accepted standards. Encryption must be applied while secrets are at-rest in a file-system, vault, or similar store; however, one must also ensure these secrets are not disclosed or persisted in cleartext as a consequence of use in the CI/CD pipeline. For example, secrets must not be printed out to the console, logged, or stored in a system's command history files (such as `~/.bash-history`). A third-party solution such as [HashiCorp Vault](https://www.hashicorp.com/products/vault), [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/), [AKeyless](https://www.akeyless.io/), or [CyberArk](https://www.cyberark.com/) may be used for this purpose.

Second, one must take steps to reduce impact in the event that secrets are stolen in a format that is usable by an attacker. Using temporary credentials or OTPs is one method for reducing impact. Furthermore, one may impose IP based or other restrictions that prevent even valid credentials from accessing resources if these further requirements are not met.The [Least Privilege](#least-privilege) and [Identity Lifecycle Management](#identity-lifecycle-management) sections below provide further guidance on techniques to mitigate risk related to secrets theft.

For additional guidance on securely managing secrets, please reference the [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).

#### Least Privilege

Least privilege, defined by [NIST](https://csrc.nist.gov/glossary/term/least_privilege) as:

> The principle that a security architecture is designed so that each entity is granted the minimum system resources and authorizations that the entity needs to perform its function".

In the context of CI/CD environments, this principle should be applied to at least three main areas: the secrets used within pipeline steps to access external resources, the access one pipeline or step has to other resources configured in the CI/CD platform ([OWASP pipeline-based access controls](https://owasp.github.io/www-project-top-10-ci-cd-security-risks/CICD-SEC-05-Insufficient-PBAC)), and the permissions of the OS user executing the pipeline.

Regardless of the specific application, the general guidance remains the same: access must be justified, not assumed. One should adopt a "deny by default" mindset. Any identities used within the pipeline must be assigned only the minimum permissions necessary to do its job. For example, if a pipeline must access an AWS service in order to complete its task, the AWS credentials used in that pipeline must only be able to perform the specific operations on the  specific services and resources it requires to perform its task. Similarly, credential sharing across pipelines should be kept to a minimum; in particular, such sharing should not occur across pipelines having different levels of sensitivity or value. If pipeline A does not require access to the same secrets pipeline B requires, they should ideally not be shared. Finally, the OS accounts responsible for running the pipeline should not have root or comparable privileges; this will help mitigate impact in case of compromise.

#### Identity Lifecycle Management

Although proper secrets management and application of the principle of least privilege are necessary for secure IAM, they are not sufficient. The lifecycle of identities, from creation to deprovisioning, must be carefully managed to reduce risk for CI/CD and other environments.

In the initial or "Joiner" phase of Identity Management (as defined in the [ILM Playbook](https://www.idmanagement.gov/playbooks/ilm/)), considerations include using a centralized IdP rather than allowing local accounts, disallowing shared accounts, disallowing self-provisioning of identities, and only allowing email accounts with domains controlled by the organization responsible for the CI/CD environment ([OWASP CI/CD identity and access management](https://owasp.org/www-project-top-10-ci-cd-security-risks/CICD-SEC-02-Inadequate-Identity-And-Access-Management)). Once provisioned, identities must be tracked, maintained, and, when necessary, deprovisioned. Of particular concern in complex, distributed CI/CD environments is ensuring that an accurate, comprehensive, and up-to-date inventory of identities is maintained. The format of this inventory can vary by organizational needs, but, in addition to the identity itself, suggested fields include identity owner or responsible party, identity provider, last used, last updated, granted permissions, and permissions actually used by the identity. Such an inventory will help one readily identify identities which may be over-privileged or which may be candidates for deprovisioning. Proper identity maintenance must not be overlooked; the "forgotten" identity can be the vector an attacker users to compromise a CI/CD system.

### Managing Third-Party Code

Due, in part, to high-profile breaches such as SolarWinds, the concept of software supply chain security has received increasing attention in recent years. This issue is especially pressing in the context of CI/CD as such environments interact with third-party code in multiple ways. Two such areas of interaction, the dependencies used by projects running within the pipeline and the third-party integrations and plug-ins with the CI/CD system itself will be discussed below.

#### Dependency Management

Using third-party packages with known vulnerabilities is a well-known problem in software engineering, and many tools have been developed to address this. In the context of CI/CD, automated use of SCA and comparable tools can actually assist in improving security in this area. However, the CI/CD environment itself is susceptible to a different, but related, risk: dependency chain abuse.

Dependency chain abuse involves the exploitation of flaws within a system's dependency chain and dependency resolution processes; a successful attack can result in the execution of malicious code from an attacker controlled package. The dependency chain itself refers to the set of packages, including internal, direct third-party, and transitive dependencies, that a software solution requires to function. An attacker can take advantage of this dependency chain through methods such as [dependency confusion](https://fossa.com/blog/dependency-confusion-understanding-preventing-attacks/), [typosquatting](https://blog.gitguardian.com/protecting-your-software-supply-chain-understanding-typosquatting-and-dependency-confusion-attacks/), or takeover of a valid package maintainer's account. Dependency chain abuse attacks can be quite complex and comprehensive defense is correspondingly so; however, basic mitigation are quite straightforward.

Mitigation techniques begin early on in the SDLC, well before the CI/CD pipeline begins execution. The project's package management technology (such as npm) should be configured in such a way as to ensure dependency references are immutable (CISA et al. 2022). Version pinning should be performed, the version chosen for pinning must be one that is known to be valid and secure, and the integrity of any package the system downloads should be validated by comparing its hash or checksum to a  known good hash of the pinned package. The exact procedures to achieve this will vary depending on the project's underlying technology, but, in general, both version pinning and hash verification can be performed via a platform's "lock" or similar file (i.e. [package-lock.json](https://docs.npmjs.com/cli/v7/configuring-npm/package-lock-json) or  [Pipfile.lock](https://pipenv.pypa.io/en/latest/pipfile.html)). Remember to [enforce the lockfile](https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html#2-enforce-the-lockfile). Prefer using private repositories where possible, and configure the package manager to use only a single private feed ([Microsoft's feed configuration guidance](https://github.com/MicrosoftDocs/azure-devops-docs/blob/main/docs/artifacts/concepts/best-practices.md)). For private packages, leverage [scoped NPM packages](https://docs.npmjs.com/cli/v10/using-npm/scope),  [ID prefixes for NuGet packages](https://learn.microsoft.com/en-us/nuget/nuget-org/id-prefix-reservation), or a comparable feature to reduce the risk of dependency confusion. Finally, regardless of the platform used, ensure the file(s) responsible for controlling these settings (such as `.npmrc` in node environments), is committed to source control and accessible in the CI/CD environment.

#### Plug-In and Integration Management

Most CI/CD platforms are extensible through means of plug-ins or other third-party integrations. While these extensions can introduce many benefits, including potentially improving the security capabilities of the system, they also increase the attack surface. This is not to say that plug-ins should necessarily be disallowed; rather, the risk must simply be considered and reduced to an acceptable level.

Installation of plug-ins or integration with third-party services should be treated like the acquisition of any software. These tools are often easy to install and setup, but this does not mean their installation and usage should go ungoverned. Least privileges must be enforced to ensure only a small subset of users even have the permissions required to extend CI/CD platforms. Additionally, such extensions must be vetted before installation. Questions to consider are comparable to those that should be asked before any software acquisition:

- Is the vendor a recognized and respected developer or company?
- Does the vendor have a strong or weak history in regards to application security?
- How popular is the specific plug-in or integration endpoint?
- Is the plugin or integration actively maintained?
- Will the extension require configuration changes that could reduce security (such as exposing additional ports)?
- Does the organization have the experience and resources to properly configure and maintain the offering?

After a plug-in or other integration has been approved, it must be incorporated into the organization's configuration management processes. The software must be kept up-to-date, especially with any security patches that become available. The extension must also be continually reviewed for value; if it is no longer needed, the extension should be removed.

### Integrity Assurance

CI/CD exploits often require attackers to insert themselves into the normal flow of the pipeline and modify the inputs and/or outputs of one or more steps. As such, integrity verification is an important method of reducing risk in CI/CD environments.

As with many other defensive actions, implementation of integrity related controls begins early in the SDLC. As noted earlier, the SCM should require commits to be signed before the code can be merged. Also, as discussed in [Dependency Management](#dependency-management), the package management platform should be configured to use hashes or comparable to verify the integrity of a package. Code signing should also be employed; technologies such as [Sigstore](https://www.sigstore.dev/) or [Signserver](https://www.signserver.org/) may be used for this purpose. However, it is important to note that code signing and related technologies are not absolute guarantors of security; the code signing processes itself can be exploited. Please see [NIST's Security Considerations for Code Signing](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.01262018.pdf) for additional guidance on securing the code signing processes. Finally, integration of the [in-toto.to](https://in-toto.io/) framework or similar can further assist in improving integrity within the CI/CD environment.

### Visibility and Monitoring

CI/CD environments can be complex and may often seem like a opaque-box to developers. However, visibility into these systems is critical for detecting potential attacks, better understand one's risk posture, and detecting and remediating vulnerabilities. Though their value is often underestimated, logging and log analysis are vital for providing visibility into CI/CD systems.

The first step in increasing CI/CD visibility, is ensuring that the logging configuration within the CI/CD environment is compliant with your organization's log management policy. Beyond adherence to internal policies, configure the system to log data in a readily parsable format such as JSON or syslog. Carefully consider what content needs to be logged and at what verbosity. Although proper logging should allow for end-to-end visibility of the pipeline, more logging is not inherently better. One must not only consider the storage costs associated with logs, but also take care to avoid logging any sensitive data. For example, most authentication related events likely should be logged. However, one should never log plaintext passwords, authentication tokens, API keys, or similar secrets.

Once an appropriate logging strategy has been defined and necessary configuration has been performed, one is ready to start utilizing these logs to reduce risk. Sending aggregate logs to a centralized log management system or, preferably, a SIEM is a first step for realizing the value of logs. If a SIEM is used, alert should be carefully configured, and regularly refined, in order to provide timely alerts of anomalies and potential attacks. The exact configuration will vary significantly depending on the CI/CD environment, SIEM platform, and other factors. For an overview of CI/CD observability within the context of the ELK Stack (a popular SIEM platform) refer to this [article](https://www.elastic.co/guide/en/observability/current/ci-cd-observability.html#ci-cd-developers) or reference [this article](https://dzone.com/articles/jenkins-log-monitoring-with-elk) for an alternative approach which can be readily adapted to a variety of CI/CD environments. It is important to keep in mind that SIEM alerts will never be 100% accurate in detecting CI/CD attacks. Both false positive and false negatives will occur. Such platforms should not be relied on unquestioningly, but they do provide important visibility into CI/CD environments and can act as important alert systems when thoughtfully configured.

## GitHub Actions Security

> **Source:** [GitHub Actions Security](https://cheatsheetseries.owasp.org/cheatsheets/GitHub_Actions_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet provides guidance on securing GitHub Actions workflows, primarily for public GitHub repositories. The main goal is to prevent attacker-controlled code execution, which may lead to the following outcomes.

- **Secrets exfiltration.** CI/CD pipelines often use long-lived credentials to access external services (e.g., cloud provider credentials or package registry tokens). Such secrets can be exfiltrated (printing to logs, sending to external endpoints or embedding them in artifacts) via remote code execution.
- **Compromise of `GITHUB_TOKEN` with `write` permissions.** GitHub automatically provides each workflow run with a short-lived `GITHUB_TOKEN` that is scoped to the repository and has specific permissions. If this token is granted with `write` permissions and an attacker is able to exfiltrate or misuse the token, they could potentially modify repository contents, create or alter releases or interact with other GitHub resources.
- **GitHub Actions cache poisoning.** Workflows may reuse cached data across different workflow runs. If an attacker can inject malicious content into the cache and subsequent workflows (such as release pipelines) restore and use this cache, the poisoned data can be executed in a privileged context and potentially compromise the integrity of published release artifacts, obtain code execution in the privileged workflow and steal the production secrets.
- **Denial-of-wallet attacks.** CI/CD pipelines often integrate with paid external services, such as LLMs, for code review. If an attacker can repeatedly trigger pipelines or manipulate inputs to maximize resource consumption, this can lead to uncontrolled spending and financial impact.

### Treat your CI/CD pipeline as a critical production code

Because a CI/CD pipeline usually has access to sensitive credentials and functions/endpoints, it must be treated as a critical asset, potentially even more critical than the source code it processes.
Therefore, secure software development best practices must be applied, including (but not limited to): threat modeling, secure code reviews, security validation and penetration testing.

For deeper guidance and recommended practices, see:

- [NIST "Strategies for the Integration of Software Supply Chain Security in DevSecOps CI/CD Pipeline"](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-204D.pdf);
- [OWASP CI/CD Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html);
- [OWASP Secure Pipeline Verification Standard](https://owasp.org/www-project-spvs).

### Assume failure and have an incident response plan in place

Assume breaches will happen and design for rapid response. Define clear incident response procedures with roles, communication and escalation paths.
Continuously improve by actively learning from other incidents through publicly available post-mortems (e.g., [Trivy post-mortem](https://github.com/aquasecurity/trivy/discussions/10462), [Cline post-mortem](https://cline.bot/blog/post-mortem-unauthorized-cline-cli-npm)).

### Enable static analysis for GitHub Actions workflows

> **Important:**
> CodeQL is freely available for open-source repositories on GitHub.
> Verify that CodeQL is enabled for your repositories and configured to scan GitHub Actions workflow files.
> CodeQL can be enabled via GitHub UI or by including a workflow file under `.github/workflows` folder:
>
> - If enabling via workflow, ensure that `language: actions` is included in the workflow.
> - If enabling via `Settings` → `Advanced Security` → `Code scanning` → `CodeQL analysis`, ensure that `GitHub Actions` appears under the Languages section.

- If available, enable [CodeQL](https://docs.github.com/en/code-security/reference/code-scanning/codeql/codeql-queries/actions-built-in-queries) `actions` scanning in your repositories to detect vulnerabilities in GitHub Actions workflows. In addition, use [Zizmor](https://docs.zizmor.sh/) for defense in depth. Periodically upgrade these tools, as new releases may contain updated detection rules.
- Configure these tools to run on every relevant pull request and mark them as required status checks before merging. At a minimum, block merges when high or critical severity issues are detected.
- Run comprehensive workflow scans on a scheduled basis (e.g., daily) and ensure that findings are tracked and remediated over time.
- If you need to enable scanning across several repositories, try to utilize a centralized reusable workflow or shared actions to standardize security practices (see this [Grafana example](https://github.com/grafana/shared-workflows/blob/main/.github/workflows/reusable-zizmor.yml)).

### Harden repository settings

> **Important:**
> Please note that the `Require approval for first-time contributors` setting presents a security risk because an attacker can submit an initially legitimate-looking pull request
> (e.g., a typo fix) to gain trust and later submit subsequent PRs that introduce malicious changes which are executed in CI without requiring further approval.

- Enable the setting `Require approval for all external contributors` in the repository settings. This ensures that workflows triggered by pull requests from forks (i.e., users who are not members of the repository or organization) do not run automatically and therefore prevents untrusted code execution.
- Restrict default `GITHUB_TOKEN` permissions to `Read repository contents and packages permissions` in the repository settings. Explicitly grant additional permissions in the workflow file if required.
- Enforce strong branch protection rules. Configure branch protection to require pull request reviews, status checks, signed commits and `CODEOWNERS` approval before merging into protected branches. Tools such as the [OpenSSF Scorecard](https://github.com/ossf/scorecard-action) can help audit these settings.
- Require workflows to pass before merging via [repository rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets#require-workflows-to-pass-before-merging) to enforce organizational or enterprise-level requirements — such as checking for required labels or validating commit messages — before code is merged.

### Restrict egress traffic from GitHub-hosted runners

Use solutions (e.g., [Harden-Runner](https://github.com/step-security/harden-runner)) to monitor and restrict egress traffic from GitHub-hosted runners to prevent secret exfiltration.

### Use self-hosted runners with extra caution

Self-hosted runners usually have access to internal networks and may cache credentials, secrets or store internal data.
Because they execute arbitrary code by design, they can be used by an attacker to establish persistent remote access and exfiltrate secrets.
In general, never use self-hosted runners with public repositories, as anyone who can fork the repository and open a pull request can potentially execute code on your runner.

If you use self-hosted runners for a public repository:

- Use standard secure software development best practices when enabling self-hosted runners (threat modeling, secure code reviews, security validation, penetration testing, patching and hardening).
- Use the `Require approval for all external contributors` option, review proposed changes and manually approve each workflow execution for all external contributors.
- Use ephemeral runners (e.g., container-based runners) and destroy the runner environment after each job execution to prevent persistence.
- Do not store sensitive data on runner machines, as any user who can invoke workflows has access to the runner environment.
- Restrict runner network access and avoid giving self-hosted runners access to sensitive infrastructure.

### Segregate runners using runner groups and labels

Use [runner groups](https://docs.github.com/en/actions/concepts/runners/runner-groups) and [labels](https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/apply-labels) to separate high-privilege runners from low-privilege runners. High-privilege runners may have access to sensitive resources, while low-privilege runners should not.

This separation gives more granular control over [which repositories can access a runner group](https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/manage-access#changing-which-repositories-can-access-a-runner-group) and which workflows can target specific runners, reducing the risk that a compromised or misconfigured workflow gains access to sensitive resources.

For example, consider creating:

- A runner group for container image build runners, limited to only the repositories that require those privileges.
- A runner group for runners with access to restricted networks.
- A separate runner group for low-privilege tasks such as linting and static analysis, used by repositories where secrets are absent or isolated in separate environments.

### Maintain curated shared workflows and actions

If you need to support several repositories, establish a centralized repository of curated, security-reviewed workflows/actions and reuse it across other repositories.

For a practical example, see [grafana/shared-workflows](https://github.com/grafana/shared-workflows).

### Prevent artifact poisoning

Artifact poisoning occurs when malicious or untrusted content is introduced into build artifacts, often via shared caches or previously stored dependencies
([GitHub Actions Cache Poisoning](https://adnanthekhan.com/2024/05/06/the-monsters-in-your-build-cache-github-actions-cache-poisoning)).
This can compromise the integrity of released software or lead to production secret exfiltration.
To reduce this risk, disable all forms of caching in release or publishing workflows to avoid reusing potentially compromised artifacts or exfiltrating production secrets.

### Be careful with AI assistant running in CI/CD pipeline

Sometimes, an AI assistant is used directly in workflows, e.g., to review pull requests or triage submitted issues.
This creates a risk of prompt injection attacks, where malicious input manipulates the AI assistant's behavior. If the workflow running the AI assistant has access to secrets or a `GITHUB_TOKEN` with `write` permissions and can be triggered by untrusted users (e.g., any GitHub account), this may lead to secret exfiltration or unauthorized actions.
A real-world example is the ["clinejection" attack](https://adnanthekhan.com/posts/clinejection/).

To mitigate potential attacks, limit AI assistant capabilities — only enable the minimum tools and actions required for task execution.

### Write Secure GitHub Workflows

This section contains some recommendations. In general, a static code analyzer (CodeQL, Zizmor) should report such issues.

#### Avoid dangerous triggers

##### Avoid using the `pull_request_target` trigger

Workflows triggered by `pull_request_target` run in the context of the base (target) repository and have access to the `GITHUB_TOKEN` with `write` permissions and GitHub secrets available to the workflow.
If untrusted code from a PR is checked out and used, this may lead to code execution.
There are some common patterns, like labeling workflows where untrusted code is not checked out, but in general, try to avoid the `pull_request_target` trigger.

> **Important:**
> Never check out (via `actions/checkout` or GitHub CLI) and run untrusted code in this context.

##### Avoid using the `workflow_run` trigger

The `workflow_run` trigger automates tasks based on the execution of other workflows and can grant access to the `GITHUB_TOKEN` with `write` permissions and GitHub secrets.
An attacker can modify triggering workflows via pull requests and cause privileged workflows to run.
Even if the initial workflow is unprivileged, the triggered one may execute with higher permissions, enabling privilege escalation.
Additionally, attackers can exploit artifact poisoning by injecting malicious files that downstream workflows use without verification, leading to potential code execution.
If you need to implement workflow chains, use `workflow_call` with reusable workflows instead.

##### Use `issue_comment` trigger with extra care

This trigger can automate workflows (e.g., end-to-end tests) in response to comments on issues or pull requests and can grant access to the `GITHUB_TOKEN` with `write` permissions and GitHub secrets.
Implementation may introduce a Time-of-Check to Time-of-Use (TOCTOU) issue, where an attacker can modify a pull request between comment approval and workflow execution to run malicious code.
Additionally, this trigger can bypass pull request approval mechanisms, allowing attackers to execute workflows without proper review.

To secure the implementation with the `issue_comment` trigger:

1. Check if the triggering actor meets authorization criteria, e.g., allow workflow execution only if it was triggered by a trusted member of the specific GitHub org.
2. Use the commit SHA in a comment that triggers the workflow: instead of using a `/ok-to-test` comment, design the workflow to accept `/ok-to-test(<trusted_sha_commit>)` and check out code only from `<trusted_sha_commit>` submitted by an authorized actor. This will help mitigate the checkout and execution of untrusted code.

Alternatively, consider replacing the `issue_comment` trigger with label-based triggers.
When using the `pull_request` trigger with the labeled event, `github.event.pull_request.head.sha` contains the latest commit SHA for the pull request.
Users with [triage access can apply labels](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels#applying-a-label). Verify that the actor applying a workflow-triggering label is authorized for that operation; permission to label does not establish that the commit has been reviewed.
Applying a label does not elevate workflow permissions. For pull requests from forks of public repositories, `pull_request` workflows still receive a read-only `GITHUB_TOKEN` and no other secrets, as described in [GitHub's fork workflow restrictions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflows-in-forked-repositories).
After reviewing the proposed code, check out the exact commit SHA available via `github.event.pull_request.head.sha`, which reflects the state of the pull request at the time the label was applied. Do not treat the label as approval for later commits.

> **Important:**
> In general, never check out code using mutable references (e.g., pull request numbers or branch names) - always use immutable references such as a full commit SHA.

#### Use third-party GitHub Actions and reusable workflows securely

##### Use third-party actions with caution

In general, try to minimize third-party actions usage, e.g., use the GitHub API in your workflows when possible to implement required logic.

While using third-party actions, verify the origin, check that the author is trusted and active, ensure that there are multiple active contributors.
Check that the code is stable and safe to use, and that the action does not require unnecessary permissions.

##### Always pin all action and reusable workflow versions with a commit hash and check for impostor commits

Check that the used commit belongs to the specified organization/repository. This will prevent dependency confusion attacks, as currently GitHub resolves the commit SHA,
finds a matching object and executes it regardless of which fork it originated from. This check can be automated with the Zizmor `impostor-commit` [rule](https://docs.zizmor.sh/audits/#impostor-commit).

##### Use automated dependency update tools

- Use tools such as Dependabot or Renovate to keep third-party GitHub Actions up to date.
- Configure a delay between a dependency release and its adoption (e.g., a few days). This helps avoid immediately pulling in newly published malicious or compromised versions, allowing time for the community to detect and report issues. To configure this, Dependabot has a `cooldown` [flag](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference#cooldown), Renovate has a `minimumReleaseAge` [flag](https://docs.renovatebot.com/key-concepts/minimum-release-age/).

#### Minimize `GITHUB_TOKEN` permissions

Always set `permissions: {}` at the workflow level to disable all permissions by default. Then, grant only the specific permissions needed at the job level.

#### Require approval for deployments or publications to critical environments

Use [GitHub environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments) with required approval rules. Define a list of authorized accounts who must manually approve deployments to production or other critical environments before workflow execution.

#### Sanitize user input

An attacker may submit a malicious payload via context (e.g., via PR title) that could cause remote execution.
To prevent injection, always use [intermediate environment variables](https://docs.github.com/en/actions/reference/security/secure-use#good-practices-for-mitigating-script-injection-attacks) to pass any context into `run:` and similar code execution blocks.
Although some input contexts may appear relatively safe, it is better to always follow this approach for consistency and security.

#### Protect secrets used in workflows

##### Try to eliminate all static credentials from your workflows

Try to eliminate all static credentials (e.g., personal access tokens, static cloud keys) used in workflows. Migrate to OIDC-based short-lived authentication tokens ("Trusted publishing").
Currently, many major registries and cloud providers [support](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments) this feature.
For cloud deployment trust restrictions and credential handling, see the [Workload Identity Federation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Workload_Identity_Federation_Cheat_Sheet.html).

##### Secure handling of static credentials (if elimination is unavoidable)

If complete elimination cannot be achieved:

- Never hardcode secrets in workflow files.
- Pass secrets at the step level, not the job level.
- Prefer [environment-level secrets](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments) that are only accessible when a job targets a specific environment.
- Rotate secrets regularly.

##### Eliminate `secrets: inherit` while reusing workflows

When invoking a reusable workflow, `secrets: inherit` passes all secrets available to the calling workflow, including secrets the called workflow may not need. [Explicitly pass only the required secrets](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows#using-inputs-and-secrets-in-a-reusable-workflow).
Also review any `environment` selected by a job inside the reusable workflow: GitHub documents that the environment's secrets are used there and can override secrets passed by the caller. An explicit caller secret map does not remove that separate source of access.

##### Mask sensitive data

Mask all sensitive information that is not a GitHub secret by using `::add-mask::{value}`.
Masking a value prevents a string or variable from being printed in the log

##### Use secret scanning tools

Implement secret scanning in both pre-commit and pull request stages to prevent accidental exposure of sensitive data in the repository:

- Run secret scanning locally (e.g., via pre-commit hooks) to catch issues before code is committed.
- Enforce scanning in pull requests to detect and block any leaked secrets before merging.
- Automatically fail checks when potential secrets are detected to ensure remediation before proceeding.

##### `actions/checkout` should be used with `persist-credentials: false`

Unless needed for git operations, `actions/checkout` should be used with `persist-credentials: false`.
This prevents Git credentials from being persisted to the workflow's environment, reducing the risk of credential exposure if the workflow is compromised.

## Cloud Architecture Security

> **Source:** [Cloud Architecture Security](https://cheatsheetseries.owasp.org/cheatsheets/Secure_Cloud_Architecture_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet will discuss common and necessary security patterns to follow when creating and reviewing cloud architectures. Each section will cover a specific security guideline or cloud design decision to consider. This sheet is written for a medium to large scale enterprise system, so additional overhead elements will be discussed, which may be unnecessary for smaller organizations.

### Risk Analysis, Threat Modeling, and Attack Surface Assessments

See the [Secure Product Design Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secure_Product_Design_Cheat_Sheet.html) for application design guidance.

With any application architecture, understanding the risks and threats is extremely important for proper security. No one can spend their entire budget or bandwidth focused on security, so properly allocating security resources is necessary.
Therefore, enterprises must perform risk assessments, threat modeling activities, and attack surface assessments to identify the following:

- What threats an application might face
- The likelihood of those threats actualizing as attacks
- The attack surface with which those attacks could be targeted
- The business impact of losing data or functionality due to said attack

This is all necessary to properly scope the security of an architecture. However, these are subjects that can/should be discussed in greater detail. Use the resources link below to investigate further as part of a healthy secure architecture conversation.

- [Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html)
- [Attack Surface Analysis Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Attack_Surface_Analysis_Cheat_Sheet.html)
- [CISA Cyber Risk Assessment](https://www.cisa.gov/sites/default/files/2023-02/22_1201_safecom_guide_to_cybersecurity_risk_assessment_508-r1.pdf)

### Public and Private Components

#### Secure Object Storage

Object storage usually has the following options for accessing data:

- Accessing resources using built-in Identity and Access Management policies
- Using cryptographically signed URLs and HTTP requests
- Directly accessing with public storage

##### IAM Access

This method involves indirect access on tooling such as a managed or self-managed service running on ephemeral or persistent infrastructure. Authenticate the service with a workload identity or federated role that obtains short-lived credentials, instead of embedding a persistent access key. For example, [AWS recommends temporary credentials from IAM roles or federation](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds.html) for application access. Limit the service's permissions to the required storage operations and resources. The method is best used when the application has other user interfaces or data systems available, when it is important to hide as much of the storage system as possible, or when the information shouldn't/won't be seen by an end user (metadata). It can be used in combination with web authentication and logging to better track and control access to resources. The key security concern for this approach is relying on developed code or policies which could contain weaknesses.

|                 Pros                 |                       Cons                         |
|:------------------------------------:|:--------------------------------------------------:|
|       No direct access to data       |          Potential use of broad IAM policy         |
| No user visibility to object storage | Stolen credentials expose permitted resources |
|   Identifiable and loggable access   |           Credentials could be hardcoded           |

This approach is acceptable for sensitive user data, but must follow rigorous coding and cloud best practices, in order to properly secure data.

##### Signed URLs

URL Signing for object storage involves using some method or either statically or dynamically generating URLs, which cryptographically guarantee that an entity can access a resource in storage. This is best used when direct access to specific user files is necessary or preferred, as there is no file transfer overhead. It is advisable to only use this method for user data which is not very sensitive. This method can be secure, but has notable cons. Code injection may still be possible if the method of signed URL generation is custom, dynamic and injectable, and anyone can access the resource anonymously, if given the URL. Developers must also consider if and when the signed URL should expire, adding to the complexity of the approach.

|                    Pros                   |                    Cons                   |
|:-----------------------------------------:|:-----------------------------------------:|
|        Access to only one resource        |              Anonymous Access             |
| Minimal user visibility to object storage |         Anyone can access with URL        |
|           Efficient file transfer         | Possibility of injection with custom code |

##### Public Object Storage

**This is not an advisable method for resource storage and distribution**, and should only be used for public, non-sensitive, generic resources. This storage approach will provide threat actors additional reconnaissance into a cloud environment, and any data which is stored in this configuration for any period of time must be considered publicly accessed (leaked to the public).

|                 Pros                |                 Cons                 |
|:-----------------------------------:|:------------------------------------:|
| Efficient access to many resources  |     Anyone can access/No privacy     |
|       Simple public file share      |  Unauthenticated access to objects   |
|                                     |  Visibility into full file system    |
|                                     |     Accidentally leak stored info      |

#### VPCs and Subnets

Virtual Private Clouds (VPC) and public/private network subnets allow an application and its network to be segmented into distinct chunks, adding layers of security within a cloud system. Unlike other private vs public trade-offs, an application will likely incorporate most or all of these components in a mature architecture. Each is explained below.

##### VPCs

VPC's are used to create network boundaries within an application, where-in components can talk to each other, much like a physical network in a data center. The VPC will be made up of some number of subnets, both public and private. VPCs can be used to:

- Separate entire applications within the same cloud account.
- Separate large components of application into distinct VPCs with isolated networks.
- Create separations between duplicate applications used for different customers or data sets.

##### Public Subnets

Public subnets house components which will have an internet facing presence. The subnet will contain network routing elements to allow components within the subnet to connect directly to the internet. Some use cases include:

- Public facing resources, like front-end web applications.
- Initial touch points for applications, like load balancers and routers.
- Developer access points, like [bastions](https://aws-quickstart.github.io/quickstart-linux-bastion/) (note, these can be very insecure if engineered/deployed incorrectly).

##### Private Subnets

Private subnets house components which should not have direct internet access. The subnet will likely contain network routing to connect it to public subnets, to receive internet traffic in a structured and protected way. Private subnets are great for:

- Databases and data stores.
- Backend servers and associated file systems.
- Anything deemed too sensitive for direct internet access.

##### Simple Architecture Example

Consider the simple architecture diagram below. A VPC will house all of the components for the application, but elements will be in a specific subnet depending on its role within the system. The normal flow for interacting with this application might look like:

1. Accessing the application through some sort of internet gateway, API gateway or other internet facing component.
2. This gateway connects to a load balancer or a web server in a public subnet. Both components provide public facing functions and are secured accordingly.
3. These components then interact with their appropriate backend counterparts, a database or backend server, contained in a private VPC. This connections are more limited, preventing extraneous access to the possibly "soft" backend systems.

![VPC Diagram](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Secure_Cloud_Architecture_VPC.png)

*Note: This diagram intentionally skips routing and IAM elements for subnet interfacing, for simplicity and to be service provider agnostic.*

This architecture prevents less hardened backend components or higher risk services like databases from being exposed to the internet directly. It also provides common, public functionality access to the internet to avoid additional routing overhead. This architecture can be secured more easily by focusing on security at the entry points and separating functionality, putting non-public or sensitive information inside a private subnet where it will be harder to access by external parties.

### Trust Boundaries

Trust boundaries are connections between components within a system where a trust decision has to be made by the components. Another way to phrase it, this boundary is a point where two components with potentially different trust levels meet. These boundaries can range in scale, from the degrees of trust given to users interacting with an application, to trusting or verifying specific claims between code functions or components within a cloud architecture. Do not grant access merely because a component is internal or owned by the same organization. [NIST SP 800-207](https://csrc.nist.gov/pubs/sp/800/207/final) requires explicit authentication and authorization for protected resources rather than trust based solely on network location or ownership. Identify these checks between cloud components as well as at connections to end users and other vendors.

As an example, consider the architecture below. An API gateway connects to a compute instance (ephemeral or persistent), which then accesses a persistent storage resource. Separately, there exists a server which can verify the authentication, authorization and/or identity of the caller. This is a generic representation of an OAuth, IAM or directory system, which controls access to these resources. Additionally, there exists an Ephemeral IAM server which controls access for the stored resources (using an approach like the [IAM Access](#iam-access) section above). As shown by the dotted lines, trust boundaries exist between each compute component, the API gateway and the auth/identity server, even though many or all of the elements could be in the same application.

![Trust Boundaries](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Secure_Cloud_Architecture_Trust_Boundaries_1.png)

#### Exploring Different Levels of Trust

Architects have to select a trust configuration between components, using quantitative factors like risk score/tolerance, velocity of project, as well as subjective security goals. Each example below details trust boundary relationships to better explain the implications of trusting a certain resource. The threat level of a specific resource as a color from green (safe) to red (dangerous) will outline which resources shouldn't be trusted.

##### 1. No trust example

As shown in the diagram below, this example outlines a model where no component trusts any other component, regardless of criticality or threat level. This type of trust configuration would likely be used for incredibly high risk applications, where either very personal data or important business data is contained, or where the application as a whole has an extremely high business criticality.

Notice that both the API gateway and compute components call out to the auth/identity server. This implies that no data passing between these components, even when right next to each other "inside" the application, is considered trusted. The compute instance must then assume an ephemeral identity to access the storage, as the compute instance isn't trusted to a specific resource even if the user is trusted to the instance.

Also note the lack of trust between the auth/identity server and ephemeral IAM server and each component. While not displayed in the diagram, this would have additional impacts, like more rigorous checks before authentication, and possibly more overhead dedicated to cryptographic operations.

![No Trust Across Boundaries](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Secure_Cloud_Architecture_Trust_Boundaries_2.png)

This could be a necessary approach for applications found in financial, military or critical infrastructure systems. However, security must be careful when advocating for this model, as it will have significant performance and maintenance drawbacks.

|              Pros                |         Cons          |
|:--------------------------------:|:---------------------:|
| High assurance of data integrity | Slow and inefficient  |
|         Defense in depth         |      Complicated      |
|                                  | Likely more expensive |

##### 2. High trust example

Next, consider the opposite approach, where everything is trusted. In this instance, the "dangerous" user input is trusted and essentially handed directly to a high criticality business component. The auth/identity resource is not used at all. In this instance, there is higher likelihood of a successful attack against the system, because there are no controls in place to prevent it. Additionally, this setup could be considered wasteful, as both the auth/identity and ephemeral IAM servers are not necessarily performing their intended function. *(These could be shared corporate resources that aren't being used to their full potential).*

![Complete Trust Across Boundaries](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Secure_Cloud_Architecture_Trust_Boundaries_3.png)

This is an unlikely architecture for all but the simplest and lowest risk applications. **Do not use this trust boundary configuration** unless there is no sensitive content to protect or efficiency is the only metric for success. Trusting user input is never recommended, even in low risk applications.

| Pros      | Cons                    |
|:---------:|:-----------------------:|
| Efficient |        Insecure         |
|  Simple   |   Potentially Wasteful  |
|           | High risk of compromise |

##### 3. Some trust example

Use risk analysis to place and configure access controls, rather than to omit verification of internal requests. A gateway can perform shared authentication checks, while services enforce authorization that requires resource or business context. See [gateway and service-level authorization](https://cheatsheetseries.owasp.org/cheatsheets/Microservices_Security_Cheat_Sheet.html#service-level-authorization).

In this example, the compute instance must authenticate the calling gateway, validate propagated user context, and enforce permissions for the requested operation. Prevent direct access that bypasses gateway checks. The instance uses its own least-privileged identity to access storage; an authenticated user does not automatically authorize every storage operation.

![Some Trust Across Boundaries](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Secure_Cloud_Architecture_Trust_Boundaries_4.png)

By nature, this approach limits the pros and cons of both previous examples. This model will likely be used for most applications, unless the benefits of the above examples are necessary to meet business requirements.

|                   Pros                   |          Cons          |
|:----------------------------------------:|:----------------------:|
|           Secured based on risk          | Known gaps in security |
| Cost/Efficiency derived from criticality |                        |

*Note: This trust methodology diverges from Zero Trust. For a more in depth look at that topic, check out [CISA's Zero Trust Maturity Model](https://www.cisa.gov/sites/default/files/2023-04/zero_trust_maturity_model_v2_508.pdf)*.

### Security Tooling

#### Web Application Firewall

Web Application Firewalls (WAF) are used to monitor or block common attack payloads (like [XSS](https://owasp.org/www-community/attacks/xss/) and [SQLi](https://owasp.org/www-community/attacks/SQL_Injection)), or allow only specific request types and patterns. Applications should use them as a first line of defense, attaching them to entry points like load balancers or API gateways, to handle potentially malicious content before it reaches application code. Cloud service providers curate base rule sets which will block or monitor common malicious payloads:

- [AWS Managed Rules](https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-list.html)
- [GCP WAF Rules](https://cloud.google.com/armor/docs/waf-rules)
- [Azure Core Rule Sets](https://learn.microsoft.com/en-us/azure/web-application-firewall/ag/application-gateway-crs-rulegroups-rules?tabs=owasp32)

By design these rule sets are generic and will not cover every attack type an application will face. Consider creating custom rules which will fit the application's specific security needs, like:

- Filtering routes to acceptable endpoints (block web scraping)
- Adding specific protections for chosen technologies and key application endpoints
- Rate limiting sensitive APIs

#### Logging & Monitoring

Logging and monitoring is required for a truly secure application. Developers should know exactly what is going on in their environment, making use of alerting mechanisms to warn engineers when systems are not working as expected. Additionally, in the event of a security incident, logging should be verbose enough to track a threat actor through an entire application, and provide enough knowledge for respondents to understand what actions were taken against what resources. Note that proper logging and monitoring can be expensive, and risk/cost trade-offs should be discussed when putting logging in place.

##### Logging

For proper logging, consider:

- Logging HTTP request outcomes using an allow-listed event schema, such as method, route template, status, correlation ID, and a non-secret actor identifier
    - Exclude credentials, session cookies, access tokens, and sensitive request or response content before collection. [HTTP authentication fields contain credentials](https://www.rfc-editor.org/rfc/rfc9110.html#section-11.4); do not capture all headers or bodies by default. Follow the [Logging Cheat Sheet data exclusions](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude).
- Logging internal actions with actor and permission information
- Sending trace IDs through the entire request lifecycle to track errors or malicious actions
- Masking or removing sensitive data
    - SSNs, sensitive health information, and other PII should not be stored in logs

*Legal and compliance representatives should weigh in on log retention times for the specific application.*

##### Monitoring

For proper monitoring consider adding:

- Anomaly alerts:
    - HTTP 4xx and 5xx errors above a percent of normal
    - Memory, storage or CPU usage above/below percent of normal
    - Database writes/reads above/below percent of normal
    - Serverless compute invocations above percent of normal
- Alerting for failed health checks
- Alerting for deployment errors or container on/off cycling
- Alerts or cutoffs for cost limits

Anomalies by count and type can vary wildly from app to app. A proper understanding of what qualifies as an anomaly requires an environment specific baseline. Therefore, the percentages mentioned above should be chosen based off that baseline, in addition to considerations like risk and team response capacity.

WAFs can also have monitoring or alerting attached to them for counting malicious payloads or (in some cases) anomalous activity detection.

#### DDoS Protection

Cloud service providers offer a range of DDoS protection products, from simple to advanced, depending on application needs. Simple DDoS protection can often be implemented using WAFs with rate limits and route blocking rules. More advanced protection may require specific managed tools offered by the cloud service provider. Examples include:

- [AWS Shield](https://aws.amazon.com/shield/)
- [GCP Cloud Armor Managed Protection](https://cloud.google.com/armor/docs/managed-protection-overview)
- [Azure DDoS Protection](https://learn.microsoft.com/en-us/azure/ddos-protection/ddos-protection-overview)

The decision to enable advanced DDoS protections for a specific application should be based off risk and business criticality of application, taking into account mitigating factors and cost (these services can be very inexpensive compared to large company budgets).

### Shared Responsibility Model

The Shared Responsibility Model is a framework for cloud service providers (CSPs) and those selling cloud based services to properly identify and segment the responsibilities of the developer and the provider. This is broken down into different levels of control, corresponding to different elements/layers of the technology stack. Generally, components like physical computing devices and data center space are the responsibility of the CSP. Depending on the level of [management](#self-managed-tooling), the developer could be responsible for the entire stack from operating system on up, or only for some ancillary functionality, code or administration.

This responsibility model is often categorized into three levels of service called:

- Infrastructure as a Service ([IaaS](#iaas))
- Platform as a Service ([PaaS](#paas))
- Software as a Service ([SaaS](#saas))

*Many other service classifications exist, but aren't listed for simplicity and brevity.*

As each name indicates, the level of responsibility the CSP assumes is the level of "service" they provide. Each level provides its own set of pros and cons, discussed below.

#### IaaS

In the case of IaaS, the infrastructure is maintained by the CSP, while everything else is maintained by the developer. This includes:

- Authentication and authorization
- Data storage, access and management
- Certain networking tasks (ports, NACLs, etc)
- Application software

This model favors developer configurability and flexibility, while being more complex and generally higher cost than other service models. It also most closely resembles on premise models which are waning in favor with large companies. Because of this, it may be easier to migrate certain applications to cloud IaaS, than to re-architect with a more cloud native architecture.

|             Pros             |            Cons           |
|:----------------------------:|:-------------------------:|
| Control over most components |        Highest cost       |
|   High level of flexilibity  | More required maintenance |
| Easy transition from on-prem |  High level of complexity |

**Responsibility is held almost exclusively by the developer, and must be secured as such**. Everything, from network access control, operating system vulnerabilities, application vulnerabilities, data access, and authentication/authorization must be considered when developing an IaaS security strategy. Like described above, this offers a high level of control across almost everything in the technology stack, but can be very difficult to maintain without adequate resources going to tasks like version upgrades or end of life migrations. *([Self-managed security updates](#update-strategy-for-self-managed-services) are discussed in greater detail below.)*

#### PaaS

Platform as a Service is in the middle between IaaS and SaaS. The developer controls:

- Application authentication and authorization
- Application software
- External data storage

It provides neatly packaged code hosting and containerized options, which allow smaller development teams or less experienced developers a way to get started with their applications while ignoring more complex or superfluous computing tasks. It is generally less expensive than IaaS, while still retaining some control over elements that a SaaS system does not provide. However, developers could have problems with the specific limitations of the offering used, or issues with compatibility, as the code must work with the correct container, framework or language version.

Also, while scalability is very dependent on provider and setup, PaaS usually provides higher scalability due to containerization options and common, repeatable base OS systems. Compared to IaaS, where scalability must be built by the developer, and SaaS, where the performance is very platform specific.

|              Pros              |              Cons              |
|:------------------------------:|:------------------------------:|
| Easier to onboard and maintain | Potential compatibility issues |
|       Better scalability       |  Offering specific limitations |

Manual security in PaaS solutions is similarly less extensive (compared to IaaS). Application specific authentication and authorization must still be handled by the developer, along with any access to external data systems. However, the CSP is responsible for securing containerized instances, operating systems, ephemeral files systems, and certain networking controls.

#### SaaS

The Software as a Service model is identified by a nearly complete product, where the end user only has to configure or customize small details in order to meet their needs. The user generally controls:

- Configuration, administration and/or code within the product's boundaries
- Some user access, such as designating administrators
- High level connections to other products, through permissions or integrations

The entire technology stack is controlled by the provider (cloud service or other software company), and the developer will only make relatively small tweaks to meet custom needs. This limits cost and maintenance, and problems can typically be solved with a provider's customer support, as opposed to needing technical knowledge to troubleshoot the whole tech stack.

|               Pros               |                Cons                |
|:--------------------------------:|:----------------------------------:|
|          Low maintenance         | Restricted by provider constraints |
|            Inexpensive           |           Minimal control          |
| Customer support/troubleshooting |      Minimal insight/oversight     |

Security with SaaS is simultaneously the easiest and most difficult, due to the lack of control expressed above. A developer will only have to manage a small set of security functions, like some access controls, the data trust/sharing relationship with integrations, and any security implications of customizations. All other layers of security are controlled by the provider. This means that any security fixes will be out of the developer's hands, and therefore could be handled in a untimely manner, or not to a satisfactory level of security for an end user (depending on security needs). However, such fixes won't require end user involvement and resources, making them easier from the perspective of cost and maintenance burden.

*Note: When looking for SaaS solutions, consider asking for a company's attestation records and proof of compliance to standards like [ISO 27001](https://www.iso.org/standard/27001). Listed below are links to each of the major CSPs' attestation sites for additional understanding.*

- [GCP](https://cloud.google.com/security/compliance/offerings)
- [AWS](https://aws.amazon.com/compliance/programs/)
- [Azure](https://servicetrust.microsoft.com/ViewPage/HomePageVNext)

#### Self-managed tooling

Another way to describe this shared responsibility model more generically is by categorizing cloud tooling on a spectrum of "management". Fully managed services leave very little for the end developer to handle besides some coding or administrative functionality (SaaS), while self-managed systems require much more overhead to maintain (IaaS).

AWS provides an excellent example of this difference in management, identifying where some of their different products fall onto different points in the spectrum.

![Shared Responsibility Model](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Secure_Cloud_Architecture_Shared_Responsibility_Model.png)

*Note: It is hard to indicate exactly which offerings are considered what type of service (Ex: IaaS vs PaaS). Developers should look to understand the model which applies to the specific tool they are using.*

##### Update Strategy for Self-managed Services

Self-managed tooling will require additional overhead by developers and support engineers. Depending on the tool, basic version updates, upgrades to images like [AMIs](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html) or [Compute Images](https://cloud.google.com/compute/docs/images), or other operating system level maintenance will be required. Use automation to regularly update minor versions or [images](https://docs.aws.amazon.com/systems-manager/latest/userguide/automation-tutorial-update-patch-golden-ami.html), and schedule time in development cycles for refreshing stale resources.

##### Avoid Gaps in Managed Service Security

Managed services will offer some level of security, like updating and securing the underlying hardware which runs application code. However, the development team are still responsible for many aspects of security in the system. Ensure developers understand what security will be their responsibility based on tool selection. Likely the following will be partially or wholly the responsibility of the developer:

- Authentication and authorization
- Logging and monitoring
- Code security ([OWASP Top 10](https://owasp.org/www-project-top-ten/))
- Third-party library patching

Refer to the documentation provided by the cloud service provider to understand which aspects of security are the responsibility of each party, based on the selected service. For example, in the case of serverless functions:

- [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-security.html)
- [GCP Cloud Functions](https://cloud.google.com/functions/docs/securing)
- [Azure Functions](https://learn.microsoft.com/en-us/azure/architecture/serverless-quest/functions-app-security)

## Network segmentation

> **Source:** [Network segmentation](https://cheatsheetseries.owasp.org/cheatsheets/Network_Segmentation_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Network segmentation is the core of multi-layer defense in depth for modern services. Segmentation slow down an attacker if he cannot implement attacks such as:

- SQL-injections, see [SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html);
- compromise of workstations of employees with elevated privileges;
- compromise of another server in the perimeter of the organization;
- compromise of the target service through the compromise of the LDAP directory, DNS server, and other corporate services and sites published on the Internet.

The main goal of this cheat sheet is to show the basics of network segmentation to effectively counter attacks by building a secure and maximally isolated service network architecture.

Segmentation will avoid the following situations:

- executing arbitrary commands on a public web server (NginX, Apache, Internet Information Service) prevents an attacker from gaining direct access to the database;
- having unauthorized access to the database server, an attacker cannot access CnC on the Internet.

### Content

- Schematic symbols;
- Three-layer network architecture;
- Interservice interaction;
- Network security policy;
- Useful links.

### Schematic symbols

Elements used in network diagrams:

![Schematic symbols](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Network_Segmentation_Cheat_Sheet_Schematic_symbols.drawio.png)

Crossing the border of the rectangle means crossing the firewall:
![Traffic passes through two firewalls](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Network_Segmentation_Cheat_Sheet_firewall_1.drawio.png)

In the image above, traffic passes through two firewalls with the names FW1 and FW2

![Traffic passes through one firewall](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Network_Segmentation_Cheat_Sheet_firewall_2.drawio.png)

In the image above, traffic passes through one firewall, behind which there are two VLANs

Further, the schemes do not contain firewall icons so as not to overload the schemes

### Three-layer network architecture

By default, developed information systems should consist of at least three components (**security zones**):

1. [FRONTEND](https://cheatsheetseries.owasp.org/cheatsheets/Network_Segmentation_Cheat_Sheet.html#FRONTEND);
2. [MIDDLEWARE](https://cheatsheetseries.owasp.org/cheatsheets/Network_Segmentation_Cheat_Sheet.html#MIDDLEWARE);
3. [BACKEND](https://cheatsheetseries.owasp.org/cheatsheets/Network_Segmentation_Cheat_Sheet.html#BACKEND).

#### FRONTEND

FRONTEND - A frontend is a set of segments with the following network elements:

- balancer;
- application layer firewall;
- web server;
- web cache.

![FRONTEND](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Network_Segmentation_Cheat_Sheet_FRONTEND.drawio.png)

#### MIDDLEWARE

MIDDLEWARE - a set of segments to accommodate the following network elements:

- web applications that implement the logic of the information system (processing requests from clients, other services of the company and external services; execution of requests);
- authorization services;
- analytics services;
- message queues;
- stream processing platform.

![MIDDLEWARE](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Network_Segmentation_Cheat_Sheet_MIDDLEWARE.drawio.png)

#### BACKEND

BACKEND - a set of network segments to accommodate the following network elements:

- SQL database;
- LDAP directory (Domain controller);
- storage of cryptographic keys;
- file server.

![BACKEND](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Network_Segmentation_Cheat_Sheet_BACKEND.drawio.png)

#### Example of Three-layer network architecture

![BACKEND](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Network_Segmentation_Cheat_Sheet_TIER_Example.drawio.png)
The following example shows an organization's local network. The organization is called "Сontoso".

The edge firewall contains 2 VLANs of **FRONTEND** security zone:

- _DMZ Inbound_ - a segment for hosting services and applications accessible from the Internet, they must be protected by WAF;
- _DMZ Outgoing_ - a segment for hosting services that are inaccessible from the Internet, but have access to external networks (the firewall does not contain any rules for allowing traffic from external networks).

The internal firewall contains 4 VLANs:

- **MIDDLEWARE** security zone contains only one VLAN with name _APPLICATIONS_ - a segment designed to host information system applications that interact with each other (interservice communication) and interact with other services;
- **BACKEND** security zone contains:
    - _DATABASES_ - a segment designed to delimit various databases of an automated system;
    - _AD SERVICES_ - segment designed to host various Active Directory services, in the example only one server with a domain controller Contoso.com is shown;
    - _LOGS_ - segment, designed to host servers with logs, servers centrally store application logs of an automated system.

### Interservice interaction

Usually some information systems of the company interact with each other. It is important to define a firewall policy for such interactions.
The base allowed interactions are indicated by the green arrows in the image below:
![Interservice interaction](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Network_Segmentation_Cheat_Sheet_interservice.drawio.png)
The image above also shows the allowed access from the FRONTEND and MIDDLEWARE segments to external networks (the Internet, for example).

From this image follows:

1. Access between FRONTEND and MIDDLEWARE segments of different information systems is prohibited;
2. Access from the MIDDLEWARE segment to the BACKEND segment of another service is prohibited (access to a foreign database bypassing the application server is prohibited).

Forbidden accesses are indicated by red arrows in the image below:
![Prohibited Interservice Communication](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Network_Segmentation_Cheat_Sheet_interservice_deny.drawio.png)

#### Many applications on the same network

If you prefer to have fewer networks in your organization and host more applications on each network, it is acceptable to host the load balancer on those networks. This balancer will balance traffic to applications on the network.
In this case, it will be necessary to open one port to such a network, and balancing will be performed, for example, based on the HTTP request parameters.
An example of such segmentation:
![Interservice Communication with balancing](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Network_Segmentation_Cheat_Sheet_interservice_balancer.drawio.png)

As you can see, there is only one incoming access to each network, access is opened up to the balancer in the network. However, in this case, segmentation no longer works, access control between applications from different network segments is performed at the 7th level of the OSI model using a balancer.

### Network security policy

The organization must define a "paper" policy that describes firewall rules and basic allowed network access.
This policy is at least useful for:

- network administrators;
- security representatives;
- IT auditors;
- architects of information systems and software;
- developers;
- IT administrators.

It is convenient when the policy is described by similar images. The information is presented as concisely and simply as possible.

#### Examples of individual policy provisions

Examples in the network policy will help colleagues quickly understand what access is potentially allowed and can be requested.

##### Permissions for CI/CD

The network security policy may define, for example, the basic permissions allowed for the software development system. Let's look at an example of what such a policy might look like:
![CI-CD](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Network_Segmentation_Cheat_Sheet_repo.drawio.png)

##### Secure logging

It is important that in the event of a compromise of any information system, its logs are not subsequently modified by an attacker. To do this, you can do the following: copy the logs to a separate server, for example, using the syslog protocol, which does not allow an attacker to modify the logs, syslog only allows you to add new events to the logs.
The network security policy for this activity looks like this:
![Logging](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Network_Segmentation_Cheat_Sheet_logs.drawio.png)

In this example, we are also talking about application logs that may contain security events, as well as potentially important events that may indicate an attack.

##### Permissions for monitoring systems

Suppose a company uses Zabbix as an IT monitoring system. In this case, the policy might look like this:
![Zabbix-Example](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Network_Segmentation_Cheat_Sheet_Monitoring.drawio.png)

### Useful links

- Full network segmentation cheat sheet by [sergiomarotco](https://github.com/sergiomarotco): [link](https://github.com/sergiomarotco/Network-segmentation-cheat-sheet).

## Workload Identity Federation

> **Source:** [Workload Identity Federation](https://cheatsheetseries.owasp.org/cheatsheets/Workload_Identity_Federation_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Use workload identity federation instead of stored, long-lived cloud credentials for continuous integration and continuous deployment (CI/CD), when both platforms support it. This cheat sheet covers OpenID Connect (OIDC) federation for deployment jobs. It removes the need to keep a reusable cloud key in the pipeline, as described in [GitHub's OIDC overview](https://docs.github.com/en/actions/concepts/security/openid-connect). Manage secrets that cannot be replaced through the [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).

Federation does not make a compromised job trustworthy. Code running in an authorized job can use its identity and credentials. Keep untrusted pull request code out of jobs that can obtain production access; apply the [CI/CD Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html) and, where applicable, the [GitHub Actions Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/GitHub_Actions_Security_Cheat_Sheet.html). See GitHub's explanation of [compromised runner risks](https://docs.github.com/en/actions/concepts/security/compromised-runners).

### Understand the Trust Boundary

The CI/CD platform issues a signed OIDC token describing the job. The job presents it to the cloud provider, which validates it against a configured trust policy before issuing temporary credentials. These may be access tokens or temporary access keys, depending on the provider. Use the provider's supported federation integration; do not implement a token validator in the pipeline. See the [Google Cloud deployment pipeline integration](https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines).

Validating a token against the configured trusted issuer does not by itself authorize production access. Configure both controls:

- **Trust policy:** which external workloads may obtain credentials.
- **Permissions policy:** which resources and operations those credentials authorize. A tightly scoped trust policy does not compensate for an administrative deployment role. [AWS distinguishes the role's trust and permissions policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html).

### Restrict Which Jobs Are Trusted

- Configure the exact trusted issuer (`iss`), expected audience (`aud`), and allowed subject (`sub`) or equivalent workload attributes. The provider must validate the signature and token validity period as well as these restrictions. Use the actual claims issued for your job and the provider's documented matching rules; for example, [Microsoft Entra requires matching issuer, subject, and audience values](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation-considerations).
- Restrict access to the intended organization, repository or project, and deployment context. Trusting a shared CI/CD issuer alone can admit other tenants. Prefer immutable, non-reusable organization and repository identifiers where supported, rather than names that another owner could acquire. [Google Cloud documents these tenant restrictions and identifier risks](https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines).
- Allow only the required branches, environments, or workflows. Avoid wildcards that admit every repository or every job context. Verify which claims the cloud provider can actually enforce; a claim's presence in a token does not mean it is available as a policy condition. Follow the provider's integration documentation, such as [GitHub's AWS OIDC configuration guidance](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws).
- Require reviews for changes to trusted deployment workflow files; see the [GitHub Actions repository hardening guidance](https://cheatsheetseries.owasp.org/cheatsheets/GitHub_Actions_Security_Cheat_Sheet.html#harden-repository-settings).
- When trusting a deployment environment, protect who can use it and which branches or tags may deploy to it. For GitHub Actions, the default environment-based subject does not also contain the branch. Match the subject format configured for your repository and enforce the branch restriction through environment protection or another supported condition. See the [GitHub OIDC subject reference](https://docs.github.com/en/actions/reference/security/oidc).

### Limit Credential Exposure and Permissions

- Grant only the cloud operations and resources the deployment needs. Use separate identities and trust rules for production and non-production. Keep federation configuration and permission administration outside ordinary deployment roles to prevent a compromised job from widening its own access. See [Google Cloud's federation security practices](https://docs.cloud.google.com/iam/docs/best-practices-for-using-workload-identity-federation).
- Enable OIDC token requests only for jobs that need cloud access. In GitHub Actions, set `id-token: write` at the job level; it permits token requests and does not itself grant cloud permissions. See [GitHub's OIDC permission requirements](https://docs.github.com/en/actions/reference/security/oidc#workflow-permissions-for-the-requesting-the-oidc-token).
- Request the shortest credential lifetime the provider supports that meets the job's needs. Do not assume credentials expire when the job ends or when its OIDC token expires: issued cloud credentials have their own lifetime. For example, [AWS temporary credentials remain valid until expiry unless their access is disabled](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_control-access_disable-perms.html).
- Treat both the OIDC token and issued credentials as secrets: do not print them, place them in artifacts or caches, or pass them to unrelated jobs. After verifying migration, revoke the replaced static keys and remove pipeline copies so they cannot bypass the federation restrictions. Apply the [Secrets Management lifecycle guidance](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html#27-secret-lifecycle).

### Verify and Monitor Access

Before production use, test the permitted deployment and verify that unauthorized repositories, branches, and job contexts cannot obtain production credentials. Confirm that the authorized job cannot access resources outside its assigned permissions. Repeat these checks after changes to trust policies, claim formats, or workflow configuration. Use the platform's documented claims, such as the [GitHub OIDC reference](https://docs.github.com/en/actions/reference/security/oidc), to select relevant cases.

Enable cloud audit events for token exchange and role or service account use. Check which identity fields are recorded and correlate them with CI/CD run records; complete workflow attribution is not automatic. For example, [Google Cloud requires enabling relevant data access logs and choosing an unambiguous subject mapping](https://docs.cloud.google.com/iam/docs/best-practices-for-using-workload-identity-federation#enable-data-access-logs). Alert on unexpected identities and changes to federation trust or permissions.

Prepare to stop new credential issuance and restrict already-issued credentials if a job is compromised. Removing a trust relationship alone is not a guarantee that existing sessions stop working. Follow the provider's incident procedure, such as [revoking AWS role session permissions](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_revoke-sessions.html), and account for policy propagation delays.

## Database Security

> **Source:** [Database Security](https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet provides guidance for securely configuring SQL databases such as MySQL, PostgreSQL, MariaDB, and Microsoft SQL Server.
It is designed primarily for application developers and system administrators responsible for managing or interacting with relational databases.

For application-layer injection defenses, see the [SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html).
For guidance on non-relational systems (e.g., MongoDB, Redis, Cassandra, DynamoDB), refer to the [NoSQL Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html)

### Protecting the Backend Database

The application's backend database should be isolated from other servers and only connect with as few hosts as possible. This task will depend on the system and network architecture. Consider these suggestions:

- Disabling network (TCP) access and requiring all access is over a local socket file or named pipe.
- Configuring the database to only bind on localhost.
- Restricting access to the network port to specific hosts with firewall rules.
- Placing the database server on a dedicated internal network segment that is isolated from the application server.
- Protect any web-based management tools (e.g., phpMyAdmin, pgAdmin) with authentication, HTTPS, and network restrictions.

When an application is running on an untrusted system (such as a thick-client), it should always connect to the backend through an API that can enforce appropriate access control and restrictions. Direct connections should **never** be made from a thick client to the backend database.

#### Implementing Transport Layer Protection

Most database default configurations start with unencrypted network connections, though some do encrypt the initial authentication (such as Microsoft SQL Server). Even if the initial authentication is encrypted, the rest of the traffic will be unencrypted and all kinds of sensitive information will be sent across the network in clear text. The following steps should be taken to prevent unencrypted traffic:

- Configure the database to only allow encrypted connections.
- Install a trusted digital certificate on the server.
- The client application should connect using TLSv1.2+ with modern ciphers (e.g, AES-GCM or ChaCha20).
- The client application should verify that the digital certificate is correct.

The [Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html) contains further guidance on securely configuring TLS.

### Configuring Secure Authentication

The database should always require authentication, including connections from the local server. Database accounts should be:

- Protected with strong and unique passwords.
- Used by a single application or service.
- Configured with the minimum permissions required as discussed in the [permissions section below](#creating-secure-permissions).

As with any system that has its own user accounts, the usual account management processes should be followed, including:

- Regular reviews of the accounts to ensure that they are still required.
- Regular reviews of permissions.
- Removing user accounts when an application is decommissioned.
- Changing the passwords when staff leave, or there is reason to believe that they may have been compromised.

For Microsoft SQL Server, consider the use of [Windows or Integrated-Authentication](https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/sql/authentication-in-sql-server), which uses existing Windows accounts rather than SQL Server accounts. This also removes the requirement to store credentials in the application, as it will connect using the credentials of the Windows user it is running under. The [Windows Native Authentication Plugins](https://dev.mysql.com/doc/connector-net/en/connector-net-programming-authentication-windows-native.html) provides similar functionality for MySQL.

#### Storing Database Credentials Securely

Database credentials should never be stored in the application source code, especially if they are unencrypted. Instead, they should be stored in a configuration file that:

- Is outside of the web root.
- Has appropriate permissions so that it can only be read by the required user(s).
- Is not checked into source code repositories.

Where possible, these credentials should also be encrypted or otherwise protected using built-in functionality, such as the `web.config` encryption available in [ASP.NET](https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/connection-strings-and-configuration-files#encrypting-configuration-file-sections-using-protected-configuration).

### Creating Secure Permissions

When developers are assigning permissions to database user accounts, they should employ the principle of least privilege (i.e, the accounts should only have the minimal permissions required for the application to function). This principle can be applied at a number of increasingly granular levels depending on the functionality available in the database. You can do the following in all environments:

- Do not use the built-in `root`, `sa` or `SYS` accounts.
- Do not grant the account administrative rights over the database instance.
- Make sure the account can only connect from allowed hosts. This would often be `localhost` or the address of the application server.
- The account should only access the specific databases it needs. Development, UAT and Production environments should all use separate databases and accounts.
- Only grant the required permissions on the databases. Most applications would only need `SELECT`, `UPDATE` and `DELETE` permissions. The account should not be the owner of the database as this can lead to privilege escalation vulnerabilities.
- Avoid using database links or linked servers. Where they are required, use an account that has been granted access to only the minimum databases, tables, and system privileges required.

Most security-critical applications, apply permissions at more granular levels, including:

- Table-level permissions.
- Column-level permissions.
- Row-level permissions
- Blocking access to the underlying tables, and requiring all access through restricted [views](<https://en.wikipedia.org/wiki/View_(SQL)>).

### Database Configuration and Hardening

The database server's underlying operating system should be hardened by basing it on a secure baseline such as the [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/) or the [Microsoft Security Baselines](https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-security-baselines).

The database application should also be properly configured and hardened. The following principles should apply to any database application and platform:

- Install any required security updates and patches.
- Configure the database services to run under a low privileged user account.
- Remove any default accounts and databases.
- Store [transaction logs](https://en.wikipedia.org/wiki/Transaction_log) on a separate disk to the main database files.
- Configure a regular backup of the database. Ensure that the backups are protected with appropriate permissions, and ideally encrypted.

The following sections give some further recommendations for specific database software, in addition to the more general recommendations given above.

#### Hardening a Microsoft SQL Server

- Disable `xp_cmdshell`, `xp_dirtree` and other stored procedures that are not required.
- Disable Common Language Runtime (CLR) execution.
- Disable the SQL Browser service.
- Disable [Mixed Mode Authentication](https://learn.microsoft.com/en-us/sql/relational-databases/security/choose-an-authentication-mode?view=sql-server-ver15) unless it is required.
- Ensure that the sample [Northwind and AdventureWorks databases](https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/sql/linq/downloading-sample-databases) have been removed.
- See Microsoft's articles on [securing SQL Server](https://learn.microsoft.com/en-us/sql/relational-databases/security/securing-sql-server).

#### Hardening a MySQL or a MariaDB Server

- Run the `mysql_secure_installation` script to remove the default databases and accounts.
- Disable the [FILE](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_file) privilege for all users to prevent them reading or writing files.
- See the [Oracle MySQL](https://dev.mysql.com/doc/refman/8.0/en/security-guidelines.html) and [MariaDB](https://mariadb.com/kb/en/library/securing-mariadb/) hardening guides.

#### Hardening a PostgreSQL Server

- See the [PostgreSQL Server Setup and Operation documentation](https://www.postgresql.org/docs/current/runtime.html) and the older [Security documentation](https://www.postgresql.org/docs/7.0/security.htm).

#### MongoDB

- See the [NoSQL Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html) for general guidance on securing NoSQL databases.
- See the [MongoDB security checklist](https://docs.mongodb.com/manual/administration/security-checklist/).

#### Redis

- See the [Redis security guide](https://redis.io/topics/security).

## Microservices based Security Arch Doc

> **Source:** [Microservices based Security Arch Doc](https://cheatsheetseries.owasp.org/cheatsheets/Microservices_based_Security_Arch_Doc_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

The microservice architecture is being increasingly used for designing and implementing application systems in both cloud-based and on-premise infrastructures. There are many security challenges need to be addressed in the application design and implementation phases. In order to address some security challenges it is necessity to collect security-specific information on application architecture.
The goal of this article is to provide a concrete proposal of approach to collect microservice-based architecture information to securing application.

### Context

During securing applications based on microservices architecture, security architects/engineers usually face with the following questions (mostly referenced in the [OWASP Application Security Verification Standard Project](https://github.com/OWASP/ASVS) under the section [V1 "Architecture, Design and Threat Modeling Requirements"](https://github.com/OWASP/ASVS/blob/master/4.0/en/0x10-V1-Architecture.md#v1-architecture-design-and-threat-modeling)):

1. Threat modeling and enforcement of the principle of least privilege:
    - What scopes or API keys does microservice minimally need to access other microservice APIs?
    - What grants does microservice minimally need to access database or message queue?
2. Data leakage analysis:
    - What storages or message queues do contain sensitive data?
    - Does microservice read/write date from/to specific database or message queue?
    - What microservices are invoked by dedicated microservice? What data is passed between microservices?
3. Attack surface analysis:
    - What microservices endpoints need to be tested during security testing?

In most cases, existing application architecture documentation is not suitable to answer those questions. Next sections propose what architecture security-specific information can be collected to answer the questions above.

### Objective

The objectives of the cheat sheet are to explain what architecture security-specific information can be collected to answer the questions above and provide concrete proposal of approach to collect microservice-based architecture information to securing application.

### Proposition

#### Collect information on the building blocks

##### Identify and describe application-functionality services

Application-functionality services implement one or several business process or functionality (e.g., storing customer details, storing and displaying product catalog). Collect information on the parameters listed below related to each application-functionality service.

| Parameter name | Description |
| :--- | :--- |
| Service name (ID) | Unique service name or ID |
| Short description | Short description of business process or functionality implemented by the microservice |
| Link to source code repository | Specify a link to service source code repository |
| Development Team | Specify development team which develops the microservice |
| API definition | If microservice exposes external interface specify a link to the interface description (e.g., OpenAPI specification). It is advisable to define used security scheme, e.g. define scopes or API keys needed to invoke dedicated endpoint (e.g., [see](https://swagger.io/docs/specification/authentication/)). |
| The microservice architecture description | Specify a link to the microservice architecture diagram, description (if available) |
| Link to runbook | Specify a link to the microservice runbook |

##### Identify and describe infrastructure services

Infrastructure services including remote services may implement authentication, authorization, service registration and discovery, security monitoring, logging etc. Collect information on the parameters listed below related to each infrastructure service.

| Parameter name | Description |
| :--- | :--- |
|Service name (ID) | Unique service name or ID |
|Short description | Short description of functionality implemented by the service (e.g., authentication, authorization, service registration and discovery, logging, security monitoring, API gateway). |
|Link to source code repository | Specify a link to service source code repository (if applicable) |
|Link to the service documentation | Specify a link to the service documentation that includes service API definition, operational guidance/runbook, etc. |

##### Identify and describe data storages

Collect information on the parameters listed below related to each data storage.

| Parameter name | Description |
| :--- | :--- |
|Storage name (ID) | Unique storage name or ID |
|Software type | Specify software that implements the data storage (e.g., PostgreSQL, Redis, Apache Cassandra). |

##### Identify and describe message queues

Messaging systems (e.g., RabbitMQ or Apache Kafka) are used to implement asynchronous microservices communication mechanism. Collect information on the parameters listed below related to each message queue.

| Parameter name | Description |
| :--- | :--- |
|Message queue (ID) | Unique message queue name or ID |
|Software type | Specify software that implements the message queue (e.g., RabbitMQ, Apache Kafka). |

##### Identify and describe data assets

Identify and describe data assets that processed by system microservices/services. It is advisable firstly to identify assets, which are valuable from a security perspective (e.g., "User information", "Payment"). Collect information on the parameters listed below related to each asset.

| Parameter name | Description |
| :--- | :--- |
| Asset name (ID) | Unique asset name or ID |
| Protection level | Specify asset protection level (e.g., PII, confidential) |
| Additional info | Add clarifying information |

#### Collect information on relations between building blocks

##### Identify "service-to-storage" relations

Collect information on the parameters listed below related to each "service-to-storage" relation.

| Parameter name | Description |
| :--- | :--- |
| Service name (ID) | Specify service name (ID) defined above |
| Storage name (ID) | Specify storage name (ID) defined above |
| Access type | Specify access type, e.g. "Read" or "Read/Write" |

##### Identify "service-to-service" synchronous communications

Collect information on the parameters listed below related to each "service-to-service" synchronous communication.

| Parameter name | Description |
| :--- | :--- |
| Caller service name (ID) | Specify caller service name (ID) defined above |
| Called service name (ID) | Specify called service name (ID) defined above |
| Protocol/framework used| Specify protocol/framework used for communication, e.g. HTTP (REST, SOAP), Apache Thrift, gRPC |
| Short description | Shortly describe the purpose of communication (requests for query of information or request/commands for a state-changing business function) and data passed between services (if possible, in therms of assets defined above) |

##### Identify "service-to-service" asynchronous communications

Collect information on the parameters listed below related to each "service-to-service" asynchronous communication.

| Parameter name | Description |
| :--- | :--- |
| Publisher service name (ID) | Specify publisher service name (ID) defined above |
| Subscriber service name (ID) | Specify subscriber service name (ID) defined above |
| Message queue (ID) | Specify message queue (ID) defined above |
| Short description | Shortly describe the purpose of communication (receiving of information or commands for a state-changing business function) and data passed between services (if possible, in therms of assets defined above) |

##### Identify "asset-to-storage" relations

Collect information on the parameters listed below related to each "asset-to-storage" relation.

| Parameter name | Description |
| :--- | :--- |
| Asset name (ID) | Asset name (ID) defined above |
| Storage name (ID) | Specify storage name (ID) defined above |
| Storage type | Specify storage type for the asset, e.g. "golden source" or "cache" |

#### Create a graphical presentation of application architecture

It is advisable to create graphical presentation of application architecture (building blocks and relations defined above) in form of services call graph or data flow diagram. In order to do that one can use special software tools (e.g. Enterprise Architect) or [DOT language](https://en.wikipedia.org/wiki/DOT_%28graph_description_language%29). See example of using DOT language [here](https://gist.github.com/vladgolubev/80c5523336ddec3859c0e90d9a070882).

#### Use collected information in secure software development practices

Collected information may be useful for doing application security practices, e.g. during defining security requirements, threat modeling or security testing. Sections below contains examples of activities related to securing application architecture (as well as its mapping to OWASP projects) and tips for their implementation using information collected above.

##### Attack surface analysis

###### Implementation tips

To enumerate microservices endpoints that need to be tested during security testing and analyzed during threat modeling analyze data collected under the following sections:

- Identify and describe application-functionality services (parameter "API definition")
- Identify and describe infrastructure services (parameter "Link to the service documentation")

###### Mapping to OWASP projects

- [OWASP ASVS, V1 "Architecture, Design and Threat Modeling Requirements", #1.1.2](https://github.com/OWASP/ASVS/blob/master/4.0/en/0x10-V1-Architecture.md#v1-architecture-design-and-threat-modeling)
- [OWASP Attack Surface Analysis Cheat Sheet](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Attack_Surface_Analysis_Cheat_Sheet.md)

##### Data leakage analysis

###### Implementation tips

To analyze possible data leakage analyze data collected under the following sections:

- Identify and describe data assets
- Identify "service-to-storage" relations
- Identify "service-to-service" synchronous communications
- Identify "service-to-service" asynchronous communications
- Identify "asset-to-storage" relations

###### Mapping to OWASP projects

- [OWASP ASVS, V1 "Architecture, Design and Threat Modeling Requirements", #1.1.2](https://github.com/OWASP/ASVS/blob/master/4.0/en/0x10-V1-Architecture.md#v1-architecture-design-and-threat-modeling)
- [OWASP Top 10-2017 A3-Sensitive Data Exposure](https://owasp.org/www-project-top-ten/OWASP_Top_Ten_2017/Top_10-2017_A3-Sensitive_Data_Exposure)

##### Application's trust boundaries, components, and significant data flows justification

###### Implementation tips

Start the review of the application's trust boundaries, components, and significant data flows with the inventories from these sections:

- Identify and describe application-functionality services
- Identify and describe infrastructure services
- Identify and describe data storages
- Identify and describe message queues
- Identify "service-to-storage" relations
- Identify "service-to-service" synchronous communications
- Identify "service-to-service" asynchronous communications

Use these inventories as inputs to a [system model](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html#system-modeling). Mark the trust boundaries and the flows that cross them, and justify each crossing. Record the endpoint identities, authentication and authorization enforcement points, and protections for data in transit (see [NIST SP 800-204, sections 4.1 and 4.3](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-204.pdf)). Check these controls against the deployed configuration and behavior; the inventories alone do not verify enforcement.

###### Mapping to OWASP projects

- [OWASP ASVS, V1 "Architecture, Design and Threat Modeling Requirements", #1.1.4](https://github.com/OWASP/ASVS/blob/master/4.0/en/0x10-V1-Architecture.md#v1-architecture-design-and-threat-modeling)

##### Analysis of the application's high-level architecture

###### Implementation tips

To verify definition and security analysis of the application's high-level architecture and all connected remote services analyze data collected under the following sections:

- Identify and describe application-functionality services
- Identify and describe infrastructure services
- Identify and describe data storages
- Identify and describe message queues

###### Mapping to OWASP projects

- [OWASP ASVS, V1 "Architecture, Design and Threat Modeling Requirements", #1.1.5](https://github.com/OWASP/ASVS/blob/master/4.0/en/0x10-V1-Architecture.md#v1-architecture-design-and-threat-modeling)

##### Implementation of centralized security controls verification

###### Implementation tips

To verify implementation of centralized, simple (economy of design), vetted, secure, and reusable security controls to avoid duplicate, missing, ineffective, or insecure controls analyze data collected under the section "Identify and describe infrastructure services".

###### Mapping to OWASP projects

- [OWASP ASVS, V1 "Architecture, Design and Threat Modeling Requirements", #1.1.6](https://github.com/OWASP/ASVS/blob/master/4.0/en/0x10-V1-Architecture.md#v1-architecture-design-and-threat-modeling)

##### Enforcement of the principle of least privilege

###### Implementation tips

To define minimally needed microservice permissions analyze data collected under the following sections:

- Identify and describe application-functionality services (parameter "API definition")
- Identify "service-to-storage" relations
- Identify "service-to-service" synchronous communications
- Identify "service-to-service" asynchronous communications

###### Mapping to OWASP projects

- [OWASP ASVS 4.0.3, V4 "Access Control", #4.1.3](https://github.com/OWASP/ASVS/blob/v4.0.3_release/4.0/en/0x12-V4-Access-Control.md#v41-general-access-control-design)

##### Sensitive data identification and classification

###### Implementation tips

To verify that all sensitive data is identified and classified into protection levels analyze data collected under the following sections:

- Identify and describe data assets
- Identify "asset-to-storage" relations

###### Mapping to OWASP projects

- [OWASP ASVS, V1 "Architecture, Design and Threat Modeling Requirements", #1.8.1](https://github.com/OWASP/ASVS/blob/master/4.0/en/0x10-V1-Architecture.md#v1-architecture-design-and-threat-modeling)

##### Application components business/security functions verification

###### Implementation tips

To verify the definition and documentation of all application components in terms of the business or security functions they provide analyze data collected under the following sections (parameter "Short description"):

- Identify and describe application-functionality services
- Identify and describe infrastructure services

###### Mapping to OWASP projects

- [OWASP ASVS, V1 "Architecture, Design and Threat Modeling Requirements", #1.11.1](https://github.com/OWASP/ASVS/blob/master/4.0/en/0x10-V1-Architecture.md#v1-architecture-design-and-threat-modeling)

## Serverless / FaaS Security

> **Source:** [Serverless / FaaS Security](https://cheatsheetseries.owasp.org/cheatsheets/Serverless_FaaS_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Serverless computing (Functions as a Service — FaaS) platforms such as AWS Lambda, Azure Functions, and Google Cloud Functions simplify application development and scaling.
However, the execution model (short-lived, event-driven functions running in managed environments) introduces unique security risks compared to traditional architectures.

This cheat sheet provides best practices to secure serverless applications and minimize attack surfaces.

### Key Risks

- Over-permissioned functions (broad IAM roles, `*` policies).
- Unvalidated event inputs (API Gateway, S3, Pub/Sub, IoT).
- Cold start data leakage (persistent state, side-channel timing).
- Function chaining abuse (compromised function invoking others).
- Shared environment risks (multi-tenant leakage, `/tmp` reuse).
- Hardcoded secrets in code or platform config.
- Excessive network access.

### Best Practices

#### 1. Principle of Least Privilege

- Assign minimal IAM permissions to each function.
- Use role-per-function (avoid shared high-privilege roles).
- Scope database/API keys to the smallest set of actions needed.

**Bad IAM Policy (too broad):**

```json
{
  "Effect": "Allow",
  "Action": "*",
  "Resource": "*"
}
```

**Good IAM Policy (scoped):**

```json
{
  "Effect": "Allow",
  "Action": ["dynamodb:GetItem", "dynamodb:PutItem"],
  "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/Orders"
}
```

#### 2. Environment Isolation

- Disable default network access unless required (e.g. outbound internet access).
- Place functions in private subnets with controlled egress.
- Isolate sensitive functions (e.g. payment, auth) from general-purpose ones.
- Separate production vs. staging environments with strict boundaries.

**AWS Lambda VPC Config (restrictive):**

```yaml
VpcConfig:
  SubnetIds:
    - subnet-123456
  SecurityGroupIds:
    - sg-restrict-outbound
```

#### 3. Secure Function Invocation

- Enforce authentication and authorization on all triggers (API Gateway, Pub/Sub, S3, IoT).
- Validate function-to-function calls with signed tokens or workload identities.
- Apply rate limiting and throttling to mitigate DoS and abuse.

**API Gateway Authorizer Example (JWT validation):**

```json
{
  "Type": "JWT",
  "IdentitySource": "$request.header.Authorization",
  "Issuer": "https://secure-idp.example.com/",
  "Audience": "my-api-client"
}
```

#### 4. Event Data Validation

- Treat all event payloads as untrusted input.
- Apply strong input validation & sanitization (length, type, format).
- Protect against common injection attacks (SQLi, XSS, JSON injection, deserialization).
- Strip unnecessary fields and metadata before processing.

Example: Python input validation for Lambda

```python
import json
import re

def lambda_handler(event, context):
    body = json.loads(event["body"])
    email = body.get("email", "")

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return {"statusCode": 400, "body": "Invalid email"}

    # process safely
    return {"statusCode": 200, "body": "OK"}
```

#### 5. Cold Start & Execution Context Security

- Do not assume function runtime context is clean between invocations.
- Avoid storing secrets or temporary sensitive data in global/static variables.
- Protect against side-channel leaks (timing differences, leftover files in /tmp).
- For sensitive workloads, enforce single-use execution environments if the platform supports it.

**Bad:**

```python
# Secret stays in global variable across invocations
SECRET_KEY = "hardcoded-secret"
```

**Good:**

```python
import os
from my_secrets_lib import get_secret

def lambda_handler(event, context):
    secret = get_secret("db-password")  # fetch fresh each time
    ...
```

#### 6. Secrets Management

See the [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) for secret lifecycle controls.

- Fetch secrets at runtime from a vault or caching extension — not from platform-level function configuration (e.g. Lambda Environment Variables).
- Use ephemeral credentials (STS, workload identity federation).
- Rotate secrets automatically.

**AWS Lambda Secret Fetch (Python via Parameters and Secrets Extension):**

**Note:** Ensure that the AWS Lambda Parameters and Secrets Extension is added and enabled for your function (for example, as a Lambda layer). Otherwise, `http://localhost:2773` will not be available and requests to it will fail.

```python
import os
import json
import urllib.request
import urllib.parse

def get_secret(secret_name):
    """
    Retrieves a secret using the AWS Lambda Extension local endpoint.
    This method is faster and more cost-effective due to local caching.
    """
    # The extension provides a local HTTP endpoint on port 2773
    encoded_name = urllib.parse.quote_plus(secret_name)

    secrets_extension_endpoint = (
        f"http://localhost:2773/secretsmanager/get?secretId={encoded_name}"
    )

    # Authenticate using the identity token provided by the Lambda environment.
    # Fail fast if the token is missing to avoid confusing 4xx errors.
    session_token = os.environ.get("AWS_SESSION_TOKEN")
    if not session_token:
        raise RuntimeError(
            "Missing AWS_SESSION_TOKEN required for "
            "Parameters and Secrets Extension authentication."
        )

    headers = {
        "X-Aws-Parameters-Secrets-Token": session_token
    }

    request = urllib.request.Request(
        secrets_extension_endpoint,
        headers=headers,
        method="GET"
    )

    with urllib.request.urlopen(request, timeout=3) as response:
        if response.status != 200:
            raise Exception(
                f"Error retrieving secret: {response.read().decode('utf-8')}"
            )

        response_json = json.loads(response.read())
        secret_string = response_json["SecretString"]

        return json.loads(secret_string)
```

#### 7. Monitoring & Logging

- Use centralized logging (CloudWatch, Azure Monitor, GCP Logging).
- Mask secrets and PII.

Example: Redacting fields

```python
import logging

def log_event(event):
    safe_event = {k: ("***" if "password" in k else v) for k,v in event.items()}
    logging.info(safe_event)
```

#### 8. Supply Chain Security

- Scan dependencies (`npm audit`, `pip-audit`, `safety`).
- Use minimal deployment packages.
- Sign deployment packages and verify signatures against an approved publisher before deployment. A checksum alone does not authenticate the publisher.

For AWS Lambda, use [code signing configurations](https://docs.aws.amazon.com/lambda/latest/dg/configuration-codesigning.html) with allowed signing profiles and `UntrustedArtifactOnDeployment` set to `Enforce`; the default `Warn` setting allows deployments that fail expiry, publisher, or revocation checks. Layers added to functions with code signing enabled must also be signed by an allowed profile.

### Do’s and Don’ts

**Do**:

- Enforce least privilege per function.
- Validate all event inputs.
- Fetch secrets from vaults, not platform config.
- Restrict network egress.
- Monitor invocations and logs.

**Don’t**:

- Hardcode secrets in code or configs.
- Assume clean runtime between invocations.
- Give `*` IAM permissions.
- Leave sensitive data in `/tmp` or globals.
- Trust event sources blindly.

## Software Supply Chain Security

> **Source:** [Software Supply Chain Security](https://cheatsheetseries.owasp.org/cheatsheets/Software_Supply_Chain_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

No piece of software is developed in a vacuum; regardless of the technologies used to develop it, software is embedded in a Software Supply Chain (SSC). According to [NIST](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-204D.pdf), an entity's SSC can be defined as "a collection of steps that create, transform, and assess the quality and  policy conformance of software artifacts". From a developer's perspective, these steps span the entire SDLC and are accomplished using a wide range of components and tools. Common examples (by no means exhaustive) of components that are especially relevant from a developer's perspective include:

- IDEs and code editors
- Internally developed source code
- Third-party software libraries
- Version control systems (VCS)
- Build tools (Maven, Rake, make, Grunt, etc.)
- CI/CD software (Jenkins, CircleCI, TeamCity, etc.)
- Configuration management tools (Ansible, Puppet, Chef, etc.)
- Package management software and ecosystems (pip, npm, Composer, etc.)

Each of these components must be secured; a flaw in a single component, such as a vulnerable third-party dependency or misconfigured VCS, can put an entire SSC in jeopardy. Thus, in order to strengthen Software Supply Chain Security (SCSS), developers should possess a general understanding of what the SSC is, common threats against it, and practices and techniques that can be applied to reduce SSC risk.

### Overview of Threat Landscape

Given the breadth and complexity of the SSC, it is unsurprising that the threat landscape for SSC is similarly expansive. Threats include [dependency confusion](https://fossa.com/blog/dependency-confusion-understanding-preventing-attacks/), compromise of an upstream providers infrastructure, theft of code signing certificates, and CI/CD system exploits. More broadly, threats may be grouped into four categories based upon what component of the supply chain they seek to compromise ([Google supply-chain threat categories](https://cloud.google.com/software-supply-chain-security/docs/attack-vectors), [SLSA 1.0 threats](https://slsa.dev/spec/v1.0/threats)):

- Source code threats. These type of threats focus on violating the integrity of a source code which is then built and and deployed or potentially consumed by other software projects. Threats in this category include VCS exploits, the introduction of malicious or vulnerable code into a codebase, or building code from an unauthorized branch.
- Build environment threats. These threats modify a software artifact but without altering the underlying source code or exploiting the build process itself. Examples include build cache poisoning, compromising a privileged account used by the build tool, or publishing software built from an untrusted source.
- Dependency related threats. Threats that result from the consumption of both direct and transitive software dependencies. The most common threat is using a vulnerable or compromised dependency.
- Deployment and runtime threats. These threats exploit either the deployment process or runtime environment. Common examples include compromising a privilege CI/CD account, software misconfigurations, and deployment of compromised binaries.

The characteristics of threat actors seeking to exploit the SSC are similarly diverse. Although SSC compromise is often associated with highly sophisticated threat actors, such sophistication is not inherently necessary for attacking the SSC, especially if the attack focuses on compromising the SSC of entities with poor security practices. Threat actor motive also varies widely. A SSC exploit can result in loss of confidentiality, integrity, and/or availability of any organization's assets and thus fulfill a wide range of attacker goals such as espionage or financial gain.

Finally, it must be recognized that many SSC threats have the capability to propagate across many entities. This is due to the consumer-supplier relationship that is integral to an SSC. For example, if a large-scale software supplier, whether proprietary or open-source, is compromised, many downstream consuming entities could also be impacted as a result. The 2020 SolarWinds and 2021 Codecov incidents are excellent real-world examples of this.

### Mitigations and Security Best Practices

Mitigating SSC related risk can seem daunting, yet it need not be. Even for sophisticated attacks that may focus on compromising upstream suppliers, individual organization can take reasonable steps to defend its own assets and mitigate risk even if its supplier is compromised. Although some parts of SSCS may remain outside direct control of development teams, those teams must still do their part to improve SSCS in their organization; the guidance below is intended as starting point for developers to do just that.

#### General

The practices described below are general techniques that can be used to mitigate risk related to a wide variety of threat types.

##### Implement Strong Access Control

  Compromised accounts, particularly privileged ones, represents a significant threats to SSCs. Account takeover can allow an attacker can perform a variety of malicious acts including injecting code into legitimate dependencies, manipulating CI/CD pipeline execution, and replacing a benign artifact with a malicious one. Strong access control for build, development, version control, and similar environments is thus critical. Best practices include adhering to  the basic security principles of least privileges and separation of duties, enforcing MFA, rotating credentials, and ensuring credentials are never stored or transmitted in clear text or committed to source control.

##### Logging and Monitoring

  When considering SSCS, the importance of detective controls should not be overlooked; these controls are essential for detecting attacks and enabling prompt respond. In the context of SSCS, logging is critical. All systems involved in the SSC, including VCS, build tools, delivery mechanisms, artifact repositories, and the systems responsible for running applications should be configured to log authentication attempts, configuration changes, and other events that could assist in identifying anomalous behavior or that could prove crucial for incident response efforts. Logs throughout the SSC must be sufficient in both depth and breadth to support detection and response

  However, logging events is not sufficient. These logs must be monitored, and, if necessary, acted upon. A centralized SIEM, log aggregator, or similar tool is preferred, especially given the complexity of SSCs. Regardless of the technology used, the basic objective remains the same: log data should be actionable.

##### Leverage Security Automation

For complex SSCs, automation of security tasks, such as scanning, monitoring, and testing is critical. Such automation, while not a replacement for manual reviews and other actions performed by skilled professionals, is capable of detecting, and in some cases responding to, vulnerabilities and potential attacks with a scale and consistency that is hard to achieve through manual human intervention. Types of tools that support automation include SAST, DAST, SCA, container image scanners and more. The exact tools most capable of delivering value to an organization will vary significantly based on the characteristics of the organization. However, regardless of the type of tools and vendors used, it is important to acknowledge that these tools themselves must be mainlined, secured, and configured correctly. Failure to do so could actually increase SSC risk for an organization, or at the very least, fail to bring meaningful benefit to the organization. Finally, it must be clearly understood that these tools are but one component of an overall SSCS program; they cannot be considered a comprehensive solution or be relied on to identify all vulnerabilities.

#### Mitigating Source Code Threats

The practices described below can help reduce SSC risk associated with source code and development.

##### Peer Reviews

Manual code reviews are an important, relatively low cost technique for reducing SSC risk; these reviews can act as both detective controls and deterrents. Reviews should be performed by peers possessing both experience in the technology being used and secure coding processes and should occur before code is merged within a source control systems ([Google source safeguards](https://cloud.google.com/software-supply-chain-security/docs/safeguard-source)). The reviews should look for both unintentional security flaws as well as intentional code that could serve malicious purposes. The results of the review should be documented for later review if needed.

##### Secure Config of Version Control Systems

Compromise or abuse of the source control system is consistently recognized as a significant SSC risk ([Google supply-chain threat categories](https://cloud.google.com/software-supply-chain-security/docs/attack-vectors), [SLSA 1.0 threats](https://slsa.dev/spec/v1.0/threats)). The general security best practices of strong access control and logging and monitoring are two methods to help secure VCS. Security features specific to the VCS system, such as protected branches and merge policies in git, should also be leveraged. You can find a wide variety of recommended policies in this [documentation](https://policies.legitify.dev/). There are tools available to help manage configuration of SCM systems, such as [Legitify](https://github.com/Legit-Labs/legitify), an open-source tool by [Legit security](https://www.legitsecurity.com/). Legitify is designed to detect misconfigurations in GitHub and GitLab and assist with the implementation of best practices. Regardless of any security controls added a VCS, it must be remember that secrets should never be committed to these systems.

##### Secure Development Platform

IDEs, development plugins, and similar tools can help assist the development process. However, like all pieces of software, these components can have vulnerabilities and become an attack vector. Thus, it is important to take steps not only to ensure these tools are used securely, but also to secure the underlying system. The development system should have endpoint security software installed and should have threat assessments performed against it ([ESF developer practices](https://www.nsa.gov/Press-Room/Digital-Media-Center/Document-Gallery/igphoto/2003068942/)). Only trusted, well-vetted software should be used in the development process; this includes not only "core" development tools such as IDEs, but also any plugins or extensions.  Additionally, these tools should be included as part of an organization's system inventory.

#### Mitigating Dependency Threats

Best practices and techniques related to secure use of dependencies are described below.

##### Assess Suppliers

Before incorporating a third-party service, product, or software component into the SSC, the vendor and specific offering should both be thoroughly assessed for security. This applies to both open-source and proprietary offerings. The form and extent of the analysis will vary substantially in accordance with both the criticality and nature of the component being considered. Component maturity, security history, and the vendor's response to past vulnerabilities are useful information in nearly any case. For larger vendors or service offerings, determining whether or not a solution has been evaluated against third-party assessments and certifications, such as those performed against [FedRAMP](https://marketplace.fedramp.gov/products), [CSA](https://cloudsecurityalliance.org/star/registry), or various ISO standards (ISO/IEC 27001, ISO/IEC 15408,
ISO/IEC 27034), can be a useful data point, but must not be relied on exclusively.

Due to its transparent nature, open-source projects offer additional assessment opportunities. Questions to consider include ([OpenSSF component evaluation](https://best.openssf.org/Concise-Guide-for-Evaluating-Open-Source-Software)):

- Is the project actively maintained?
- Is the project sufficiently popular and well-known in the applicable community?
- Is the project sufficiently mature?
- Is the product or version being evaluated a "release" version, e.g. not an alpha, beta, or comparable versions?
- Given the complexity of the project, does the project have a sufficient number of maintainers and contributors?
- Does the project keep its dependencies updated?
- Does the project have sufficient test coverage and do the tests include security relevant rules?
- Is the project well-documented and does the document include guidance on how to use the component securely?
- Does the project have an established and documented process for reporting vulnerabilities and are these vulnerabilities addressed in a timely manner?
- Is the intended usage of the project consistent with the project's license?

##### Understand and Monitor Software Dependencies

While third-party software dependencies can greatly accelerate the development process, they are also one of the leading risks associated with modern applications. Dependencies must not only be carefully selected before they are incorporated into an application, but also carefully monitored and maintained throughout the SDLC. In order achieve this, having insight into the various dependencies consumed by software is a crucial first step. To facilitate this, SBOMs may be used. Both production and consumption of these SBOMs should be automated, preferably as part of the  organization's CI/CD process.

Once the organization has inventoried dependencies, it must also monitor them for known vulnerabilities. This should also be automated as much as possible; tools such as [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/) or [retire.js](https://retirejs.github.io/retire.js/) can assist in this process. Additionally, sources such as the [NVD](https://nvd.nist.gov/), [OSVDB](https://osv.dev/list), or [CISA KEV catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) may also be monitored for known vulnerabilities related to dependencies used in the organization's SSC.

##### SAST

Although using SAST to detect potential security in custom developed code is a widely used security technique, it can also be used on OSS components within the SSC ([ESF developer practices](https://www.nsa.gov/Press-Room/Digital-Media-Center/Document-Gallery/igphoto/2003068942/)). As when using SAST on internally developed code, one must recognize that these tools can produce both false positives and false negatives. Thus, SAST results must not be accepted without manual verification and should not be interpreted as providing a comprehensive view of the project's security. However, as long as their limitations are understood, SAST scans can prove useful when analyzing both internally developed or OSS code.

##### Lockfile/Version Pinning

To reduce the likelihood that a compromised or vulnerable version is unwittingly pulled into an application, one should limit the applications dependencies to a specific version that has been previously verified as legitimate and secure. This is commonly accomplished using lockfiles such as the package-lock.json file used by npm.

#### Build Threats

The section below describes techniques that are especially relevant for securing build related threats.

##### Inventory Build Tools

Knowing the components used in the SSC is essential to the security of that SSC. This concept extends to build tools. An inventory of all build tools, including versions and any plugins, should be automatically collected and mainlined, One must also monitor vulnerability databases, vendor security advisories and other sources for any vulnerabilities related to the identified build tools.

##### Harden Build Tools

Compromised build tools can enable a wide range of exploits and thus represent an appealing target for attackers. As such, all infrastructure and tools used in build process must be hardened to mitigate risk. Techniques for hardening build environments include ([ESF developer practices](https://www.nsa.gov/Press-Room/Digital-Media-Center/Document-Gallery/igphoto/2003068942/)):

- Ensure build tools are located in an appropriately segregated networks.
- Use DLP and other tools and techniques to detect and prevent exfiltration.
- Disable/remove any unused services.
- Use version control systems to manage and store pipeline configurations.

##### Enforce Code Signing

From a the perspective of software consumers, only accepting components which have been digitally signed and validating the signature before utilizing the software is an important task step in ensuring the component is authentic and has not been tampered with. For those performing code signing, it is imperative that the code signing infrastructure is thoroughly hardened. Failure to do so can result in compromise of the code signing system and lead further exploits, including those targeting consumers of the software.

##### Use Private Artifact Repository

Using a private artifact repository increases the control an organization has over the various artifacts that are used within the SSC. Artifacts should be reviewed before being allowed in the private repository and organizations must ensure that usage of these repositories cannot be bypassed. Although usage of private repositories can introduce extra maintenance or reduce agility, they can also be an important component of SSCS, especially for sensitive or critical applications.

##### Use Source Control for Build Scripts and Config

The benefits of VCSs can be realized for items beyond source control; this is especially true for config and scripts related to CI/CD pipelines. Enforcing version control for these files allows one to incorporate reviews, merge rules, and like controls into the config update process. Using VCS also increase visibility, allowing one easy visibility into any changes introduced, whether malicious or benign ([ESF developer practices](https://www.nsa.gov/Press-Room/Digital-Media-Center/Document-Gallery/igphoto/2003068942/)).

##### Verify Provenance/Ensure Sufficient Metadata is Generated

Having assurance that an SSC component comes from a trusted source and has not been tampered with is a important part of SSCS. Generation and consumption of provenance, defined in [SLSA 1.0](https://slsa.dev/spec/v1.0/provenance) as "the verifiable information about software artifacts describing where, when and how something was produced" is an important part of this. The provenance should be generated by the build platform (as opposed to a local development system), be very difficult for attackers to forge, and contain all details necessary to accurately link the result back to the builder ([SLSA 1.0 provenance requirements](https://slsa.dev/spec/v1.0/requirements#provenance-generation)). SLSA 1.0 compliant provenance can be generated using builders such as [FRSCA](https://github.com/buildsec/frsca) or [Github Actions](https://github.com/slsa-framework/slsa-github-generator) and verified [using SLSA Verifier](https://github.com/slsa-framework/slsa-verifier?tab=readme-ov-file)

##### Ephemeral, Isolated Builds

Reuse and sharing of build environments may allow attackers to perform cache poising or otherwise more readily inject malicious code.  Builds should be performed in isolated, temporary ("ephemeral") environments. This can be achieved using technologies such as VMs or containers for builds and ensuring the environment is immediately destroyed afterward.

##### Limit use of Parameters

Although passing user controllable parameters to a build process can increase flexibility, it also increases risk. If parameters can be modified by users in order to alter how a build is performed, an attacker with sufficient permission will also be able to modify the parameters and potentially compromise the build process ([Google build safeguards](https://cloud.google.com/software-supply-chain-security/docs/safeguard-builds)). One should thus make an effort to minimize or eliminate any user controllable build parameters.

#### Deployment and Runtime Threats

The section below outlines a couple of techniques that can be used to protect software during the deployment and runtime phases.

##### Scan Final Build Binary

Once the build process has finished, one should not simply assume that the final result is secure. Binary composition analysis can help detect exposed secrets, detect unauthorized components or content, and verify integrity ([ESF developer practices](https://www.nsa.gov/Press-Room/Digital-Media-Center/Document-Gallery/igphoto/2003068942/)). This task should be performed by both suppliers and consumers.

##### Monitor Deployed Software for Vulnerabilities

SSCS does not end with the deployment of the software; the deployed software must be monitored and maintained to reduce risk. New vulnerabilities, whether introduced due to an update or simply newly discovered (or made public), are a continual concern in software systems ([Google supply-chain threat categories](https://cloud.google.com/software-supply-chain-security/docs/attack-vectors)). When performing this monitoring, a wholistic approached must be used; code dependencies, container images, web servers, and operating system components are just a sampling of items that must be consider. To support this monitoring, an accurate and up-to-date inventory of system components is critical. Additionally, insecure configuration changes must be monitored and acted upon.

## Vulnerable Dependency Management

> **Source:** [Vulnerable Dependency Management](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

The objective of the cheat sheet is to provide a proposal of approach regarding the handling of vulnerable third-party dependencies when they are detected, and this, depending on different situation.

The cheat sheet is not tools oriented but it contains a [tools](#tools) section informing the reader about free and commercial solutions that can be used to detect vulnerable dependencies, depending on the level of support on the technologies at hand

**Note:**

Proposals mentioned in this cheat sheet are not silver-bullet (recipes that work in all situations) yet can be used as a foundation and adapted to your context.

### Context

Most of the projects use third-party dependencies to delegate handling of different kind of operations, _e.g._ generation of document in a specific format, HTTP communications, data parsing of a specific format, etc.

It's a good approach because it allows the development team to focus on the real application code supporting the expected business feature. The dependency brings forth an expected downside where the security posture of the real application is now resting on it.

This aspect is referenced in the following projects:

- [OWASP TOP 10 2017](https://owasp.org/www-project-top-ten/OWASP_Top_Ten_2017/) under the point _[A9 - Using Components with Known Vulnerabilities](https://owasp.org/www-project-top-ten/OWASP_Top_Ten_2017/Top_10-2017_A9-Using_Components_with_Known_Vulnerabilities.html)_.
- [OWASP Application Security Verification Standard Project](https://owasp.org/www-project-application-security-verification-standard/) under the section _V14.2 Dependency_.

Based on this context, it's important for a project to ensure that all the third-party dependencies implemented are clean of any security issue, and if they happen to contain any security issues, the development team needs to be aware of it and apply the required mitigation measures to secure the affected application.

It's highly recommended to perform automated analysis of the dependencies from the birth of the project. Indeed, if this task is added at the middle or end of the project, it can imply a huge amount of work to handle all the issues identified and that will in turn impose a huge burden on the development team and might to blocking the advancement of the project at hand.

**Note:**

In the rest of the cheat sheet, when we refer to _development team_ then we assume that the team contains a member with the required application security skills or can refer to someone in the company having these kind of skills to analyze the vulnerability impacting the dependency.

### Remark about the detection

It's important to keep in mind the different ways in which a security issue is handled after its discovery.

#### 1. Responsible disclosure

See a description [here](https://en.wikipedia.org/wiki/Responsible_disclosure).

A researcher discovers a vulnerability in a component, and after collaboration with the component provider, they issue a [CVE](https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures) (sometimes a specific vulnerability identifier to the provider is created but generally a CVE identifier is preferred) associated to the issue allowing the public referencing of the issue as well as the available fixation/mitigation.

If in case the provider doesn't properly cooperate with the researcher, the following results are expected:

- CVE gets accepted by the vendor yet the provider [refuses to fix the issue](https://www.excellium-services.com/cert-xlm-advisory/cve-2019-7161/).
- Most of the time, if the researcher doesn't receive back a response in 30 days, they go ahead and do a [full disclosure](#2-full-disclosure) of the vulnerability.

Here, the vulnerability is always referenced in the [CVE global database](https://nvd.nist.gov/vuln/data-feeds) used, generally, by the detection tools as one of the several input sources used.

#### 2. Full disclosure

See a description [here](https://en.wikipedia.org/wiki/Full_disclosure), into the section named **Computers** about **Computer Security**.

The researcher decides to release all the information including exploitation code/method on services like [Full Disclosure mailing list](https://seclists.org/fulldisclosure/), [Exploit-DB](https://www.exploit-db.com).

Here a CVE is not always created then the vulnerability is not always in the CVE global database causing the detection tools to be potentially blind about unless the tools use other input sources.

### Remark about the security issue handling decision

When a security issue is detected, it's possible to decide to accept the risk represented by the security issue. However, this decision must be taken by the [Chief Risk Officer](https://en.wikipedia.org/wiki/Chief_risk_officer) (fallback possible to [Chief Information Security Officer](https://en.wikipedia.org/wiki/Chief_information_security_officer)) of the company based on technical feedback from the development team that have analyzed the issue (see the _[Cases](#cases)_ section) as well as the CVEs [CVSS](https://www.first.org/cvss/user-guide) score indicators.

### Cases

When a security issue is detected, the development team can meet one of the situations (named _Case_ in the rest of the cheat sheet) presented in the sub sections below.

If the vulnerably impact a [transitive dependency](https://en.wikipedia.org/wiki/Transitive_dependency) then the action will be taken on the direct dependency of the project because acting on a transitive dependency often impact the stability of the application.

Acting on a on a transitive dependency require the development team to fully understand the complete relation/communication/usage from the project first level dependency until the dependency impacted by the security vulnerability, this task is very time consuming.

#### Case 1

##### Context

Patched version of the component has been released by the provider.

##### Ideal condition of application of the approach

Set of automated unit or integration or functional or security tests exist for the features of the application using the impacted dependency allowing to validate that the feature is operational.

##### Approach

**Step 1:**

Update the version of the dependency in the project on a testing environment.

**Step 2:**

Prior to running the tests, 2 output paths are possible:

- All tests succeed, and thus the update can be pushed to production.
- One or several tests failed, several output paths are possible:
    - Failure is due to change in some function calls (_e.g._ signature, argument, package, etc.). The development team must update their code to fit the new library. Once that is done, re-run the tests.
    - The fixed version cannot be adopted at all (_e.g._ the fix only ships in a new major version that breaks the application, or the vulnerable version is pinned by a transitive dependency). Apply [Case 5](#case-5), using [Case 2](#case-2) as an interim mitigation.
    - Technical incompatibility of the released dependency (_e.g._ require a more recent runtime version) which leads to the following actions:
    1. Raise the issue to the provider.
    2. Apply [Case 2](#case-2) while waiting for the provider's feedback.

#### Case 2

##### Context

Provider informs the team that it will take a while to fix the issue and, so, a patched version will not be available before months.

##### Ideal condition of application of the approach

Provider can share any of the below with the development team:

- The exploitation code.
- The list of impacted functions by the vulnerability.
- A workaround to prevent the exploitation of the issue.

##### Approach

**Step 1:**

If a workaround is provided, it should be applied and validated on the testing environment, and thereafter deployed to production.

Identify the reachable calls to affected functions and the conditions required to exploit the vulnerability. Use a wrapper only when its checks block those conditions on every affected call path. Otherwise, disable the affected functionality or isolate it while pursuing a fix. Treat the wrapper as a temporary mitigation, and track the upgrade or replacement that removes the vulnerable dependency.

Moreover, security devices, such as the Web Application Firewall (WAF), can handle such issues by protecting the internal applications through parameter validation and by generating detection rules for those specific libraries. Yet, in this cheat sheet, the focus is set on the application level in order to patch the vulnerability as close as possible to the source.

_Illustrative allowlist wrapper: use this only if analysis of the specific vulnerability establishes that the accepted values cannot trigger it. This pattern is not a general defense against remote code execution._

```java
public void callFunctionWithRCEIssue(String externalInput){
    //Apply input validation on the external input using regex
    if(Pattern.matches("[a-zA-Z0-9]{1,50}", externalInput)){
        //Call only with values covered by the vulnerability-specific analysis
        functionWithRCEIssue(externalInput);
    }else{
        //Log rejected input without assuming it was an exploit
        SecurityLogger.warn("Input rejected by temporary vulnerability mitigation");
        //Raise an exception leading to a generic error send to the client...
    }
}
```

If the provider has provided nothing about the vulnerability, [Case 3](#case-3) can be applied skipping the _step 2_ of this case. We assume here that, at least, the [CVE](https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures) has been provided.

**Step 2:**

Use any provider-supplied exploit as a regression test. Blocking that payload does not prove that the library is secure: test alternate inputs and all reachable paths to the affected functionality. The [Core Rule Set rule-writing guidance](https://coreruleset.org/docs/3-about-rules/creating/#advanced-transformation-usage) illustrates how small payload changes can bypass a filter. Follow the [virtual patch testing guidance](https://cheatsheetseries.owasp.org/cheatsheets/Virtual_Patching_Cheat_Sheet.html#implementationtesting-phase) and keep the permanent fix on the remediation plan.

If you have a set of automated unit or integration or functional or security tests that exist for the application, run them to verify that the protection code added does not impact the stability of the application.

Add a comment in the project _README_ explaining that the issue (specify the related [CVE](https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures)) is handled during the waiting time of a patched version because the detection tool will continue to raise an alert on this dependency.

**Note:** You can add the dependency to the ignore list but the ignore scope for this dependency must only cover the [CVE](https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures) related to the vulnerability because a dependency can be impacted by several vulnerabilities having each one its own [CVE](https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures).

#### Case 3

##### Context

Provider informs the team that they cannot fix the issue, so no patched version will be released at all (applies also if provider does not want to fix the issue or does not answer at all).

In this case the only information given to the development team is the [CVE](https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures).

**Notes:**

- This case is really complex and time consuming and is generally used as last resort.
- If the impacted dependency is an open source library then we, the development team, can create a patch and create [pull request](https://help.github.com/en/articles/about-pull-requests) - that way we can protect our company/application from the source as well as helping others secure their applications.

##### Ideal condition of application of the approach

Nothing specific because here we are in a _patch yourself_ condition.

##### Approach

**Step 1:**

If we are in this case due to one of the following conditions, it's a good idea to start a parallel study to find another component better maintained or if it's a commercial component with support **then put pressure** on the provider with the help of your [Chief Risk Officer](https://en.wikipedia.org/wiki/Chief_risk_officer) (fallback possible to [Chief Information Security Officer](https://en.wikipedia.org/wiki/Chief_information_security_officer)):

- Provider does not want to fix the issue.
- Provider does not answer at all.

In all cases, here, we need to handle the vulnerability right now.

**Step 2:**

As we know the vulnerable dependency, we know where it is used in the application (if it's a transitive dependency then we can identify the first level dependency using it using the [IDE](https://en.wikipedia.org/wiki/Integrated_development_environment) built-in feature or the dependency management system used (Maven, Gradle, NuGet, npm, etc.). Note that IDE is also used to identify the calls to the dependency.

Identifying calls to this dependency is fine but it is the first step. The team still lacks information on what kind of patching needs to be performed.

Use the CVE description to identify the reported weakness, then consult the upstream advisory, issue, and fix to determine the affected behavior and required change. A vulnerability category alone does not establish which checks or configuration changes will prevent exploitation. If the root cause is still unclear, do not assume that a wrapper from [Case 2](#case-2) fixes it.

_Example:_

The team has an application using the Jackson API in a version exposed to the [CVE-2016-3720](https://nvd.nist.gov/vuln/detail/CVE-2016-3720).

The description of the CVE is as follows:

```text
XML external entity (XXE) vulnerability in XmlMapper in the Data format extension for Jackson
(aka jackson-dataformat-xml) allows attackers to have unspecified impact via unknown vectors.
```

The [upstream issue](https://github.com/FasterXML/jackson-dataformat-xml/issues/190) and [fix](https://github.com/FasterXML/jackson-dataformat-xml/commit/f0f19a4c924d9db9a1e2830434061c8640092cc0) disable `XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES` for input factories created by Jackson. This is a parser configuration change, not generic XML pre-validation. Use a maintained release containing the fix. If an upgrade is blocked, evaluate that specific fix through [Case 5](#case-5); also harden any application-supplied parser using the [XXE prevention guidance](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html#xmlinputfactory-stax).

**Step 3:**

If possible, create a unit test that mimics the vulnerability in order to ensure that the patch is effective and have a way to continuously ensure that the patch is in place during the evolution of the project.

If you have a set of automated unit or integration or functional or security tests that exists for the application then run them to verify that the patch does not impact the stability of the application.

A patch written in-house does not get the benefit of the doubt that an upstream release gets, so hold it to an explicit bar before considering the vulnerability handled:

- The test reproducing the vulnerability fails against the unpatched dependency and passes against the patched one. A test that passes in both cases proves nothing about the patch.
- The tests of the dependency itself still pass, which catches behavior that the patch broke but the application does not exercise directly.
- The alert raised by the detection tool is suppressed per [CVE](https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures) only once the two points above hold. Suppressing the alert, or changing a version string so that the tool stops matching it, records a fix but does not make one.

Expect the tool to keep flagging the dependency even after a correct patch, because [looking at the version number of a package will not tell you whether the fix is present](https://access.redhat.com/security/updates/backporting). That is a reporting problem to be handled with a scoped suppression, not a reason to change the patch.

#### Case 4

##### Context

The vulnerable dependency is found during one of the following situation in which the provider is not aware of the vulnerability:

- Via the discovery of a full disclosure post on the Internet.
- During a penetration test.

##### Ideal condition of application of the approach

Provider collaborates with you after being notified of the vulnerability.

##### Approach

**Step 1:**

Inform the provider about the vulnerability by sharing the post with them.

**Step 2:**

Using the information from the full disclosure post or the pentester's exploitation feedback, if the provider collaborates then apply [Case 2](#case-2), otherwise apply [Case 3](#case-3), and instead of analyzing the CVE information, the team needs to analyze the information from the full disclosure post/pentester's exploitation feedback.

#### Case 5

##### Context

A fixed version has been released by the provider, but the project cannot adopt it:

- The fix only ships in a new major version that breaks the application code.
- The vulnerable version is pinned by a [transitive dependency](https://en.wikipedia.org/wiki/Transitive_dependency) that has not been updated yet.
- The version line in use is no longer maintained and the fix landed only on a newer line.

This is not [Case 3](#case-3): the fix exists and is public, so nothing has to be invented, but it has to be moved onto the version line that the project can actually run. That practice is called _backporting_, and operating system vendors have handled the same problem this way for years. [Debian](https://www.debian.org/security/faq) states that "instead of upgrading to a new release we backport security fixes to the version that was shipped in the stable release", and [Red Hat](https://access.redhat.com/security/updates/backporting) defines backporting as "the action of taking a fix for a security flaw out of the most recent version of an upstream software package and applying that fix to an older version".

##### Ideal condition of application of the approach

The upstream fix can be identified (a commit, a patch file, or an advisory precise enough to locate the change), the source of the version in use is available, and automated tests exist for the application features using the dependency.

##### Approach

**Step 1:**

Confirm that the upgrade is really blocked by attempting it on a testing environment as described in [Case 1](#case-1). Backporting is cheaper than a major upgrade in the short term and more expensive over the life of the project, so it must be a deliberate choice rather than the first reflex. Record the exact blocker (breaking API, transitive pin, unsupported runtime), because that is the condition to re-test later.

**Step 2:**

Isolate the security-relevant change from the rest of the upstream release. Fix commits are frequently bundled with refactoring, renaming and unrelated bugfixes that must not be carried over, and the fix may rely on internal functions that do not exist in the older line, in which case the same check has to be re-implemented instead of cherry-picked. Keep the patch minimal: the goal is to block the vulnerability without changing any existing legitimate behavior.

**Step 3:**

Verify the patch rather than assume it. A test reproducing the vulnerability must fail against the unpatched dependency and pass against the patched one, and both the dependency's own test suite and the application tests must still pass. Silencing the scanner or bumping a version string is not remediation.

**Step 4:**

Distribute the patched artifact so that every build resolves it: publish it to the internal registry or proxy that the build already trusts, instead of committing a locally built file into each project. Give it a version identifier that remains traceable to the upstream version it derives from, and record its provenance (source commit, CVE, who produced it) so that the next reader can audit it. Expect detection tools to keep flagging the dependency, because [looking at the version number of a package will not tell you whether a backported fix is present](https://access.redhat.com/security/updates/backporting); suppress the alert per CVE as described in the note of [Case 2](#case-2).

**Step 5:**

Treat the patch as a standing commitment and not a one-off task. Every new upstream release of the dependency has to be re-patched, and every new CVE affecting it adds another patch to carry. Before deciding to maintain patches in-house, size that recurring work against acquiring maintained backports from a provider whose business is producing them. Drop the backport as soon as the fixed version becomes adoptable: re-test the blocker recorded in step 1 at each dependency review, then go back to [Case 1](#case-1).

### Tools

This section lists several tools that can used to analyze the dependencies used by a project in order to detect the vulnerabilities.

It's important to ensure, during the selection process of a vulnerable dependency detection tool, that this one:

- Uses several reliable input sources in order to handle both vulnerability disclosure ways.
- Support for flagging an issue raised on a component as a [false-positive](https://www.whitehatsec.com/glossary/content/false-positive).

- Free
    - [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/):
        - Full support: Java, .Net.
        - Experimental support: Python, Ruby, PHP (composer), NodeJS, C, C++.
    - [NPM Audit](https://docs.npmjs.com/cli/audit)
        - Full support: NodeJS, JavaScript.
        - HTML report available via this [module](https://www.npmjs.com/package/npm-audit-html).
    - [OWASP Dependency Track](https://dependencytrack.org/) can be used to manage vulnerable dependencies across an organization.
    - [Trivy](https://github.com/aquasecurity/trivy)
        - Full support: Base OS, Java, NodeJS, JavaScript, Ruby, Python, Go, .NET, Rust, PHP, Dart, Swift
        - Targets: Kubernetes (nodes and containers), Docker (nodes and containers), filesystem, Git repositories, cloud images
    - [Grype](https://github.com/anchore/grype)
        - Full support across mainstream language ecosystems with SBOM-driven scanning
        - Targets: container images, filesystems, and SBOMs produced by [Syft](https://github.com/anchore/syft)
- Commercial
    - [Snyk](https://snyk.io/) (open source and free option available):
        - [Full support](https://snyk.io/docs/) for many languages and package manager.
    - [JFrog XRay](https://jfrog.com/xray/):
        - [Full support](https://jfrog.com/integration/) for many languages and package manager.
    - [Renovate](https://renovatebot.com) (allow to detect old dependencies):
        - [Full support](https://renovatebot.com/docs/) for many languages and package manager.

#### Remediation and maintained backports

The tools above detect vulnerable dependencies, they do not fix them. When the fixed version cannot be adopted, the patch still has to come from somewhere: either the development team maintains it or someone else does.

Linux distribution security teams are the reference model for the second option. [Debian](https://www.debian.org/security/faq) and [Red Hat](https://access.redhat.com/security/updates/backporting) both backport security fixes into the version shipped in the stable release instead of upgrading it. When the dependency is consumed as an operating system package, take the distribution's patched build rather than maintaining a private patch.

Language ecosystem packages are rarely covered that way, so the choice there is between maintaining the patch in-house and paying someone to maintain it. Judge either option on the same criteria as a detection tool, plus:

- Coverage of the ecosystems, version lines and severities the project depends on, with a published response time.
- Publication of the patch itself and of its provenance, so that the change can be reviewed instead of being trusted blindly.
- Delivery as a compatible artifact through a registry or proxy that the build already uses, so that no manifest rewrite is required.
- A documented way out, so that leaving the source does not mean re-patching everything from scratch.

## Dependency Graph & SBOM Best Practices

> **Source:** [Dependency Graph & SBOM Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Dependency_Graph_SBOM_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

A software bill of materials (SBOM) inventories software components; a dependency graph records their relationships. Use both to locate vulnerable components in releases and deployments. The [CycloneDX SBOM guide](https://cyclonedx.org/guides/OWASP_CycloneDX-Authoritative-Guide-to-SBOM-en.pdf) describes these capabilities.

### Capture components and relationships

Use a standard machine-readable format such as CycloneDX. Capture:

- Component names, versions, suppliers, package identifiers, and hashes where available.
- Direct and transitive dependency relationships: components used directly and those brought in by other components.
- The product described, SBOM author, generation time, and generator identity/version.

Record incomplete or unknown coverage explicitly. A component missing from an SBOM is not evidence that it is absent from the software. The [CycloneDX guide](https://cyclonedx.org/guides/OWASP_CycloneDX-Authoritative-Guide-to-SBOM-en.pdf) covers metadata and completeness declarations.

### Generate for each release

Automate generation after dependency resolution, then reconcile the inventory with the final package or container image. Include bundled libraries and operating system packages where applicable; manifests alone can misrepresent shipped contents. Record generation scope and known gaps. The [CycloneDX generation guidance](https://cyclonedx.org/guides/OWASP_CycloneDX-Authoritative-Guide-to-SBOM-en.pdf) recommends comparing build artifacts with the SBOM and correcting discrepancies.

Validate the document against its format's schema before publication or ingestion, and separately check the metadata and relationships listed above. Passing these checks does not establish inventory completeness.

Keep each release's inventory distinct. For pipeline hardening, follow the [CI/CD Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html).

### Bind and verify release evidence

Bind the SBOM to the final artifact's cryptographic digest through a signed attestation: a signed statement identifying the artifact and its SBOM. Signing the artifact and SBOM separately does not establish that relationship. An SBOM attestation describes inventory; build provenance separately records how the artifact was produced.

Use [SLSA's provenance verification checks](https://slsa.dev/spec/v1.2/verifying-artifacts) as a model for verifying release evidence before installation or deployment: validate signatures, allowed signer identities, the artifact digest, and the expected attestation type. For build provenance, also check the expected builder identity, source repository, build type, and parameters. Reject missing, invalid, or unexpected evidence when your trust policy requires it.

Valid signatures authenticate claims and protect their integrity. They do not prove that an SBOM is accurate or complete, that software is safe, or that a trusted builder has not been compromised.

Preserve original SBOMs and signed evidence alongside each release, even when importing inventory into another system. Restrict write access and limit sharing of sensitive metadata. [CISA's SBOM consumption guidance](https://www.cisa.gov/sites/default/files/2024-08/SECURING_THE_SOFTWARE_SUPPLY_CHAIN_RECOMMENDED_PRACTICES_FOR_SOFTWARE_BILL_OF_MATERIALS_CONSUMPTION-508.pdf) covers validation and original-document retention. See the [Software Supply Chain Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Software_Supply_Chain_Security_Cheat_Sheet.html) for broader controls.

### Use inventory for vulnerability response

Map release SBOMs to deployed systems and reassess components when new advisories arrive. Prioritize direct and transitive dependencies by exploitability, exposure, and impact; dependency depth alone does not determine risk. Use the graph to identify which parent dependency brings in an affected component.

Vulnerability Exploitability eXchange (VEX) documents state whether a vulnerability affects a particular product. Before accepting a "not affected" claim, authenticate the issuer, verify document integrity, and assess its justification against the exact product version and deployment conditions. [CISA's consumption guidance](https://www.cisa.gov/sites/default/files/2024-08/SECURING_THE_SOFTWARE_SUPPLY_CHAIN_RECOMMENDED_PRACTICES_FOR_SOFTWARE_BILL_OF_MATERIALS_CONSUMPTION-508.pdf) recommends checking VEX veracity and reassessing risk over time.

Use the [Vulnerable Dependency Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html) to select and verify remediation. After rebuilding, compare the new SBOM with the previous release and update deployment mappings. An updated inventory does not by itself prove that the vulnerability is fixed or the mitigations work.

## NPM Security best practices

> **Source:** [NPM Security best practices](https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

The following cheatsheet covers several npm security best practices and productivity tips, useful for JavaScript and Node.js developers. This list was originally based on the [10 npm security best practices](https://snyk.io/blog/ten-npm-security-best-practices) from the Snyk blog.

### 1) Avoid publishing secrets to the npm registry

Whether you’re making use of API keys, passwords or other secrets, they can very easily end up leaking into source control or even a published package on the public npm registry. You may have secrets in your working directory in designated files such as a `.env` which should be added to a `.gitignore` to avoid committing it to a SCM, but what happens when you publish an npm package from the project’s directory?

The npm CLI packs up a project into a tar archive (tarball) in order to push it to the registry. The following criteria determine which files and directories are added to the tarball:

- If there is either a `.gitignore` or a `.npmignore` file, the contents of the file are used as an ignore pattern when preparing the package for publication.
- If both ignore files exist, everything not located in `.npmignore` is published to the registry. This condition is a common source of confusion and is a problem that can lead to leaking secrets.

Developers may end up updating the `.gitignore` file, but forget to update `.npmignore` as well, which can lead to a potentially sensitive file not being pushed to source control, but still being included in the npm package.

Another good practice to adopt is making use of the `files` property in `package.json`, which works as an allowlist and specifies the array of files to be included in the package that is to be created and installed (while the ignore file functions as a denylist). The `files` property and an ignore file can both be used together to determine which files should explicitly be included, as well as excluded, from the package. When using both, the `files` property in `package.json` takes precedence over the ignore file.

When a package is published, the npm CLI will verbosely display the archive being created. To be extra careful, add a `--dry-run` command-line argument to your publish command in order to first review how the tarball is created without actually publishing it to the registry.

For details about revoking access token, see the official documentation: [Revoking access tokens](https://docs.npmjs.com/revoking-access-tokens).

### 2) Enforce the lockfile

We embraced the birth of package lockfiles with open arms, which introduced: deterministic installations across different environments, and enforced dependency expectations across team collaboration. Life is good! Or so I thought… what would have happened had I slipped a change into the project’s `package.json` file but had forgotten to commit the lockfile alongside of it?

Both Yarn and npm act the same during dependency installation. When they detect an inconsistency between the project’s `package.json` and the lockfile, they compensate for such change based on the `package.json` manifest by installing different versions than those that were recorded in the lockfile.

This kind of situation can be hazardous for build and production environments as they could pull in unintended package versions and render the entire benefit of a lockfile futile.

Luckily, there is a way to tell both Yarn and npm to adhere to a specified set of dependencies and their versions by referencing them from the lockfile. Any inconsistency will abort the installation. The command-line should read as follows:

- If you’re using Yarn, run `yarn install --frozen-lockfile`.
- If you’re using npm run `npm ci`.

### 3) Minimize attack surfaces by ignoring run-scripts

The npm CLI works with package run-scripts. If you’ve ever run `npm start` or `npm test` then you’ve used package run-scripts too. The npm CLI builds on scripts that a package can declare, and allows packages to define scripts to run at specific entry points during the package’s installation in a project. For example, some of these [script hook](https://docs.npmjs.com/misc/scripts) entries may be `postinstall` scripts that a package that is being installed will execute in order to perform housekeeping chores.

With this capability, bad actors may create or alter packages to perform malicious acts by running any arbitrary command when their package is installed. A couple of cases where we’ve seen this already happening is the popular [eslint-scope incident](https://snyk.io/vuln/npm:eslint-scope:20180712) that harvested npm tokens, and the [crossenv incident](https://snyk.io/vuln/npm:crossenv:20170802), along with 36 other packages that abused a typosquatting attack on the npm registry.

Apply these npm security best practices to minimize the malicious module attack surface:

- Always vet and perform due-diligence on third-party modules you install to confirm their health and credibility.
- Hold-off on upgrading immediately to new versions; allow new package versions some time to circulate before trying them out.
- Before upgrading, make sure to review changelog and release notes for the upgraded version.
- When installing packages make sure to add the `--ignore-scripts` suffix to disable the execution of any scripts by third-party packages.
- Consider adding `ignore-scripts=true` to your `.npmrc` project file, or to your global npm configuration.

#### Using an allowlist for lifecycle scripts

Disabling lifecycle scripts by default by adding `ignore-scripts=true` to your `.npmrc` file is the safest option. If you use packages that rely on lifecycle scripts for legitimate reasons, you can use a plugin like [`@lavamoat/allow-scripts`](https://github.com/LavaMoat/LavaMoat/tree/main/packages/allow-scripts) to create an _allowlist_ of packages authorized to run lifecycle scripts.

Here's how the allowlist would look like in the `package.json` file on a project using the popular image processing package [sharp](https://www.npmjs.com/package/sharp):

```json
{
  "lavamoat": {
    "allowScripts": {
      "sharp": true
    }
  }
}
```

### 4) Assess npm project health

#### npm outdated command

Rushing to constantly upgrade dependencies to their latest releases is not necessarily a good practice if it is done without reviewing release notes, the code changes, and generally testing new upgrades in a comprehensive manner. With that said, staying out of date and not upgrading at all, or after a long time, is a source for trouble as well.

The npm CLI can provide information about the freshness of dependencies you use with regards to their semantic versioning offset. By running `npm outdated`, you can see which packages are out of date. Dependencies in yellow correspond to the semantic versioning as specified in the `package.json` manifest, and dependencies colored in red mean an update is available. Furthermore, the output also shows the latest version for each dependency.

#### npm doctor command

Between the variety of Node.js package managers and different versions of Node.js you may have installed in your path, how do you verify a healthy npm installation and working environment? Whether you’re working with the npm CLI in a development environment or within a CI, it is important to assess that everything is working as expected.

Call the doctor! The npm CLI incorporates a health assessment tool to diagnose your environment for a well-working npm interaction. Run `npm doctor` to review your npm setup:

- Check the official npm registry is reachable, and display the currently configured registry.
- Check that Git is available.
- Review installed npm and Node.js versions.
- Run permission checks on the various folders such as the local and global `node_modules`, and on the folder used for package cache.
- Check the local npm module cache for checksum correctness.

### 5) Audit for vulnerabilities in open source dependencies

The npm ecosystem is the single largest repository of application libraries among all the other language ecosystems. The registry and the libraries in it are at the core for JavaScript developers as they are able to leverage work that others have already built and incorporate it into their codebase. With that said, the increasing adoption of open source libraries in applications brings with it an increased risk of introducing security vulnerabilities.

Many popular npm packages have been found to be vulnerable and may carry a significant risk without proper security auditing of your project’s dependencies. Some examples are npm [request](https://snyk.io/vuln/npm:request:20160119), [superagent](https://snyk.io/vuln/search?q=superagent&type=npm), [mongoose](https://snyk.io/vuln/search?q=mongoose&type=npm), and even security-related packages like [jsonwebtoken](https://snyk.io/vuln/npm:jsonwebtoken:20150331), and [validator](https://snyk.io/vuln/search?q=validator&type=npm).

Security doesn’t end by just scanning for security vulnerabilities when installing a package but should also be streamlined with developer workflows to be effectively adopted throughout the entire lifecycle of software development, and monitored continuously when code is deployed:

- Scan for security vulnerabilities in [third-party open source projects](https://owasp.org/www-community/Component_Analysis)
- Monitor snapshots of your project's manifests so you can receive alerts when new CVEs impact them [OWASP Dependency-Track](https://owasp.org/www-project-dependency-track/)

### 6) Artifact governance and supply chain protections

#### Use a local npm proxy

The npm registry is the biggest collection of packages that is available for all JavaScript developers and is also the home of most Open Source projects for web developers. But sometimes you might have different needs in terms of security, deployments or performance. When this is true, npm allows you to switch to a different registry:

When you run `npm install`, it automatically starts a communication with the main registry to resolve all your dependencies; if you wish to use a different registry, that too is pretty straightforward:

- Set `npm set registry` to set up a default registry.
- Use the argument `--registry` for one single registry.

[Verdaccio](https://verdaccio.org/) is a simple, lightweight zero-config-required private registry and installing it is as simple as follows: `$ npm install --global verdaccio`.

Hosting your own registry was never so easy! Let’s check the most important features of this tool:

- It supports the npm registry format including private package features, scope support, package access control and authenticated users in the web interface.
- It provides capabilities to hook remote registries and the power to route dependencies to different registries and cache their tarballs. To reduce duplicate downloads and save bandwidth in your local development and CI servers, you should proxy all dependencies.
- As an authentication provider it uses htpasswd security by default, but also supports GitLab, Bitbucket, and LDAP. You can also use your own.
- It’s easy to scale using a different storage provider.
- If your project is based in Docker, using the official image is the best choice.
- It enables really fast bootstrap for testing environments, and is handy for testing big mono-repo projects.

#### Governance & Verification Steps

Supply-chain attacks increasingly target build artifacts, registries and CI credentials. Add lightweight governance and verification steps to reduce risk and improve response time:

- Track provenance and produce an SBOM for builds (CycloneDX/SPDX) so you can trace what was built and where inputs originated.

  CycloneDX Example:

  ```bash
  # Generate SBOM
  npm install @cyclonedx/cyclonedx-npm
  npx @cyclonedx/cyclonedx-npm --validate > sbom.json # Use the flag `--omit dev` to exclude dev dependencies from SBOM if needed
  ```

- Sign artifacts and build provenance (for example, use Sigstore / cosign or similar signing tools) so consumers can verify integrity before installing.

  Illustrative [Sigstore 5 verification example](https://github.com/sigstore/sigstore-js/tree/main/packages/client#verifybundle-payload-options), assuming a [GitHub Actions signing workflow](https://docs.sigstore.dev/quickstart/verification-cheat-sheet/#verifying-a-signature-created-by-a-workflow). Replace the placeholder repository and workflow with your trusted release policy. Verify both the expected issuer and certificate identity; identity patterns are regular expressions, so anchor them and escape literal dots. Never derive this policy from the untrusted bundle.

  ```javascript
  // sign-and-verify.mjs
  // npm install sigstore@5

  import * as fs from 'fs';
  import * as sigstore from 'sigstore';

  // Path to your built npm package (via `npm pack`)
  const artifact = 'my-lib-1.0.0.tgz';

  // --- Sign ---
  const payload = fs.readFileSync(artifact);
  const bundle = await sigstore.sign(payload);
  fs.writeFileSync(`${artifact}.sigstore.json`, JSON.stringify(bundle, null, 2));
  console.log('Signed:', artifact);

  // --- Verify ---
  await sigstore.verify(bundle, payload, {
    certificateIssuer: 'https://token.actions.githubusercontent.com',
    certificateIdentityURI:
      '^https://github\\.com/OWNER/REPOSITORY/\\.github/workflows/release\\.yml@refs/heads/main$',
  });
  console.log('Verified OK!');
  ```

- Prefer immutable, access-controlled registries or vetted mirrors (private registries, Verdaccio with an upstream cache, or [approved mirrors](#use-a-local-npm-proxy)) and enable retention / immutability policies where available.
- Restrict, scope and rotate CI and publisher tokens. Bind publisher tokens to workflows or IP ranges and minimize privileges.
- Verify packages during CI: check signatures or provenance, validate the SBOM, [run SCA and static analysis](#5-audit-for-vulnerabilities-in-open-source-dependencies), and [install from pinned lockfile resolutions](#2-enforce-the-lockfile).
- Automate monitoring and alerts for unusual publishes, token usage or dependency changes and keep a documented remediation playbook (revoke tokens, deprecate/yank compromised packages, publish fixes and notify consumers).

These measures are incremental and low-risk to adopt. Combined they make supply-chain attacks harder and speed up identification and recovery if a compromise occurs.

### 7) Responsibly disclose security vulnerabilities

When security vulnerabilities are found, they pose a potentially serious threat if they are publicised without prior warning or appropriate remedial action for users who cannot protect themselves.

It is recommended that security researchers follow a responsible disclosure program, which is a set of processes and guidelines that aims to connect the researchers with the vendor or maintainer of the vulnerable asset, in order to convey the vulnerability, its impact and applicability. Once the vulnerability is correctly triaged, the vendor and researcher coordinate a fix and a publication date for the vulnerability in an effort to provide an upgrade-path or remediation for affected users before the security issue is made public.

### 8) Enable 2FA

Enabling two-factor authentication (2FA) is a critical npm security best practice. npm requires 2FA or a granular access token configured to bypass 2FA for package publishing. For interactive publishing, require 2FA and disallow token-based publishing where practical.

npm supports two 2FA modes for an account:

- Authorization-only—when a user logs in to npm via the website or the CLI, or performs other sets of actions such as changing profile information.
- Authorization and write-mode—profile and log-in actions, as well as write actions such as managing tokens and packages, and minor support for team and package visibility information.

To get started, see the official documentation for [configuring 2FA](https://docs.npmjs.com/configuring-two-factor-authentication/) and [requiring 2FA for package publishing](https://docs.npmjs.com/requiring-2fa-for-package-publishing-and-settings-modification/).

Equip yourself with an authentication application, such as Google Authenticator, which you can install on a mobile device, and you’re ready to get started. One easy way to get started with the 2FA extended protection for your account is through npm’s user interface, which allows enabling it very easily. If you’re a command-line person, it’s also easy to enable 2FA when using a supported npm client version (>=5.5.1):

```sh
npm profile enable-2fa auth-and-writes
```

Follow the command-line instructions to enable 2FA, and to save emergency authentication codes. If you wish to enable 2FA mode for login and profile changes only, you may replace the `auth-and-writes` with `auth-only` in the code as it appears above.

### Additional Security Resources

- [About secret scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning)
- [Best practices for securing accounts](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure)

### 9) Minimize npm Access Token Use

Classic npm tokens have been revoked. Prefer [trusted publishing with OpenID Connect](https://docs.npmjs.com/trusted-publishers/) for supported CI/CD publishing workflows because it avoids stored, long-lived publishing credentials.

When a token is still required, use a [granular access token](https://docs.npmjs.com/about-access-tokens/) with only the packages, organizations, and permissions needed. Use read-only access for dependency installation, set the shortest practical expiration, restrict source IP ranges where stable, and enable bypassing 2FA only for non-interactive workflows that cannot use trusted publishing. Store the token in a CI secret store and never commit it.

Review tokens regularly with `npm token list` and immediately revoke unnecessary or exposed tokens with `npm token revoke <token-id>`.

### 10) Understanding typosquatting and slopsquatting attacks

#### Typosquatting attacks

Typosquatting is an attack that relies on mistakes made by users, such as typos. With typosquatting, bad actors publish malicious modules to the npm registry with names that look much like existing popular modules. These malicious packages exploit common typing errors or visual similarities to trick developers into installing them instead of the legitimate packages they intended to use.

The Snyk security team has tracked tens of malicious packages in the npm ecosystem that used typosquatting to trick users into installing them; similar attacks have been observed on the PyPi Python registry as well. Some of the most notable incidents include [cross-env](https://snyk.io/vuln/npm:crossenv:20170802), [event-stream](https://snyk.io/vuln/SNYK-JS-EVENTSTREAM-72638), and [eslint-scope](https://snyk.io/vuln/npm:eslint-scope:20180712).

One of the main targets for typosquatting attacks are user credentials, since any package has access to environment variables via the global variable `process.env`. Other examples include the event-stream case, where attackers targeted developers in the hopes of [injecting malicious code](https://snyk.io/blog/a-post-mortem-of-the-malicious-event-stream-backdoor) into an application's source code.

#### Slopsquatting attacks

Slopsquatting is a newer attack vector that exploits AI coding assistants. When developers ask AI tools like ChatGPT or GitHub Copilot to suggest packages, these models may hallucinate package names that do not actually exist. Attackers monitor these hallucinations and publish malicious packages with those exact names, knowing developers may blindly trust and install AI-suggested packages.

Unlike typosquatting which exploits human typing errors, slopsquatting exploits AI's tendency to generate plausible-looking but non-existent package names — making it harder to detect since the suggested name looks completely legitimate.

For example, an AI assistant might suggest `node-fetch-promise` instead of the real package `node-fetch`. If an attacker has already published a malicious package under that hallucinated name, installing it compromises your system silently.

To protect against slopsquatting:

- Run `npm view <package-name>` before installing any AI-suggested package to confirm it exists.
- Check the package download count — legitimate packages have thousands or millions of downloads while newly published malicious ones have very few.
- Verify the package has a real GitHub repository with genuine code, commits and contributors.
- Be suspicious of packages created very recently with no release history.
- Never blindly run `npm install` on packages suggested by AI tools without independent verification.
- In team environments, add `npm view <package-name>` as a CI check for any new AI-suggested dependencies before they reach production.

### 11) Use trusted publishers for secure package publishing

Traditional npm publishing relies on long-lived tokens that can be compromised or accidentally exposed. Trusted publishing with OpenID Connect (OIDC) provides a more secure alternative by using short-lived, workflow-specific credentials that are automatically generated during CI/CD processes. Check the [official trusted publishing documentation](https://docs.npmjs.com/trusted-publishers/) for the current supported providers and runner restrictions.

#### How trusted publishing works

Trusted publishing creates a trust relationship between npm and your CI/CD provider using OIDC. When you configure a trusted publisher for your package, npm will accept publishes from the specific workflow you've authorized, in addition to traditional authentication methods like npm tokens and manual publishes. The npm CLI automatically detects OIDC environments and uses them for authentication before falling back to traditional tokens.

This approach eliminates the security risks associated with long-lived write tokens, which can be compromised, accidentally exposed in logs, or require manual rotation. Instead, each publish uses short-lived, cryptographically-signed tokens that are specific to your workflow and cannot be extracted or reused.

#### Automatic provenance generation

When publishing via trusted publishing, npm automatically generates provenance attestations that provide cryptographic proof of package authenticity. This helps users verify that packages come from legitimate sources and haven't been tampered with.

For more information, see the [npm trusted publishing documentation](https://docs.npmjs.com/trusted-publishers).

### 12) Prevent dependency confusion attacks

A dependency confusion attack occurs when an attacker publishes a malicious package on the public npm registry using the same name as your internal private package, but with a higher version number. When you run `npm install`, npm may resolve the public malicious package instead of your internal one because of the higher version.

Attackers typically discover internal package names through:

- Leaked `package.json` files accidentally pushed to public GitHub repositories
- Job postings that mention internal tools or package names
- Error messages or stack traces that reveal internal dependency names

To protect against dependency confusion:

- Always use **scoped package names** for internal packages (e.g., `@yourorg/package-name` instead of `package-name`)
- Configure your `.npmrc` to explicitly point scoped packages to your private registry by setting `@yourorg:registry=https://your-private-registry.example.com`
- Reserve your internal package names on the public npm registry by publishing an empty placeholder to prevent attackers from claiming them.

### 13) Verify documentation examples before copying into production

Library README files and official examples are often copied directly into production code. While the libraries themselves may use secure defaults internally, their documentation examples sometimes demonstrate insecure patterns that undermine those very defaults. This creates a "documentation attack surface" — a class of vulnerability where the security risk comes not from the library's code, but from how its documentation teaches developers to use it.

#### The pattern

A library implements strong security internally but its README examples use weaker configurations for brevity or backward compatibility. Developers copy these examples verbatim, unknowingly introducing vulnerabilities that the library was designed to prevent. Unlike supply chain attacks, these vulnerabilities pass every audit tool because the library code itself is safe — only the copy-pasted usage pattern is insecure.

#### Real-world examples

This pattern has been documented across popular npm packages with combined weekly downloads exceeding 195 million:

- **Weak key derivation**: A widely-used encryption library's README examples derive AES keys from passphrases using MD5 with a single iteration (EVP_BytesToKey), allowing a GPU to test billions of candidate passphrases per second. The library's own PBKDF2 module uses stronger defaults, but the prominent AES examples do not use it.
- **Credential exposure on redirect**: An HTTP client library's README demonstrates a `beforeRedirect` callback that re-injects authorization headers after the library has already stripped them during protocol downgrades (HTTPS to HTTP), effectively bypassing the library's own security mechanism.
- **Regex anchoring**: Libraries that accept regex patterns for validation (e.g., JWT audience matching, CORS origin matching) show examples with unanchored patterns like `/example\.com/`, which match `malicious-example.com`. The fix is `^https:\/\/example\.com$`, but the documentation doesn't demonstrate anchoring.
- **Insecure randomness**: A file upload library's README generates filenames with `Math.random()` while the library's own default uses `crypto.randomBytes(16)`. Developers who customize the filename — following the README example — downgrade from cryptographic to predictable randomness.

#### How to protect yourself

- **Never copy README examples into production without a security review.** Treat documentation code the same way you treat code from Stack Overflow — as a starting point, not a production-ready solution.
- **Check for secure defaults in the library's source code.** If the library internally uses `crypto.randomBytes()`, `PBKDF2`, or anchored regex patterns, but the README example uses `Math.random()`, `MD5`, or unanchored patterns, prefer the library's internal approach.
- **Validate security-sensitive parameters.** When a library accepts patterns, keys, or credentials as input, verify that your usage matches security best practices for that parameter type (anchored regex, authenticated encryption, HTTPS-only credentials).
- **Report insecure documentation.** If you find a README example that teaches an insecure pattern, file an issue with the maintainer. Documentation vulnerabilities affect every developer who copies the example.

For more context on this pattern, see the discussion at the [Node.js Security Working Group](https://github.com/nodejs/security-wg/issues/1560).

### Final Recommendations

Closing our list of npm security best practices are the following tips to reduce the risk of such attacks:

- Be extra-careful when copy-pasting package installation instructions into the terminal. Make sure to verify in the source code repository as well as on the npm registry that this is indeed the package you are intending to install. You might verify the metadata of the package with `npm info` to fetch more information about contributors and latest versions.
- Default to having an npm logged-out user in your daily work routines so your credentials won’t be the weak spot that would lead to easily compromising your account.
- When installing packages, append the `--ignore-scripts` to reduce the risk of arbitrary command execution. For example: `npm install my-malicious-package --ignore-scripts`

## Zero Trust Architecture

> **Source:** [Zero Trust Architecture](https://cheatsheetseries.owasp.org/cheatsheets/Zero_Trust_Architecture_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet will help you implement Zero Trust Architecture (ZTA) in your organization. Zero Trust means "never trust, always verify" - you don't trust anyone or anything by default, even if they're inside your network.

Traditional security works like a castle with walls. Once you're inside, you can access everything. Zero Trust is different - it checks every person and device every time they try to access something, just like having security guards at every door. This approach prevents attackers who get inside your network from moving around and stealing data.

### Core Zero Trust Principles

These principles come from [NIST SP 800-207](https://csrc.nist.gov/publications/detail/sp/800-207/final):

#### 1. All Data Sources and Computing Services are Resources

Everything in your network is a resource that needs protection - servers, databases, cloud services, IoT devices, and user devices. Don't assume anything is safe just because it's "internal" to your network. Each resource needs its own security controls.

#### 2. All Communication is Secured Regardless of Network Location

Every connection must be encrypted and authenticated, whether it's between your office and the cloud, between internal systems, or from home to work. Network location doesn't determine trust level. Use [strong encryption](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html) (TLS 1.3 or better) for everything.

#### 3. Access to Resources is Granted on a Per-Session Basis

Authorize each resource session with the least privileges needed. Authorization for one resource must not automatically grant access to another. [NIST SP 800-207, Section 2.1](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-207.pdf) permits a sufficiently recent trust evaluation; it does not require a new interactive login for every request. Set [session expiration and reauthentication requirements](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#automatic-session-expiration) according to resource sensitivity and risk.

#### 4. Access is Determined by Dynamic Policy

Access decisions consider multiple factors: who's asking, what device they're using, where they're connecting from, what time it is, and how they normally behave. These policies change based on risk. Someone accessing payroll during work hours from their work laptop is low risk. The same person downloading lots of data at 2 AM from a coffee shop is high risk.

#### 5. Monitor and Measure the Security Posture of All Assets

Continuously check the health and security of all devices and systems. If you can't see it, you can't protect it. This includes monitoring for patches, antivirus status, configuration changes, and suspicious behavior. Assets that fall out of compliance lose access.

#### 6. All Authentication and Authorization is Dynamic and Strictly Enforced

Enforce authentication and authorization before granting access, and reevaluate ongoing sessions according to policy. Trigger reauthentication or reauthorization when policy requires it, such as after a time limit, a request for another resource, or suspicious activity. Revoke access when the applicable policy no longer permits it, balancing security with availability and usability as described in [NIST SP 800-207, Section 2.1](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-207.pdf).

#### 7. Collect Information to Improve Security Posture

Collect asset posture, traffic, and access-request data to improve security decisions. Assess and mitigate the privacy risks of this monitoring, as described in [NIST SP 800-207, Section 6.2](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-207.pdf). Apply the [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude) guidance on excluding sensitive data and protecting collected logs.

### Core Zero Trust Architecture Components

Zero Trust uses three main parts that work together:

**Policy Engine** - This makes decisions about whether to allow or block access. It looks at user identity, device health, location, behavior, and risk scores. The tricky part is making policies that are secure but don't make work impossible.

**Policy Administrator** - This takes the decision from the Policy Engine and tells the enforcement systems what to do. When the Policy Engine says "allow access but require extra verification," the Policy Administrator figures out the details and sends commands to the right systems.

**Policy Enforcement Point** - These actually block or allow access attempts. This includes firewalls, proxy servers, application gateways, and API gateways. The important thing is that enforcement happens everywhere, not just at your network edge.

These components decide, establish, monitor, and terminate resource access according to policy; this does not require a new interactive login at every enforcement point.

### How Zero Trust Addresses Modern Security Challenges

Zero Trust tackles security problems that traditional approaches can't handle effectively. Here's how it works in practice:

#### Traditional vs. Zero Trust Responses

| Attack Scenario | Traditional Security Response | Zero Trust Response |
|----------------|------------------------------|-------------------|
| **Stolen credentials** | Reset password, add basic MFA | Continuous risk assessment, device verification, behavioral analysis - access denied even with valid credentials if risk is high |
| **Insider threat** | Trust employees inside network perimeter | Verify every action regardless of user location, role, or tenure - no implicit trust |
| **Lateral movement** | Perimeter security with flat internal network | Micro-segmentation blocks movement between systems, each connection verified |
| **Compromised device** | VPN access grants network access | Device health continuously monitored, access immediately revoked if compromise detected |
| **Privileged account abuse** | Permanent admin rights with periodic reviews | Just-in-time access with automatic expiration and continuous monitoring |
| **Data exfiltration** | Network monitoring and DLP at perimeter | Data-level access controls with real-time behavior analysis |

#### Modern Threats That Require Zero Trust

Some contemporary attack patterns are specifically designed to bypass traditional security. Zero Trust provides the advanced capabilities needed to defend against them:

**Supply Chain Attacks** - Malicious code hidden in trusted software (like SolarWinds) bypasses perimeter security completely. Zero Trust responds with application-level identity verification, runtime behavior monitoring, and micro-segmentation to limit damage.

**Cloud Configuration Drift** - Misconfigured cloud resources expose data outside traditional network boundaries. Zero Trust uses policy-as-code, continuous compliance monitoring, and resource-level access controls to prevent unauthorized data access.

**API-First Attacks** - Direct attacks on APIs bypass network security entirely. Zero Trust requires authentication and authorization for every API call, validates request schemas, and uses behavioral analysis to detect abuse patterns.

**Identity-Based Attacks** - Sophisticated attacks like Pass-the-Hash and Golden Ticket steal identity tokens to impersonate legitimate users. Zero Trust uses short-lived tokens with continuous validation, device binding, and behavioral analysis to detect unusual access patterns.

#### ZTA Decision-Making in Action

Here are three examples that show how Zero Trust actually works when it's set up correctly:

##### Case Study 1: Working Late from Home

**What happened:** A finance manager needed to check payroll data from home at 11:30 PM to prepare for an early morning meeting. She'd never accessed payroll outside normal work hours before.

**How Zero Trust handled it:**

The system noticed several risk factors: weird time (way outside 9-5), home network instead of office, and sensitive data (payroll has personal info and salaries). But it also saw good signs: company laptop with current security, valid device certificate, and the right job role.

Instead of just blocking her, the system asked for extra verification - she had to use her hardware security key and approve a notification on her phone. Then it let her in but with limits: 90-minute session, detailed logging of everything she did, and extra verification needed if she tried to download large amounts of data.

**Why this worked:** She could finish her urgent work without calling IT, but the system kept strong security controls that matched the risk level.

##### Case Study 2: New Contractor Laptop

**What happened:** An external contractor working on a software project needed to access the development systems from a brand-new laptop that had never connected before.

**How Zero Trust handled it:**

The system saw an unknown device trying to connect and immediately blocked direct network access. But instead of just saying "no," it sent the contractor to a secure browser platform where he could access only the development tools he needed.

All his work happened in an isolated cloud environment - he could write code, read documentation, and work with the team, but nothing actually touched his laptop. The whole session was recorded for security review, and he couldn't download files or access anything outside his project.

**Why this worked:** The contractor stayed productive without creating security risks, and the company kept complete control over its code and data.

##### Case Study 3: Cross-Team Project Access

**What happened:** A marketing manager suddenly started looking at engineering documents she'd never accessed before. The access was legitimate (for a cross-team project), but the system couldn't know that automatically.

**How Zero Trust handled it:**

The unusual access pattern triggered a medium-risk alert. Instead of blocking her right away, the system required manager approval through an automated workflow. It sent notifications to her boss and the engineering team lead explaining what she wanted to access.

Once approved, she got temporary access that would expire in 24 hours. During that time, everything she viewed was logged in detail, and the security team got a summary of what she accessed. If she needed more time, she'd have to request an extension with a business reason.

**Why this worked:** Cross-team collaboration wasn't blocked by security rules, but the company maintained visibility and control over sensitive technical information.

##### What These Cases Show

In each situation, Zero Trust didn't just say "yes" or "no" - it made smart decisions that balanced security with business needs. The system looked at multiple risk factors, applied appropriate controls, and kept detailed records for compliance and investigation.

This smart approach is what separates good Zero Trust implementations from basic access control. The technology adapts to the situation instead of forcing users to work around rigid security rules.

Now that you understand the principles and approach, let's get into the practical details of implementation. Start with identity and access management - this is the foundation everything else builds on.

### Identity and Access Management

#### Multi-Factor Authentication (MFA)

You need [MFA](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html) for everyone - employees, contractors, and partners. Here's what works best:

**Most Secure (Highly Phishing-Resistant):**

- **FIDO2 hardware security keys**: Use with a PIN, biometric activation, or a separate password to provide MFA
- **WebAuthn-based platform authenticators**: Passkeys with required user verification using a device PIN or biometrics
- **Smart cards or PIV cards**: PKI-based authentication

Biometrics alone do not provide MFA. They can activate a physical cryptographic authenticator, combining possession of that authenticator with a biometric match. See [NIST SP 800-63B-4, Section 3.2.3](https://pages.nist.gov/800-63-4/sp800-63b/authenticators/) and the [Passkey Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Passkey_Security_Cheat_Sheet.html#verify-the-authentication-response).

**Good Options:**

- **Mobile apps**: TOTP-based authenticator applications
- **Backup codes**: For when primary methods fail

**Avoid:**

- **SMS-based MFA**: Vulnerable to SIM swapping and phishing attacks

Set up conditional access so high-risk situations require stronger authentication. [OMB M-22-09](https://www.whitehouse.gov/wp-content/uploads/2022/01/M-22-09.pdf) mandates phishing-resistant MFA for U.S. federal agencies.

#### Managing User Accounts

- **Use one identity system**: Don't have multiple user databases
- **Automate account creation**: Set up role-based access automatically
- **Review access regularly**: Check who has access every quarter
- **Separate admin accounts**: Don't use regular accounts for administration

Follow comprehensive [authentication best practices](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) when implementing user account management.

#### Access Controls

Follow these rules for giving people [access](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html):

- **Least privilege**: Give the minimum access needed to do the job
- **Just-in-time access**: Provide elevated access only when needed for a specific task
- **No permanent admin rights**: Remove always-on administrative privileges
- **Smart decisions**: Consider user role, location, and device when granting access

### Device Security

#### Trusting Devices

Before you trust any device, make sure it meets your standards:

- **Register all devices**: Keep a list of approved devices with unique certificates
- **Continuous health assessment**: Real-time monitoring of antivirus status, OS patches, security configurations, and device security posture
- **Certificate-based device identity**: Use PKI certificates to uniquely identify and authenticate each device
- **Vulnerability scanning**: Regular assessment of device security posture and patch levels
- **Revoke trust when compromised**: Automatically remove access if device security is compromised

#### Protecting Endpoints

Every device needs these protections:

- **Anti-malware software**: Real-time protection against viruses and malware
- **Behavior monitoring**: Watch for suspicious device activity
- **Full disk encryption**: Encrypt all data on the device
- **Remote wipe**: Ability to erase lost or stolen devices

### Network Architecture

#### Micro-Segmentation

Instead of one big network, create small isolated segments:

- **Separate by application**: Each app gets its own network segment
- **Block by default**: Don't allow traffic unless specifically permitted
- **Monitor internal traffic**: Watch data moving between systems
- **Use encrypted communications**: All communication between systems must be encrypted

#### Network Controls

Implement these network protections:

- **DNS filtering**: Block access to malicious websites
- **Web filtering**: Control what websites users can visit
- **Limit remote access**: Prefer access to specific resources over broad network access. During migration, restrict and monitor any VPN access that remains necessary; a VPN connection alone must not authorize access to other resources.
- **Monitor traffic**: Analyze all network connections

### Application and Data Protection

#### Securing Applications

Protect your applications with these controls:

- **Identity-aware proxy**: Check user identity before allowing app access
- **Web Application Firewalls (WAFs)**: Use request filtering as defense in depth for common attack patterns, such as those covered by [OWASP CRS](https://devguide.owasp.org/en/09-operations/04-crs/). A WAF does not replace application authorization or business-rule enforcement; enforce [access control in trusted server-side code](https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/#how-to-prevent).
- **API security gateways**: Authenticate every API call, validate request schemas, and enforce rate limits for microservices communication using [REST security best practices](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- **Secure development**: Build security into your development process

#### Protecting Data

Keep your data safe with these methods:

- **Classify data**: Label data by sensitivity level
- **Use encryption**: Protect data whether it's stored or moving with proper [cryptographic storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- **Prevent data loss**: Monitor and block unauthorized data transfers
- **Log all access**: Record who accesses what data and when

### Monitoring and Analytics

#### Security Operations

Set up these monitoring capabilities:

- **SIEM integration**: Collect and analyze logs from all systems
- **Threat hunting**: Actively look for signs of attack
- **Automated response**: Automatically block suspicious activity
- **Behavior analysis**: Learn normal patterns and detect anomalies

#### Key Metrics to Track

Monitor these important numbers:

- How often authentication succeeds vs. fails
- Number of security policy violations
- How quickly you detect threats (MTTD)
- How quickly you respond to incidents (MTTR)

### Implementation Steps

Plan migration around your resources, risks, and dependencies. [NIST SP 800-207, Section 7](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-207.pdf) recommends incremental migration and allows existing and Zero Trust workflows to coexist. The phases below are illustrative activities, not a fixed schedule.

#### Phase 1: Get the Basics Right

Before you invest in new Zero Trust technologies, you need to know what you're protecting:

**Figure out what you have** - Make a list of all users, devices, applications, and how data moves around. This sounds easy but takes longer than you think. You'll find forgotten systems, shadow IT, and connections nobody documented.

**Set up strong MFA everywhere** - Use phishing-resistant MFA as described in [Multi-Factor Authentication](#multi-factor-authentication-mfa), rather than treating a biometric match alone as MFA. Plan for user training since this changes how people log in.

**Narrow remote access** - Move suitable workflows to application-specific access, such as Zero Trust Network Access (ZTNA). Test authentication and resource authorization before retiring existing access paths. Restrict and monitor legacy VPN paths during the transition rather than treating network admission as authorization.

**Control admin access** - Set up privileged access management (PAM) for administrative accounts. Remove permanent admin rights and switch to temporary access. This may slow some processes initially.

#### Phase 2: Add Zero Trust Controls

Now you start building actual Zero Trust capabilities:

**Break up your network** - Split your flat network into smaller, separate segments. Start with your most important applications. This is technically hard and network teams might not like the extra work.

**Monitor devices constantly** - Set up systems that continuously check device health, updates, and security. Devices that aren't secure automatically lose access or get limited access. This creates pressure for people to keep their devices updated.

**Secure applications properly** - Enforce identity-aware access at application entry points and [resource-level authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#validate-the-permissions-on-every-request) within the application. WAF filtering complements these checks; it does not establish the user's right to access an object or perform a business action.

#### Phase 3: Advanced Capabilities

Build advanced capabilities:

**Add behavior monitoring** - Use systems that learn how users and devices normally act. When behavior looks weird, the system can automatically change access or ask for more verification. This needs machine learning and lots of data.

**Automate responses** - Build tools that can automatically isolate compromised accounts, quarantine suspicious devices, and update security policies based on new threats. The goal is to respond faster than humans can.

**Use your data** - Take all the security data you're collecting and use it to improve your policies. This phase is about fine-tuning rather than building new stuff.

#### Phase 4: Keep Getting Better (Ongoing)

Zero Trust is never done:

**Stay current** - Update threat intelligence, adjust risk scoring, and change policies based on new attack methods. What worked last year might not work now.

**Plan ahead** - Start thinking about post-quantum cryptography, new authentication methods, and AI-powered security tools.

**Measure what matters** - Track how fast you detect threats, how fast you respond, how many policy violations happen, and whether users are happy. Use this data to keep improving.

Use the [CISA Zero Trust Maturity Model v2.0](https://www.cisa.gov/sites/default/files/2023-04/zero_trust_maturity_model_v2_508.pdf) to assess progress across identity, devices, networks, applications and workloads, and data. Its Traditional, Initial, Advanced, and Optimal stages describe capabilities, not calendar deadlines; pillars may progress at different rates.

### Legacy System Challenges

#### Common Problems

Legacy systems present some of the biggest challenges in Zero Trust implementations, and they're often where attackers focus their efforts because these systems are harder to secure.

**Weak authentication** is probably the most common issue. Many older systems only support basic username/password authentication with no option for multi-factor authentication. Some were built when passwords were considered sufficient, and adding modern authentication requires significant modification or replacement. This creates a security gap where your most sensitive systems often have the weakest authentication.

**Network dependencies** are another major problem. Older systems were designed for flat, trusted networks where everything inside the perimeter was considered safe. These systems often require direct network access between components and can't work properly when you implement micro-segmentation. They expect to communicate freely with other systems without going through identity checks.

**No encryption** is unfortunately common in legacy environments. Many older systems send data in plain text because they were designed for internal networks that were considered secure. Adding encryption often requires significant changes to both the systems and the network infrastructure they depend on.

**Limited logging** makes it hard to monitor legacy systems for security threats. Older systems often don't provide the detailed security logs you need for modern threat detection and compliance requirements. You can't manage what you can't measure, and poor logging leaves blind spots in your security monitoring.

#### Solutions That Work

You can protect legacy systems without completely replacing them, though it requires creative approaches:

**Security proxies and wrappers** let you add modern authentication and security controls in front of systems that can't support them natively. The proxy handles strong authentication, multi-factor verification, session management, and other Zero Trust verification, then passes authenticated requests to the legacy system using whatever method it understands. This might include identity-aware proxies, application firewalls, or API gateways. This approach works particularly well for web-based legacy applications.

**Network isolation** puts legacy systems in separate, heavily monitored network zones with very restricted access. You can't apply Zero Trust principles directly to these systems, but you can control how they communicate with everything else. Monitor all traffic to and from these zones and require modern authentication for any access to the zone itself.

**Protocol translation** helps when you have systems that use old authentication methods but can't be modified. Translation gateways can convert modern authentication tokens (like SAML or OAuth) to whatever format the legacy system expects (like Kerberos or basic auth), bridging the gap between old and new security approaches.

**Enhanced monitoring** becomes critical for systems that can't log properly on their own. Use network-based detection tools to monitor traffic patterns, connection attempts, and data flows for systems that don't provide detailed security logs. This won't give you the same visibility as modern applications, but it's better than having no monitoring at all.

### Cloud Security

#### Multi-Cloud Considerations

When using multiple cloud providers:

- **Connect identities**: Use the same login across all clouds
- **Secure connections**: Encrypt communication between cloud environments
- **Consistent policies**: Apply the same security rules everywhere
- **Centralized monitoring**: See security events from all clouds in one place

#### Container Security

For containerized applications:

- **Service mesh**: Automatically handle identity and encryption between containers
- **Network policies**: Control which containers can talk to each other
- **Scan images**: Check container images for vulnerabilities
- **Runtime protection**: Monitor container behavior for threats

### Common Mistakes to Avoid

#### Technical Mistakes

**Relying only on network security** - Many organizations think they can just add network controls and call it Zero Trust. But Zero Trust is fundamentally about identity-based security, not network security. If you're still thinking in terms of "inside" and "outside" the network, you're missing the point. Focus on verifying identity and device health for every access request, regardless of where it comes from.

**Not monitoring enough** - Zero Trust generates massive amounts of security data, and some organizations get overwhelmed and don't use it effectively. You need comprehensive logging and analysis capabilities, not just basic monitoring. Without proper visibility, you can't detect threats, tune policies, or prove compliance. Invest in SIEM tools and security analytics platforms that can handle the data volume, following [comprehensive logging practices](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).

**Making security too hard for users** - If your Zero Trust implementation makes it painful for people to do their jobs, they'll find workarounds that bypass your security. The key is balancing security with user experience. Use risk-based authentication so low-risk activities are seamless, and only add friction when the risk level justifies it. Test your policies with real users before rolling them out.

**Forgetting about legacy systems** - Many Zero Trust projects focus on new, cloud-native applications and ignore older systems that can't support modern authentication. These legacy systems often contain your most sensitive data and become the weakest links in your security chain. You need a strategy for protecting systems that can't be easily upgraded.

#### Organizational Mistakes

**No executive support** - Zero Trust implementation requires significant changes to how people work, substantial budget for new tools, and coordination across multiple teams. Without strong leadership commitment and budget approval, your project will stall when it encounters resistance or resource constraints. Get executive sponsorship before you start, not after you run into problems.

**Skipping user training** - Zero Trust changes how people authenticate, access applications, and handle security alerts. If you don't invest in educating your staff about why these changes are necessary and how to work with them, you'll face constant resistance and support tickets. Plan for comprehensive training programs, not just email announcements.

**Skipping migration validation** - Pilot changes on selected workflows, verify that legitimate access still works, and monitor policy decisions before expanding deployment. Choose the next workflow based on risk and dependencies, as described in [NIST SP 800-207, Section 7.3](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-207.pdf).

**Vendor lock-in** - Zero Trust involves many different technologies, and some vendors will try to sell you a complete "Zero Trust platform" that locks you into their ecosystem. Keep your options open by choosing solutions that support open standards and can integrate with multiple vendors. Your security architecture should be flexible enough to adapt as threats and technologies evolve.

### Compliance Benefits

Zero Trust architecture helps organizations meet various compliance requirements:

#### Framework Mapping

| Compliance Standard | Zero Trust Controls That Help |
|-------------------|------------------------------|
| **SOC 2** | Strong access controls, continuous monitoring, audit logging |
| **ISO 27001** | Risk-based access decisions, information security management |
| **PCI DSS** | Network segmentation, encrypted communications, access monitoring |
| **HIPAA** | Granular access controls, data encryption, audit trails |
| **GDPR** | Privacy-by-design, data access logging, breach detection |
| **OMB M-22-09** | Phishing-resistant MFA, device certificates, encrypted DNS |

### Technology Components

Zero Trust requires several technology categories working together:

- **Identity and Access Management**: Strong authentication (MFA) and risk-based access decisions
- **Zero Trust Network Access (ZTNA)**: Resource-specific access controls, with restricted legacy access paths during migration
- **Web Application Security**: Protect applications and APIs from OWASP Top 10 attacks
- **Security Monitoring**: Real-time visibility and automated response to threats

#### Policy-as-Code + Continuous Verification + Telemetry Signals

The following are implementation options for cloud-native workloads, not universal Zero Trust requirements. [NIST SP 800-207, Section 2.1](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-207.pdf) defines technology-agnostic principles. For implementation guidance, see [Kubernetes policy management](https://cheatsheetseries.owasp.org/cheatsheets/Kubernetes_Security_Cheat_Sheet.html#implementing-centralized-policy-management) and [CI/CD Security](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html).

##### 1. Policy-as-Code (PaC)

Policy-as-code can make supported policy changes version-controlled, testable, and auditable. Choose enforcement mechanisms that fit the resources and workflows being protected.

**Key principles:**

- Version-controlled policies
- Tested within CI/CD pipelines
- Automatically enforced at deployment
- Traceable via audit logs

**Recommended tools:**

- Open Policy Agent (OPA) / Gatekeeper
- Kyverno
- Cilium Network Policies
- Cloud provider policy engines (AWS SCP, Azure Policy, GCP Org Policy)

**Use cases:**

- Admission control
- Workload security (privileges, capabilities, runtime profiles)
- Network segmentation (L3–L7)
- Image and artifact security
- RBAC enforcement

##### 2. Continuous Verification

Automated deployment and configuration checks can help enforce workload security policies. They complement the resource-access authentication and authorization described above.

**Verification examples:**

- Workload identity verification (SPIFFE/SPIRE, IAM)
- Image signature validation (cosign / sigstore)
- Security quality gates (SAST, IaC scanning, image scanning)
- RBAC drift detection
- Network policy drift detection
- Automated enforcement at admission

Admission checks can reject deployments that violate configured policies; they do not replace runtime resource authorization.

##### 3. Telemetry Signals

Zero Trust decisions rely on **telemetry signals** collected continuously across all layers.

**Suggested signals to collect:**

- **Identity telemetry:** user + service + workload identity correlation
- **Network telemetry:** anomalous east-west traffic, failed login attempts
- **Runtime telemetry:** syscall anomalies, unauthorized execs, file system changes
- **Deployment telemetry:** manifest change anomalies, signature mismatches
- **Vulnerability telemetry:** CVSS, exploitability, runtime reachability

**Recommended tools:**

- Cilium Hubble
- Falco or Tetragon (eBPF-based runtime signals)
- OpenTelemetry (OTel)
- Istio / Linkerd telemetry

##### 4. Zero Trust Security Loop

1. **Policy-as-Code** → Policies are defined in code repositories and tested.
2. **Continuous Verification** → Every change and deployment is validated against policies.
3. **Telemetry Signals** → Runtime signals provide continuous monitoring.
4. **Feedback Loop** → Collected signals are used to refine policies.

Use this feedback loop to improve the selected controls without treating a particular tool or deployment pipeline as proof of Zero Trust.
