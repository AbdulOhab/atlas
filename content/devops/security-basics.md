---
title: "Security Basics"
order: 14
summary: "Security is not a feature — it's a property of the entire system."
category: "Mastery"
level: Intermediate
---

# Module 13: Security Basics

> *"Security is not a feature — it's a property of the entire system." — DevSecOps Principle*

---

>**Command reference**: [`cheatsheet.md`](./cheatsheet.md) — every command in this module, grouped by task, with the gotchas.
>
>**Cross-module lookup**: [Quick Reference](../QUICK-REFERENCE.md)

---

## Why This Module Matters

A single misconfigured S3 bucket, a leaked secret in git, or an unpatched container image can end careers and companies. Security in DevOps is **not a bolt-on** — it's embedded in every tool and workflow you've learned so far. This module consolidates security practices across the entire stack.

**In real-world DevOps work**, you will:

- Manage secrets securely across CI/CD, containers, and cloud
- Harden Linux servers and SSH configurations
- Scan container images for vulnerabilities
- Implement RBAC in Kubernetes and cloud platforms
- Integrate security scanning into CI/CD pipelines (DevSecOps)
- Respond to security incidents methodically

---

## Table of Contents

1. [DevSecOps — Security as Culture](#1-devsecops--security-as-culture)
2. [Secrets Management](#2-secrets-management)
3. [Linux Security Hardening](#3-linux-security-hardening)
4. [Container Security](#4-container-security)
5. [CI/CD Pipeline Security](#5-cicd-pipeline-security)
6. [Cloud Security (IAM & Network)](#6-cloud-security-iam--network)
7. [Kubernetes Security](#7-kubernetes-security)
8. [Vulnerability Management](#8-vulnerability-management)
9. [Common Mistakes and Anti-Patterns](#9-common-mistakes-and-anti-patterns)
10. [Incident Response](#10-incident-response)
11. [Interview Insights](#11-interview-insights)

---

## 1. DevSecOps — Security as Culture

### Shift Left

```
TRADITIONAL:
  Code → Build → Test → Deploy → THEN security review
  Security finds issues after everything is built → expensive to fix

SHIFT LEFT (DevSecOps):
  Code (lint+SAST) → Build (image scan) → Test (DAST) → Deploy (runtime)
  Security at EVERY stage → issues caught early → cheap to fix

┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐
│ Code │──▶│Build │──▶│ Test │──▶│Stage │──▶│ Prod │
│ SAST │   │Image │   │ DAST │   │Scan  │   │WAF   │
│ Lint │   │ Scan │   │Pentest│  │Audit │   │SIEM  │
└──────┘   └──────┘   └──────┘   └──────┘   └──────┘
   ▲ Security integrated at every stage
```

### Security Scanning Types

```
SAST — Static Application Security Testing
  Scans SOURCE CODE for vulnerabilities (before running)
  Tools: SonarQube, Semgrep, Bandit (Python), ESLint security

DAST — Dynamic Application Security Testing
  Scans the RUNNING APPLICATION for vulnerabilities
  Tools: OWASP ZAP, Burp Suite, Nikto

SCA — Software Composition Analysis
  Scans DEPENDENCIES for known vulnerabilities (CVEs)
  Tools: Snyk, Dependabot, Trivy, OWASP Dependency-Check

IaC Scanning
  Scans TERRAFORM/K8S configs for misconfigurations
  Tools: Checkov, tfsec, Kube-bench
```

---

## 2. Secrets Management

### The Golden Rules

```
1. NEVER commit secrets to git (even in private repos)
2. NEVER hardcode secrets in code, Dockerfiles, or configs
3. NEVER pass secrets as command-line arguments (visible in ps)
4. NEVER log secrets (even accidentally in debug mode)
5. ALWAYS rotate secrets regularly
6. ALWAYS use the platform's secret store
7. ALWAYS encrypt secrets at rest and in transit
```

### How a Secret Should Reach a Process

Every rule above is really one rule: the secret should exist in exactly two places — the store, and the memory of the process that needs it. Compare the paths:

```mermaid
flowchart TB
    subgraph Bad[" The four ways it leaks"]
        direction TB
        B1["Hardcoded in source"] --> G[("Git history<br/><i>forever, even after you delete it</i>")]
        B2["Baked into an image layer"] --> Reg[("Registry<br/><i>anyone who can pull, can read</i>")]
        B3["Passed as a CLI argument"] --> PS["Visible in ps,<br/>and in shell history"]
        B4["Printed in a debug log"] --> Logs[("Your log backend,<br/>indexed and searchable")]
    end

    subgraph Good[" The path that doesn't"]
        direction LR
        Store[("Secret store<br/>Vault, Secrets Manager, SSM")] -->|"authenticated by<br/><b>identity</b>, not a password:<br/>IAM role, OIDC, k8s SA"| Inject["Injected at start-up:<br/>env var or tmpfs file"]
        Inject --> Proc["Process memory"]
        Proc -.->|"short TTL forces<br/>re-fetch, so rotation<br/>actually takes effect"| Store
    end

    style G fill:#ffe8e8,stroke:#cc3333
    style Reg fill:#ffe8e8,stroke:#cc3333
    style PS fill:#ffe8e8,stroke:#cc3333
    style Logs fill:#ffe8e8,stroke:#cc3333
    style Store fill:#e8ffe8,stroke:#00aa44
```

 **The bootstrap question is the one that separates real secret management from theatre**: how does the process authenticate to the *store*? If the answer is "another secret in an env var", you have moved the problem, not solved it. The real answers are all forms of platform identity — an EC2 instance profile or EKS IRSA, a GitHub Actions OIDC token traded for a short-lived role, a Kubernetes ServiceAccount token — none of which is a value anyone can copy out and reuse.

 **A leaked secret is leaked the moment it is pushed, not when someone notices.** Rewriting history with `git filter-repo` or BFG does not un-clone the repo, and public-repo scrapers are measured in seconds. The order is always: **rotate first, clean history second** — and if you only have time for one, rotate.

### Where to Store Secrets

| Context | Tool | How |
|---------|------|-----|
| **Git/CI** | GitHub Secrets | Settings → Secrets → Actions |
| **Docker** | Docker Secrets / env files | NOT in Dockerfile |
| **Kubernetes** | K8s Secrets + External Secrets Operator | Synced from Vault |
| **Cloud** | AWS Secrets Manager / SSM Parameter Store | IAM-controlled access |
| **Central** | HashiCorp Vault | API-based, dynamic secrets, audit log |
| **Ansible** | Ansible Vault | Encrypted variable files |
| **Terraform** | Never in .tf files | Use data sources to fetch from SSM/Vault |

### Preventing Secret Leaks in Git

```bash
# .gitignore — always include these
*.env
.env.*
*.pem
*.key
*secret*
terraform.tfstate*
.terraform/

# Pre-commit hook to scan for secrets
# Install: pip install pre-commit
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']

  - repo: https://github.com/zricethezav/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
```

### What If a Secret Is Leaked?

```
SECRET LEAKED TO GIT?
│
├─ 1. ROTATE IMMEDIATELY — generate new credentials
│     └─ The old secret is compromised forever (git history)
│
├─ 2. REVOKE the old secret in the provider
│     └─ AWS: deactivate access key, GitHub: revoke token
│
├─ 3. SCAN for unauthorized usage
│     └─ CloudTrail logs, API access logs
│
├─ 4. REMOVE from git history
│     └─ git filter-branch or BFG Repo-Cleaner
│     └─  This is a force-push — coordinate with team
│
└─ 5. ADD prevention
      └─ Pre-commit hooks, CI secret scanning
```

---

## 3. Linux Security Hardening

### SSH Hardening

```bash
# /etc/ssh/sshd_config — Critical settings
PermitRootLogin no               # Never SSH as root
PasswordAuthentication no         # Keys only, no passwords
PubkeyAuthentication yes
MaxAuthTries 3                    # Lock after 3 failed attempts
AllowUsers deployer admin         # Whitelist specific users
Protocol 2                       # Only SSH v2
ClientAliveInterval 300           # Timeout idle connections
ClientAliveCountMax 2

# After changes:
sudo systemctl restart sshd
```

### User and Permission Management

```bash
# Principle of least privilege
sudo useradd -m -s /bin/bash deployer
sudo usermod -aG sudo deployer         # Only if needed

# Restrict sudo
# /etc/sudoers.d/deployer
deployer ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
# Can ONLY restart nginx with sudo — nothing else

# File permissions
chmod 700 ~/.ssh                       # Owner only
chmod 600 ~/.ssh/authorized_keys       # Owner only
chmod 644 ~/.ssh/id_rsa.pub           # Public key — readable
chmod 600 ~/.ssh/id_rsa               # Private key — OWNER ONLY
```

### Firewall Basics

```bash
# Debian/Ubuntu with UFW
sudo ufw default deny incoming         # Block all incoming
sudo ufw default allow outgoing        # Allow all outgoing
sudo ufw allow 22/tcp                  # Allow SSH
sudo ufw allow 80/tcp                  # Allow HTTP
sudo ufw allow 443/tcp                # Allow HTTPS
sudo ufw enable

# Check status
sudo ufw status verbose

# RHEL-compatible with firewalld
sudo systemctl enable --now firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
sudo firewall-cmd --list-all

# iptables equivalent
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -P INPUT DROP
```

### System Updates

```bash
# Debian/Ubuntu: enable unattended security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Debian/Ubuntu: manual update
sudo apt update && sudo apt upgrade -y

# RHEL-compatible: enable automatic updates
sudo dnf install -y dnf-automatic
sudo systemctl enable --now dnf-automatic.timer

# RHEL-compatible: manual update
sudo dnf upgrade -y

# Check for known vulnerabilities
sudo apt install lynis
sudo dnf install -y lynis
sudo lynis audit system
```

---

## 4. Container Security

### Dockerfile Best Practices

```dockerfile
# BAD: Running as root, fat image, secrets baked in
FROM ubuntu:latest
RUN apt-get update && apt-get install -y python3 curl wget vim
COPY . /app
ENV API_KEY=sk-secret-12345
CMD ["python3", "/app/app.py"]

# GOOD: Non-root, minimal image, no secrets, pinned version
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY src/ ./src/
RUN useradd -r -s /sbin/nologin appuser
USER appuser
EXPOSE 8080
CMD ["python3", "-m", "src.app"]
```

### Container Security Checklist

```
 Use minimal base images (alpine, slim, distroless)
 Pin image versions (python:3.12-slim, NOT python:latest)
 Run as non-root user (USER appuser)
 Use multi-stage builds (smaller attack surface)
 Don't install unnecessary packages (no vim, curl in prod)
 Scan images for CVEs (Trivy, Snyk, Docker Scout)
 Use read-only filesystem where possible
 Don't store secrets in images
 Sign images (Docker Content Trust, cosign)
```

### Image Scanning with Trivy

```bash
# Install Trivy
sudo apt install trivy       # Debian/Ubuntu, if available in configured repos
sudo dnf install -y trivy    # RHEL-compatible, if available in configured repos
# or: brew install trivy

# Scan an image
trivy image nginx:1.25
trivy image myapp:latest

# Scan with severity filter
trivy image --severity HIGH,CRITICAL myapp:latest

# Scan in CI pipeline (fail on critical)
trivy image --exit-code 1 --severity CRITICAL myapp:latest

# Scan a Dockerfile
trivy config Dockerfile

# Scan Kubernetes manifests
trivy config k8s/

# Scan Terraform files
trivy config terraform/
```

---

## 5. CI/CD Pipeline Security

### The Pipeline Is the Attack Surface

Your CI system can write to production, so it is a more valuable target than production itself. There are five ways in, and each has one control that closes it:

```mermaid
flowchart LR
    subgraph Sources["Where an attacker gets in"]
        direction TB
        A1["① A dependency<br/>typosquat, hijacked maintainer"]
        A2["② A base image<br/>unpinned, or upstream compromise"]
        A3["③ A pull request<br/>malicious workflow edit"]
        A4["④ A third-party Action<br/>mutable @v1 tag"]
        A5["⑤ Stolen CI credentials<br/>long-lived cloud keys"]
    end

    A1 & A2 & A3 & A4 & A5 --> Build["Build runner<br/><i>holds the deploy credentials</i>"]
    Build --> Art["Artifact / image"]
    Art --> Reg[("Registry")]
    Reg --> Prod["Production"]

    style Build fill:#ffe8e8,stroke:#cc3333
    style Prod fill:#fff4e0,stroke:#cc8800
```

| Way in | The control that closes it |
|--------|----------------------------|
| ① Dependency | A lockfile, `npm ci` / `pip install -r` with hashes, plus SCA scanning on every PR |
| ② Base image | Pin by **digest**, not tag; rebuild on a schedule so pinning doesn't mean stale |
| ③ Pull request | `pull_request` (not `pull_request_target`) for untrusted forks, and no secrets exposed to fork runs |
| ④ Third-party Action | Pin to a full commit SHA — a tag is mutable and can be re-pointed at anything |
| ⑤ CI credentials | OIDC federation instead of stored keys, scoped to one role, one repo, one branch |

 **`permissions:` at the top of every workflow is the cheapest control on this page.** The default token is broad; declaring `contents: read` and adding back only what a job needs means a compromised step cannot push code, tag a release, or open a PR. It is two lines and it turns a full repo takeover into a failed API call.

 **`pull_request_target` runs with write permissions and the repository's secrets, against code the contributor controls.** It exists for labelling bots, and it is the single most exploited GitHub Actions misconfiguration. If you use it, never check out the PR's head, and never run its build scripts.

### Secure Pipeline Pattern

```yaml
# .github/workflows/secure-ci.yml
name: Secure CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read                    # Minimal permissions!
  security-events: write

jobs:
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0            # Full history for secret scanning
      - name: Scan for secrets
        uses: gitleaks/gitleaks-action@v2

  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: p/security-audit

  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy on dependencies
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'HIGH,CRITICAL'

  image-scan:
    runs-on: ubuntu-latest
    needs: [secret-scan, sast]
    steps:
      - uses: actions/checkout@v4
      - name: Build image
        run: docker build -t myapp:${{ github.sha }} .
      - name: Scan image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'myapp:${{ github.sha }}'
          severity: 'HIGH,CRITICAL'
          exit-code: '1'            # Fail pipeline on critical CVE
```

### CI/CD Security Checklist

```
 Pin action versions (SHA, not @main)
 Use minimal permissions (permissions: contents: read)
 Scan for secrets in every PR
 Scan dependencies for CVEs
 Scan container images before pushing
 Use OIDC for cloud authentication (not static keys)
 Require branch protection (CI must pass before merge)
 Sign artifacts (images, binaries)
```

---

## 6. Cloud Security (IAM & Network)

### IAM Security Summary

```
PRINCIPLE OF LEAST PRIVILEGE:
  ┌────────────────────────────────────────────┐
  │ "Grant the minimum access needed to do     │
  │  the job. Nothing more."                   │
  │                                            │
  │  Admin access for developers             │
  │  Wildcard (*) permissions                │
  │  Long-lived access keys                  │
  │                                            │
  │  Specific actions on specific resources  │
  │  IAM roles for services (not keys)       │
  │  MFA on all human accounts               │
  │  Regular access reviews                  │
  └────────────────────────────────────────────┘
```

### Network Security Layers

```
                    Internet
                       │
                 ┌─────▼─────┐
                 │    WAF     │  Layer 7 (application firewall)
                 └─────┬─────┘
                 ┌─────▼─────┐
                 │   NACLs   │  Subnet-level firewall (stateless)
                 └─────┬─────┘
                 ┌─────▼─────┐
                 │  Security  │  Instance-level firewall (stateful)
                 │   Groups   │
                 └─────┬─────┘
                 ┌─────▼─────┐
                 │   App     │  Your application
                 └───────────┘

DEFENSE IN DEPTH — multiple layers, each with its own rules
```

---

## 7. Kubernetes Security

### Pod Security

```yaml
# Secure pod configuration
apiVersion: v1
kind: Pod
metadata:
  name: secure-app
spec:
  securityContext:
    runAsNonRoot: true              # Container must run as non-root
    runAsUser: 1000
    fsGroup: 2000
  containers:
    - name: app
      image: myapp:v1.2.3
      securityContext:
        allowPrivilegeEscalation: false  # Can't become root
        readOnlyRootFilesystem: true     # Filesystem is read-only
        capabilities:
          drop:
            - ALL                        # Drop all Linux capabilities
      resources:
        limits:
          memory: "256Mi"
          cpu: "500m"
```

### RBAC — Role-Based Access Control

```yaml
# Role: what permissions
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: app-deployer
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "update", "patch"]
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list"]
---
# RoleBinding: who gets the permissions
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  namespace: production
  name: deploy-binding
subjects:
  - kind: User
    name: deploy-bot
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: app-deployer
  apiGroup: rbac.authorization.k8s.io
```

### Network Policies

```yaml
# Only allow traffic from the frontend to the API
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-frontend
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 8080
```

---

## 8. Vulnerability Management

### CVE Lifecycle

```
CVE DISCLOSED → ASSESS IMPACT → PATCH → VERIFY → MONITOR

For each CVE:
1. Is it in our stack? (image scan, dependency scan)
2. Is it exploitable in our context?
3. What's the severity? (Critical → patch now, Low → next cycle)
4. Patch and redeploy
5. Verify the fix
```

### Vulnerability Scanning Pipeline

```
CODE         → SAST (Semgrep, SonarQube)
DEPENDENCIES → SCA (Snyk, Dependabot, Trivy fs)
DOCKER IMAGE → Image scan (Trivy, Docker Scout)
IaC FILES    → Config scan (Checkov, tfsec)
K8S CLUSTER  → Runtime scan (Kube-bench, Falco)
```

---

## 9. Common Mistakes and Anti-Patterns

### Security as an Afterthought

```
BAD:  Build everything → then "add security" before launch
GOOD: Security at every stage — code review, CI scanning, runtime monitoring
```

### Over-Permissive IAM

```json
// BAD: God mode — can do anything to everything
{ "Effect": "Allow", "Action": "*", "Resource": "*" }

// GOOD: Specific actions on specific resources
{ "Effect": "Allow", "Action": ["s3:GetObject"], "Resource": ["arn:aws:s3:::my-bucket/*"] }
```

### Running as Root

```
BAD:  Containers running as root → one exploit = full control
GOOD: USER appuser in Dockerfile, runAsNonRoot in K8s
```

### Ignoring Dependency Updates

```
BAD:  "It works, don't touch it" → 2-year-old dependencies with 50 CVEs
GOOD: Dependabot/Renovate auto-PRs, regular update cycles
```

---

## 10. Incident Response

### When Something Goes Wrong

```
INCIDENT DETECTED!
│
├─ 1. CONTAIN — Stop the bleeding
│     ├─ Revoke compromised credentials
│     ├─ Isolate affected systems (security group)
│     └─ Block malicious IPs (WAF/firewall)
│
├─ 2. ASSESS — Understand the scope
│     ├─ What was accessed? (CloudTrail, access logs)
│     ├─ What data was exposed? (PII, credentials?)
│     └─ How did they get in? (vulnerability, credential leak?)
│
├─ 3. REMEDIATE — Fix the root cause
│     ├─ Patch the vulnerability
│     ├─ Rotate ALL potentially compromised secrets
│     └─ Update affected systems
│
├─ 4. RECOVER — Return to normal
│     ├─ Restore from clean backups if needed
│     ├─ Verify systems are clean
│     └─ Re-enable access
│
└─ 5. LEARN — Prevent recurrence
      ├─ Post-incident review (blameless!)
      ├─ Update security controls
      └─ Share learnings with the team
```

### The First Ten Minutes: A Credential Is Exposed

The most common security incident a DevOps engineer runs, and the order of operations is counterintuitive enough to be worth memorising:

```mermaid
flowchart TD
    S(["A key, token or password<br/>is found somewhere public"]) --> Scope{"Can it reach<br/>production data?"}

    Scope -->|"Unsure"| Assume["<b>Assume yes.</b> Time spent deciding<br/>is time the credential is still valid"]
    Scope -->|"Yes"| Rotate
    Assume --> Rotate

    Scope -->|"No — dev only,<br/>and you are certain"| RotateLater["Rotate anyway, on a normal<br/>working schedule"]

    Rotate["<b>1 · REVOKE, don't just rotate.</b><br/>Issuing a new key leaves the old one live.<br/>Delete/disable the old credential first"] --> Preserve["<b>2 · Preserve evidence before you clean up.</b><br/>Snapshot logs, CloudTrail, the instance —<br/>rebuilding first destroys the answer to<br/>'what did they do with it?'"]

    Preserve --> Blast["<b>3 · Scope the blast radius.</b><br/>What did that identity touch?<br/>CloudTrail by access key, audit logs by user"]

    Blast --> Used{"Any sign it<br/>was used?"}
    Used -->|"Yes"| IR["Full incident: unknown IPs, unusual regions,<br/>new IAM users or keys created, data egress.<br/>Escalate — this is no longer just a leak"]
    Used -->|"No"| Clean["Clean-up: purge from history,<br/>add the detection that should have caught it"]

    IR --> Learn
    Clean --> Learn
    RotateLater --> Learn
    Learn["<b>4 · Blameless review.</b> Why was it possible to<br/>commit it? Why did nothing catch it?<br/>Add the guardrail, not a rule asking people to be careful"]

    style Rotate fill:#ffe8e8,stroke:#cc3333
    style Preserve fill:#fff4e0,stroke:#cc8800
    style IR fill:#ffe8e8,stroke:#cc3333
    style Learn fill:#e8ffe8,stroke:#00aa44
```

 **Two instincts to override.** First, *revoke rather than rotate* — creating a replacement key feels like fixing it, but the leaked one keeps working until you explicitly kill it. Second, *don't terminate the compromised instance yet* — the reflex to destroy and rebuild is exactly what erases the evidence you need to answer "what did they reach?", and that question is the one your customers and your regulator will ask.

 **"It was only a dev key" needs proof, not assumption.** Dev credentials with production network access, a shared account, or a role that can assume another are how a minor leak becomes a breach. Check what the identity can *reach*, not what it was *intended* for.

---

## 11. Interview Insights

**Q: What is DevSecOps and what does "shift left" mean?**
> DevSecOps integrates security into every stage of the DevOps pipeline instead of treating it as a separate phase. "Shift left" means moving security earlier — scanning code for vulnerabilities during development and CI, not after deployment. This catches issues when they're cheapest to fix.

**Q: How do you manage secrets in a DevOps environment?**
> Never in code or git. Use platform-specific secret stores: GitHub Secrets for CI, AWS Secrets Manager or SSM for cloud, Kubernetes Secrets with external operators for K8s, and HashiCorp Vault for centralized management. Use pre-commit hooks (gitleaks) to prevent accidental commits. Rotate secrets regularly.

**Q: What would you do if you found a secret committed to a public repo?**
> Immediately rotate/revoke the secret — it's compromised. Check access logs (CloudTrail) for unauthorized usage. Remove from git history using BFG Repo-Cleaner. Add pre-commit hooks to prevent recurrence. Notify the team and document the incident.

**Q: How do you secure container images?**
> Use minimal base images (slim/distroless), run as non-root user, pin image versions, use multi-stage builds, scan with Trivy in CI (fail on critical CVEs), sign images, and don't store secrets in images. Enable read-only root filesystem in Kubernetes.

**Q: Explain the principle of least privilege with an example.**
> Grant only the minimum permissions needed. Example: An EC2 instance running a web app needs to read from one S3 bucket and write to CloudWatch. Its IAM role should allow only `s3:GetObject` on that specific bucket and `logs:PutLogEvents` — nothing else. If compromised, the blast radius is limited to those specific resources.

**Q: How do you implement RBAC in Kubernetes?**
> Create Roles defining permissions (which API resources, which verbs) and RoleBindings connecting users/service accounts to roles. Use namespaces to isolate teams. Follow least privilege — developers get read-only in production, deploy bots get update access to deployments only. Use ClusterRoles for cluster-wide permissions sparingly.

---

## Labs and Projects

Read the sections above first, then work through these **in order**. Every lab ends with a  **Break It** section — those are not optional; they are where the debugging skill actually comes from.

| # | Lab | What you'll do |
|---|-----|----------------|
| 1 | **[Security Scanning](./labs/lab-01-security-scanning.md)** | Integrate security scanning into your DevOps workflow. |
| 2 | **[Secrets Management](./labs/lab-02-secrets-management.md)** | Stop putting secrets where they can be read. |
| 3 | **[Supply Chain Security](./labs/lab-03-supply-chain-security.md)** | Answer three questions about the software you ship: **what is actually in it**, **did we really build it**, and **can anything else get deployed**. |

**Portfolio project:**

- [Project: Security Scan and Triage Report](./projects/project-01-security-scan-triage.md) — Run security scans against a small application, container image, or infrastructure config.

**Reference code** for every lab: [`code/`](./code/) — real files, validated in CI.

---

## Self-Check

Answer these from memory before you expand them. If more than two give you trouble, re-read the sections they come from — the labs assume this material is solid.

<details>
<summary><strong>1. A credential has leaked into a public place. What is the first action?</strong></summary>

Rotate or revoke it. It is compromised from the moment it was exposed and no amount of history rewriting changes that. Then work out the blast radius from access logs, and only then clean up the artefact. Removing the file is not remediation.

</details>

<details>
<summary><strong>2. How do you actually arrive at a least-privilege policy?</strong></summary>

Start from no permissions, run the workload, and add exactly what it failed on — scoped to specific resources, with short-lived credentials. Starting from a wildcard with a plan to tighten it later produces a permanent wildcard, because nothing ever fails to remind you.

</details>

<details>
<summary><strong>3. Give a concrete example of defense in depth for one workload.</strong></summary>

A compromised container has to get past: a non-root user, a read-only root filesystem, dropped capabilities, a network policy limiting where it can connect, node-level isolation, and an IAM role scoped to one bucket. Each control is individually bypassable — the point is that they are unlikely to all fail at once.

</details>

<details>
<summary><strong>4. Why pin base images by digest rather than tag?</strong></summary>

A tag is a mutable pointer: `:3.19` can mean something different tomorrow, so the image you scanned and tested is not necessarily the one that gets pulled. A digest is immutable content addressing. You then update it deliberately, which is the difference between a rebuild and a surprise.

</details>

<details>
<summary><strong>5. SAST, SCA, secret scanning, DAST — what does each catch?</strong></summary>

SAST reads your source for dangerous patterns. SCA checks your dependencies against known vulnerabilities. Secret scanning looks for credentials in the code and its history. DAST probes the running application from outside. They find genuinely different classes of problem and none substitutes for another.

</details>

<details>
<summary><strong>6. Why is "fail the build on every critical CVE" not automatically the right policy?</strong></summary>

Because most images carry vulnerabilities in packages the application never invokes, and many have no fix available yet. A gate that blocks everything gets switched off within a month. Triage on reachability and fix availability, and record accepted risks explicitly with an owner and an expiry date.

</details>

<details>
<summary><strong>7. What does a mounted service account token give an attacker who lands in your pod?</strong></summary>

API access with that account's RBAC — which, if it is over-permissioned, is the whole cluster. Turn off `automountServiceAccountToken` where it is unused, scope roles narrowly, and enforce Pod Security admission: a privileged pod is not a container escape risk, it is node ownership by design.

</details>

---

## Practical Checkpoint

Before moving on, you should be able to:

- Scan code, dependencies, containers, and infrastructure for common security issues.
- Explain severity, exploitability, and practical remediation instead of only pasting scan output.
- Handle a leaked secret by rotating it, removing exposure, and preventing recurrence.

Portfolio evidence to keep:

- Security scan output with a short triage summary.
- Fix notes for at least one finding.
- A residual-risk note for anything intentionally accepted.

Suggested project: [Security Scan and Triage Report](./projects/project-01-security-scan-triage.md)

---

## What's Next?

With security practices consolidated, you're ready to think at the system level — designing scalable, reliable architectures.

**[Module 14: System Design for DevOps →](../14-system-design-devops/)**

---

<div align="center">

**Module 13 Complete** 

[← Back to Kubernetes](../12-kubernetes/) | [ Cheat Sheet](./cheatsheet.md) | [Next: System Design →](../14-system-design-devops/)

</div>


## Reference
<!-- tab: Cheatsheet -->
> Scanning tools, secret management, hardening commands, and audit one-liners. Concepts live in the [module README](./README.md).
> Cross-module daily commands: **[QUICK-REFERENCE.md](../QUICK-REFERENCE.md)**

**Jump to:** [Scanning](#scanning-toolbox) · [Secrets in git](#secrets-in-git) · [Secret managers](#secret-managers) · [SSH & TLS](#ssh--tls) · [Linux hardening](#linux-hardening) · [Container security](#container-security) · [Kubernetes security](#kubernetes-security) · [Cloud audit](#cloud-audit-one-liners) · [CI/CD security](#cicd-security) · [Vulnerability triage](#vulnerability-triage) · [Incident response](#incident-response)

---

## Scanning Toolbox

| Tool | Scans | Typical use |
|------|-------|-------------|
| **trivy** | Images, filesystems, git repos, IaC, K8s, SBOMs |  The one tool to start with — covers most of the list below |
| **grype** | Images, filesystems | Alternative CVE scanner; good second opinion |
| **syft** | Anything | SBOM generation |
| **gitleaks** | Git history + working tree |  Secret detection |
| **trufflehog** | Git, S3, filesystems | Secret detection **with live verification** |
| **hadolint** | Dockerfiles | Lint + best practices |
| **dockle** | Images | CIS-style image audit |
| **checkov** | Terraform, CFN, K8s, Helm, Dockerfile | Policy-as-code |
| **tfsec** | Terraform | (Now folded into Trivy) |
| **kube-bench** | Kubernetes nodes | CIS Kubernetes Benchmark |
| **kubescape** | Cluster + manifests | NSA/CISA + MITRE frameworks |
| **polaris** | K8s workloads | Best-practice checks |
| **semgrep** | Source code |  SAST with custom rules |
| **bandit** | Python | SAST |
| **npm audit` / `pip-audit` / `cargo audit** | Dependencies | SCA per ecosystem |
| **OWASP ZAP** | Running web apps | DAST |
| **lynis** | Linux hosts | System hardening audit |
| **prowler** / **scoutsuite** | AWS/Azure/GCP | Cloud posture assessment |
| **cosign** | Images | Signing and verification |

```bash
# ─── Trivy: one tool, many targets ───
trivy image myapp:v1
trivy image --severity HIGH,CRITICAL --exit-code 1 myapp:v1      #  CI gate
trivy image --ignore-unfixed myapp:v1                            # only actionable findings
trivy image --scanners vuln,secret,misconfig myapp:v1
trivy fs .                                                       # source tree
trivy fs --scanners secret .                                     # secrets only
trivy config .                                                   #  Terraform/K8s/Dockerfile misconfig
trivy repo https://github.com/org/repo
trivy k8s --report summary cluster                               # live cluster
trivy sbom sbom.json
trivy image --format cyclonedx --output sbom.json myapp:v1
trivy image --format sarif --output trivy.sarif myapp:v1         # upload to GitHub Security

# .trivyignore — accept a risk explicitly, with a reason and a date
cat > .trivyignore <<'EOF'
# CVE-2023-1234: only exploitable via the CLI parser we don't use.
# Accepted by @alice 2026-08-04, re-review 2026-11-04.
CVE-2023-1234
EOF

# ─── Others ───
grype myapp:v1 --fail-on high
syft myapp:v1 -o spdx-json > sbom.json
hadolint Dockerfile
dockle myapp:v1
checkov -d . --framework terraform --compact
semgrep --config=auto .
semgrep --config=p/security-audit --sarif -o semgrep.sarif .
lynis audit system
```

---

## Secrets in Git

```bash
# ─── Detect ───
gitleaks detect --source . --verbose                    #  scans full history
gitleaks detect --source . --report-format sarif --report-path gitleaks.sarif
gitleaks protect --staged                               # pre-commit: staged changes only
trufflehog git file://. --only-verified                 #  confirms the key actually works
trufflehog github --repo=https://github.com/org/repo

# Manual grep for the obvious patterns
git log -p --all | grep -nE 'AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|ghp_[A-Za-z0-9]{36}'
git rev-list --all --objects | git cat-file --batch-check='%(objecttype) %(objectname) %(rest)' \
  | awk '$1=="blob"' | sort -k3 | grep -iE '\.(env|pem|key|p12|pfx)$'
```

```bash
# ─── Prevent ───
pip install pre-commit
cat > .pre-commit-config.yaml <<'YAML'
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks: [{id: gitleaks}]
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: detect-private-key
      - id: detect-aws-credentials
      - id: check-added-large-files
  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.88.0
    hooks: [{id: terraform_fmt}, {id: terraform_tflint}, {id: terrascan}]
YAML
pre-commit install && pre-commit run --all-files
```

### Remediation — the order matters

```
1. ROTATE the credential.   Do this FIRST, before anything else.
   Assume it is compromised the moment it was pushed. Bots scan
   public GitHub within seconds of a commit landing.

2. REVOKE the old value at the provider and check its usage logs
   (CloudTrail, audit log) for anything you didn't do.

3. PURGE it from history — cleanup, not remediation:
      pip install git-filter-repo
      git filter-repo --path secrets.env --invert-paths
      # or replace the literal string everywhere:
      printf 'AKIAIOSFODNN7EXAMPLE==>REDACTED\n' > replacements.txt
      git filter-repo --replace-text replacements.txt

4. FORCE-PUSH and have every collaborator re-clone.
   Ask GitHub Support to purge cached views and fork references.

5. PREVENT recurrence: pre-commit hook + CI scan + push protection.
```

>**Rewriting history does not un-leak a secret.** Forks, clones, CI caches, and GitHub's own cached views may still hold it. Rotation is the only real fix; history rewriting is hygiene.

---

## Secret Managers

| Approach | Good | Bad |
|----------|------|-----|
| Env var from CI secret store | Simple, universal | Visible in `/proc`, process listings, crash dumps |
| Mounted file (tmpfs) | Not in the environment; rotatable | Needs a delivery mechanism |
| Vault / cloud secret manager with **dynamic** credentials |  Short-lived, audited, revocable | Operational complexity |
| Sealed Secrets / SOPS in git | GitOps-friendly, encrypted at rest | Still a long-lived secret, just encrypted |
| Hardcoded in code or image | — | Never. This is the thing we're preventing |

```bash
# ─── HashiCorp Vault ───
export VAULT_ADDR=https://vault.example.com
vault login -method=oidc
vault kv put secret/myapp/prod db_password='s3cr3t' api_key='...'
vault kv get secret/myapp/prod
vault kv get -field=db_password secret/myapp/prod        #  scriptable
vault kv get -format=json secret/myapp/prod | jq -r .data.data.db_password
vault kv metadata get secret/myapp/prod                  # version history
vault kv rollback -version=3 secret/myapp/prod
vault kv delete secret/myapp/prod

#  Dynamic database credentials — expire automatically
vault read database/creds/readonly
vault lease revoke -prefix database/creds/

vault policy write app-read - <<'EOF'
path "secret/data/myapp/*" { capabilities = ["read"] }
EOF
vault auth enable kubernetes
vault write auth/kubernetes/role/myapp \
  bound_service_account_names=myapp \
  bound_service_account_namespaces=prod \
  policies=app-read ttl=1h

# ─── AWS Secrets Manager / SSM ───
aws secretsmanager create-secret --name prod/db --secret-string '{"password":"s3cr3t"}'
aws secretsmanager get-secret-value --secret-id prod/db --query SecretString --output text | jq -r .password
aws secretsmanager rotate-secret --secret-id prod/db --rotation-lambda-arn arn:...
aws ssm put-parameter --name /prod/db/password --value 's3cr3t' --type SecureString --overwrite
aws ssm get-parameter --name /prod/db/password --with-decryption --query Parameter.Value --output text
aws ssm get-parameters-by-path --path /prod/ --recursive --with-decryption

# ─── SOPS — encrypted secrets in git ───
sops -e -i secrets.yaml               # encrypt in place (values only, keys stay readable)
sops -d secrets.yaml                  # decrypt to stdout
sops secrets.yaml                     # edit decrypted in $EDITOR
# .sops.yaml
#   creation_rules:
#     - path_regex: secrets/.*\.yaml$
#       kms: arn:aws:kms:us-east-1:123:key/abc

# ─── Sealed Secrets (Kubernetes) ───
kubectl create secret generic db --from-literal=password=s3cr3t --dry-run=client -o yaml \
  | kubeseal --format yaml > sealed-db.yaml     #  safe to commit
kubectl apply -f sealed-db.yaml
```

**Rules:**

- Rotate on a schedule **and** on every departure or suspected exposure
- Prefer **short-lived, dynamically issued** credentials over long-lived static ones
- Scope every credential to the narrowest resource and action set that works
- Never log a secret — `no_log`, `sensitive`, `::add-mask::`, `set +x`
- Audit access: who read which secret, when

---

## SSH & TLS

```bash
# ─── Keys ───
ssh-keygen -t ed25519 -C "alice@example.com"          #  ed25519, not RSA
ssh-keygen -t ed25519 -a 100 -f ~/.ssh/prod_key       # more KDF rounds
ssh-keygen -l -f ~/.ssh/id_ed25519.pub                # fingerprint
ssh-keygen -p -f ~/.ssh/id_ed25519                    # change the passphrase
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@host
ssh-add -l && ssh-add -D                              # list / clear the agent

# ─── Server hardening: /etc/ssh/sshd_config ───
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes
# ChallengeResponseAuthentication no
# X11Forwarding no
# MaxAuthTries 3
# ClientAliveInterval 300
# ClientAliveCountMax 2
# AllowUsers deploy admin
# AllowGroups ssh-users
# Protocol 2
sudo sshd -t                                          #  TEST before reloading
sudo systemctl reload sshd
#  Keep your current session open until a NEW one is verified

# ─── Audit ───
sudo lastb | head -20                                 # failed logins
sudo grep 'Failed password' /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn
sudo fail2ban-client status sshd
ss -tnp state established '( dport = :22 or sport = :22 )'
```

```bash
# ─── TLS certificates ───
echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName
openssl s_client -connect example.com:443 -showcerts </dev/null     # full chain
openssl x509 -in cert.pem -noout -text
nmap --script ssl-enum-ciphers -p 443 example.com     # supported protocols/ciphers
testssl.sh https://example.com                        #  thorough TLS audit

# Do cert and key match?
openssl x509 -noout -modulus -in cert.pem | openssl md5
openssl rsa  -noout -modulus -in key.pem  | openssl md5

# Expiry monitoring across a fleet
for h in api.example.com app.example.com; do
  exp=$(echo | openssl s_client -connect "$h:443" -servername "$h" 2>/dev/null \
        | openssl x509 -noout -enddate | cut -d= -f2)
  printf '%-28s %s\n' "$h" "$exp"
done

# Let's Encrypt
certbot certificates
certbot renew --dry-run                               #  test renewal before it matters
```

**Security headers to serve:**

```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
server_tokens off;
```

```bash
curl -sI https://example.com | grep -iE 'strict-transport|x-frame|x-content-type|content-security'
```

---

## Linux Hardening

```bash
# ─── Users, sudo, and access ───
awk -F: '($3 == 0) {print $1}' /etc/passwd            #  every UID-0 account (should be root only)
awk -F: '($2 == "") {print $1}' /etc/shadow           # accounts with NO password
sudo -l -U deploy                                     # what can this user run?
grep -rE 'NOPASSWD|ALL=\(ALL\)' /etc/sudoers /etc/sudoers.d/
getent group sudo docker wheel                        # who has privileged group membership
lastlog | awk '$2 != "**Never" '                      # who has actually logged in
find / -xdev -type f -perm -4000 -ls 2>/dev/null      #  SUID binaries
find / -xdev -type f -perm -2000 -ls 2>/dev/null      # SGID binaries
find / -xdev \( -perm -0002 \) -type f -ls 2>/dev/null # world-writable files
find /home -name '.ssh' -type d -exec ls -ld {} \;    # SSH dir permissions

# ─── Services and network exposure ───
ss -tlnp                                              #  what is listening, and why?
systemctl list-units --type=service --state=running
systemctl list-unit-files --state=enabled
sudo ufw status verbose  ||  sudo firewall-cmd --list-all

# ─── Updates ───
apt list --upgradable 2>/dev/null | grep -i security
sudo unattended-upgrade --dry-run -d
sudo dnf updateinfo list security
sudo dnf needs-restarting -r
sudo needrestart                                      # which services need a restart after updates

# ─── Integrity and audit ───
sudo aide --check                                     # file integrity
sudo debsums -c                                       # changed package files (Debian)
rpm -Va | head -30                                    # changed package files (RHEL)
sudo auditctl -l                                      # audit rules
sudo ausearch -m avc -ts recent                       #  SELinux denials
sudo aureport --summary
getenforce && sudo sestatus                           # SELinux state
sudo aa-status                                        # AppArmor state

# ─── Kernel hardening: /etc/sysctl.d/99-hardening.conf ───
# net.ipv4.conf.all.rp_filter = 1
# net.ipv4.conf.all.accept_redirects = 0
# net.ipv4.conf.all.accept_source_route = 0
# net.ipv4.tcp_syncookies = 1
# net.ipv4.icmp_echo_ignore_broadcasts = 1
# kernel.randomize_va_space = 2
# kernel.dmesg_restrict = 1
# fs.protected_hardlinks = 1
# fs.protected_symlinks = 1
sudo sysctl --system

sudo lynis audit system                               #  comprehensive hardening report
```

---

## Container Security

```bash
trivy image --severity HIGH,CRITICAL --exit-code 1 myapp:v1
hadolint Dockerfile
dockle myapp:v1
docker scout cves myapp:v1

# Runtime posture
docker inspect myapp --format '{{.Config.User}}'                    #  empty == root
docker inspect myapp --format '{{.HostConfig.Privileged}}'
docker inspect myapp --format '{{.HostConfig.ReadonlyRootfs}}'
docker inspect myapp --format '{{.HostConfig.CapAdd}} {{.HostConfig.CapDrop}}'
docker inspect myapp --format '{{range .Mounts}}{{.Source}}→{{.Destination}} {{end}}'

#  Audit: which containers run as root or are privileged?
docker ps -q | xargs -r docker inspect \
  --format '{{.Name}} user={{.Config.User}} privileged={{.HostConfig.Privileged}}'

#  Audit: anything mounting the Docker socket? (= root on the host)
docker ps -q | xargs -r docker inspect \
  --format '{{.Name}} {{range .Mounts}}{{.Source}} {{end}}' | grep docker.sock
```

**Hardened run:**

```bash
docker run -d \
  --user 10001:10001 \
  --read-only --tmpfs /tmp:rw,noexec,nosuid,size=64m \
  --cap-drop ALL --cap-add NET_BIND_SERVICE \
  --security-opt no-new-privileges:true \
  --security-opt seccomp=default.json \
  --memory 512m --cpus 1 --pids-limit 200 \
  --network appnet \
  myapp:v1
```

**Signing and verification:**

```bash
cosign generate-key-pair
cosign sign --key cosign.key ghcr.io/org/app:v1
cosign verify --key cosign.pub ghcr.io/org/app:v1
cosign sign --yes ghcr.io/org/app:v1                          #  keyless, via OIDC
cosign attest --predicate sbom.json --type spdxjson ghcr.io/org/app:v1
```

**Image checklist:** non-root `USER` · minimal base (`distroless`/`slim`/`scratch`) · multi-stage build · pinned base by digest · no secrets in any layer · `.dockerignore` present · scanned in CI with a **failing** gate · SBOM generated · image signed.

---

## Kubernetes Security

```bash
kube-bench run --targets master,node                  # CIS benchmark
kubescape scan framework nsa
kubescape scan framework mitre
polaris audit --audit-path ./manifests
trivy k8s --report summary cluster

# ─── RBAC audit ───
kubectl auth can-i --list                                              # my permissions
kubectl auth can-i --list --as=system:serviceaccount:default:myapp     #  theirs
kubectl get clusterrolebindings -o json | jq -r '.items[] |
  select(.roleRef.name=="cluster-admin") |
  "\(.metadata.name): \(.subjects // [] | map(.kind+"/"+.name) | join(", "))"'   #  who is cluster-admin
kubectl get rolebindings,clusterrolebindings -A -o wide | grep -i default    # default SA bindings

# ─── Workload posture ───
# Privileged containers
kubectl get pods -A -o json | jq -r '.items[] |
  select(.spec.containers[]?.securityContext?.privileged==true) |
  "\(.metadata.namespace)/\(.metadata.name)"'

# Containers that may run as root
kubectl get pods -A -o json | jq -r '.items[] |
  select((.spec.securityContext?.runAsNonRoot // false) != true) |
  "\(.metadata.namespace)/\(.metadata.name)"'

# Host namespace / hostPath usage   container escape risk
kubectl get pods -A -o json | jq -r '.items[] |
  select(.spec.hostNetwork==true or .spec.hostPID==true or .spec.hostIPC==true) |
  "\(.metadata.namespace)/\(.metadata.name)"'
kubectl get pods -A -o json | jq -r '.items[] |
  select(.spec.volumes[]?.hostPath) | "\(.metadata.namespace)/\(.metadata.name)"'

# No resource limits — a noisy-neighbour and DoS risk
kubectl get pods -A -o json | jq -r '.items[] |
  select(.spec.containers[].resources.limits == null) |
  "\(.metadata.namespace)/\(.metadata.name)"'

# Namespaces with NO NetworkPolicy at all
comm -23 <(kubectl get ns -o name | cut -d/ -f2 | sort) \
         <(kubectl get netpol -A -o jsonpath='{.items[*].metadata.namespace}' | tr ' ' '\n' | sort -u)
```

```yaml
# Pod Security Standards — enforce at the namespace level
apiVersion: v1
kind: Namespace
metadata:
  name: prod
  labels:
    pod-security.kubernetes.io/enforce: restricted     #  privileged | baseline | restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

```yaml
# Secure workload defaults
spec:
  automountServiceAccountToken: false      #  unless the pod calls the K8s API
  securityContext:
    runAsNonRoot: true
    runAsUser: 10001
    fsGroup: 10001
    seccompProfile: {type: RuntimeDefault}
  containers:
    - securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        privileged: false
        capabilities: {drop: [ALL]}
```

**Kubernetes checklist:** RBAC least privilege (no blanket `cluster-admin`) · Pod Security Standards `restricted` · default-deny NetworkPolicies · Secrets encrypted at rest + external secret store · `automountServiceAccountToken: false` by default · resource limits everywhere · admission control (Kyverno/OPA Gatekeeper) enforcing signed, scanned images · API server audit logging on · private API endpoint · node auto-upgrades.

---

## Cloud Audit One-Liners

```bash
# ─── IAM ───
aws sts get-caller-identity
aws iam generate-credential-report >/dev/null && aws iam get-credential-report \
  --query Content --output text | base64 -d | column -t -s,      #  stale keys, no MFA
aws iam list-users --query 'Users[?PasswordLastUsed<=`2025-08-01`].UserName'
aws iam list-policies --scope Local --query 'Policies[].PolicyName'
aws iam simulate-principal-policy --policy-source-arn arn:...:role/App \
  --action-names s3:DeleteBucket                                  #  can it do the scary thing?

# ─── Network exposure ───
aws ec2 describe-security-groups --query \
 'SecurityGroups[?IpPermissions[?contains(IpRanges[].CidrIp, `0.0.0.0/0`)]].{ID:GroupId,Name:GroupName}' \
 --output table                                                   #  open to the internet
aws ec2 describe-instances --query \
 'Reservations[].Instances[?PublicIpAddress!=null].[InstanceId,PublicIpAddress]' --output table
aws rds describe-db-instances --query \
 'DBInstances[?PubliclyAccessible==`true`].DBInstanceIdentifier'   #  public databases

# ─── Storage ───
for b in $(aws s3api list-buckets --query 'Buckets[].Name' --output text); do
  pab=$(aws s3api get-public-access-block --bucket "$b" 2>/dev/null \
        --query 'PublicAccessBlockConfiguration.BlockPublicAcls' --output text || echo "NONE")
  enc=$(aws s3api get-bucket-encryption --bucket "$b" >/dev/null 2>&1 && echo yes || echo "NO")
  printf '%-40s public_block=%-6s encrypted=%s\n' "$b" "$pab" "$enc"
done

# ─── Logging and detection ───
aws cloudtrail describe-trails --query 'trailList[].{Name:Name,Multi:IsMultiRegionTrail,Logging:HomeRegion}'
aws guardduty list-detectors
aws securityhub get-findings --filters '{"SeverityLabel":[{"Value":"CRITICAL","Comparison":"EQUALS"}]}' \
  --max-results 20 --query 'Findings[].Title'
aws configservice describe-compliance-by-config-rule --compliance-types NON_COMPLIANT

# ─── Full posture assessment ───
prowler aws --severity critical high
scoutsuite aws
```

---

## CI/CD Security

**Pipeline gates, in order (cheapest first):**

```yaml
1. Secret scan        gitleaks protect --staged        # pre-commit, then CI on full history
2. Dependency scan    trivy fs --scanners vuln .       # or npm audit / pip-audit
3. SAST               semgrep --config=auto .
4. IaC scan           trivy config .  /  checkov -d .
5. Build              docker build (multi-stage, non-root, pinned base)
6. Image scan         trivy image --exit-code 1 --severity HIGH,CRITICAL
7. SBOM               syft -o spdx-json > sbom.json
8. Sign               cosign sign --yes $IMAGE
9. Deploy             admission control verifies the signature
10. DAST              OWASP ZAP against staging
```

**Supply-chain hardening:**

| Control | Command / setting |
|---------|-------------------|
| Pin third-party actions to a **SHA** | `uses: org/action@a1b2c3d...` — tags are mutable |
| Least-privilege `GITHUB_TOKEN` | `permissions: {contents: read}` at the workflow root |
| **OIDC** instead of static cloud keys | `id-token: write` + `role-to-assume` |
| Never run untrusted PR code with secrets | Avoid `pull_request_target` with a PR-ref checkout |
| Pin base images by digest | `FROM node:20-slim@sha256:...` |
| Commit lockfiles | `package-lock.json`, `.terraform.lock.hcl`, `poetry.lock` |
| Sign commits and images | `git commit -S`, `cosign sign` |
| Enable branch protection | Required reviews + required status checks |
| Enable GitHub push protection | Blocks secret pushes at the server |
| Restrict self-hosted runners | Never on public-repo PRs |

```bash
# Verify a signed image at deploy time
cosign verify --certificate-identity-regexp 'https://github.com/myorg/.*' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  ghcr.io/myorg/app:v1
```

---

## Vulnerability Triage

Not every CVE matters. Triage in this order:

```
1. IS IT REACHABLE?
   Is the vulnerable package actually loaded and called by your code path?
   A CVE in a dev dependency that never ships is not a production risk.

2. IS IT EXPOSED?
   Internet-facing, or behind three layers of internal network?
   Does exploitation require authentication you already enforce?

3. WHAT IS THE IMPACT?
   RCE / auth bypass / data exposure → drop everything.
   DoS on an internal batch job → schedule it.

4. IS THERE A FIX?
   `--ignore-unfixed` filters out the ones you can't action today.
   No fix + reachable + exposed → mitigate (WAF rule, config change, disable the feature).

5. RECORD THE DECISION.
   Accepted risks go in .trivyignore with a REASON, an OWNER, and a REVIEW DATE.
   An ignore file with no expiry is how a critical CVE lives for three years.
```

| CVSS | Internet-facing | Internal only |
|------|-----------------|---------------|
| **Critical (9.0+)** | Patch within 24h | Patch within 7 days |
| **High (7.0–8.9)** | Patch within 7 days | Patch within 30 days |
| **Medium (4.0–6.9)** | Next release cycle | Next release cycle |
| **Low (<4.0)** | Batch with routine updates | Batch with routine updates |

```bash
# Where is this package actually coming from?
trivy image --format json myapp:v1 | jq -r '.Results[].Vulnerabilities[]?
  | select(.Severity=="CRITICAL") | "\(.PkgName) \(.InstalledVersion) → \(.FixedVersion // "no fix") \(.VulnerabilityID)"'
npm ls vulnerable-package
pip show vulnerable-package
```

---

## Incident Response

```
1. DETECT     — alert, anomaly, report. Note the time.
2. CONTAIN    — stop the bleeding before you investigate.
3. PRESERVE   — snapshot before you change anything. Evidence first.
4. ERADICATE  — remove the access, patch the hole.
5. RECOVER    — restore service from a known-good state.
6. LEARN      — blameless postmortem with dated action items.
```

```bash
# ─── CONTAIN ───
aws iam update-access-key --user-name compromised --access-key-id AKIA... --status Inactive
aws iam attach-user-policy --user-name compromised --policy-arn arn:aws:iam::aws:policy/AWSDenyAll
kubectl scale deploy/compromised --replicas=0
kubectl label pod suspicious quarantine=true --overwrite     # then a NetworkPolicy isolates it
aws ec2 modify-instance-attribute --instance-id i-0abc --groups sg-quarantine
sudo ufw deny from <attacker-ip>

# ─── PRESERVE (before you touch anything) ───
aws ec2 create-snapshot --volume-id vol-0abc --description "IR-2026-08-04 evidence"
docker commit suspicious-container evidence:incident-01
kubectl cp suspicious-pod:/var/log ./evidence/logs
sudo dd if=/dev/mem of=/mnt/evidence/memory.dump bs=1M       # memory capture
sudo tar czf /mnt/evidence/logs.tgz /var/log
sha256sum /mnt/evidence/* > /mnt/evidence/MANIFEST.sha256    #  chain of custody

# ─── INVESTIGATE ───
sudo last -20 && sudo lastb -20
sudo grep -E 'Accepted|Failed' /var/log/auth.log | tail -50
sudo journalctl --since "2 hours ago" -p warning
ps auxf                                                       # unexpected process tree
ss -tnp                                                       # unexpected outbound connections
sudo find / -xdev -mtime -1 -type f -ls 2>/dev/null | head -50   #  recently modified files
sudo find / -xdev -type f -perm -4000 -newer /etc/hostname -ls 2>/dev/null   # new SUID binaries
crontab -l && sudo ls -la /etc/cron.*/ /var/spool/cron/

aws cloudtrail lookup-events --lookup-attributes \
  AttributeKey=Username,AttributeValue=compromised --max-results 50
kubectl get events -A --sort-by=.lastTimestamp | tail -50
```

**Postmortem template:**

```markdown
# Incident: <short title>

**Date**: 2026-08-04 · **Duration**: 09:12–10:47 UTC (95 min)
**Severity**: SEV-2 · **Author**: <name>

## Impact
Who was affected, how many, for how long, and in what way.

## Timeline (UTC)
| Time | Event |
|------|-------|
| 09:12 | First 5xx errors; alert fired |
| 09:18 | On-call acknowledged |
| 09:31 | Root cause identified |
| 09:44 | Mitigation applied |
| 10:47 | Fully recovered |

## Root Cause
The technical chain of events. Systems, not people.

## What Went Well
## What Went Poorly
## Where We Got Lucky

## Action Items
| Action | Owner | Due | Ticket |
|--------|-------|-----|--------|
| Add alert on X | @alice | 2026-08-11 | OPS-482 |
```

>**Blameless means systems-focused, not consequence-free.** "Alice deleted the database" is not a root cause. "A single command could delete production with no confirmation, no backup verification, and no audit trail" is — and it produces action items that actually prevent recurrence.

---

<div align="center">

[← Module 13 README](./README.md) · [Resources](./resources.md) · [Labs](./labs/) · [Handbook Quick Reference](../QUICK-REFERENCE.md)

</div>
<!-- tab: Labs -->
# Lab 01: Security Scanning — Trivy, gitleaks, and Secure CI/CD

## Objective

Integrate security scanning into your DevOps workflow. You'll scan container images for CVEs, detect secrets in git repos, write a secure Dockerfile, and build a CI pipeline with security gates.

---

## Prerequisites

- Docker installed
- Git repository (local or GitHub)
- Completed Module 05 (Docker) and Module 06 (CI/CD)

---

## Deliverables and Evidence

By the end of this lab, keep the following evidence in your notes or portfolio repo:

- Commands you ran and the important output you used for validation
- Any files, scripts, configs, manifests, or workflows you created
- A short failure note describing one thing that broke, how you diagnosed it, and how you fixed it
- Cleanup commands or confirmation that no long-running resources remain

Treat the validation section as the minimum proof that the lab worked.

---

## Lab Files

Every file this lab creates also exists as a real, CI-validated file in
[`../code/lab-01/`](../code/lab-01/) (6 files).

```bash
# Option A — type them out yourself (recommended the first time; that's the learning)
# Option B — start from the reference copies
cp -r /path/to/the-devops-handbook/13-security-basics/code/lab-01/. .
```

Use Option B when you're comparing against a known-good version, or when something
won't start and you need to rule out a typo. See [`../code/README.md`](../code/README.md).

---

## Exercise 1: Scan Container Images with Trivy

### Step 1: Install Trivy

```bash
# Debian/Ubuntu
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee /etc/apt/sources.list.d/trivy.list
sudo apt-get update && sudo apt-get install trivy

# RHEL-compatible
sudo tee /etc/yum.repos.d/trivy.repo << 'REPO'
[trivy]
name=Trivy repository
baseurl=https://aquasecurity.github.io/trivy-repo/rpm/releases/$releasever/$basearch/
gpgcheck=0
enabled=1
REPO
sudo dnf install -y trivy

# Or via Docker (no install needed)
alias trivy="docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest"
```

### Step 2: Scan a Popular Image

```bash
# Scan nginx — see what vulnerabilities exist
trivy image nginx:latest

# Filter by severity
trivy image --severity HIGH,CRITICAL nginx:latest

# Scan a slim image — compare the results
trivy image nginx:1.25-alpine
```

**Questions to consider:**

- How many HIGH/CRITICAL CVEs does `nginx:latest` have vs `nginx:1.25-alpine`?
- Why do minimal base images have fewer vulnerabilities?

### Step 3: Build and Scan Your Own Image

```bash
mkdir -p trivy-lab && cd trivy-lab

# Insecure Dockerfile
cat > Dockerfile.bad << 'DOCKERFILE'
FROM ubuntu:latest
RUN apt-get update && apt-get install -y python3 curl wget vim
COPY app.py /app/
ENV API_KEY=sk-secret-12345
USER root
CMD ["python3", "/app/app.py"]
DOCKERFILE

# Secure Dockerfile
cat > Dockerfile.good << 'DOCKERFILE'
FROM python:3.12-slim
WORKDIR /app
COPY app.py .
RUN useradd -r -s /sbin/nologin appuser
USER appuser
CMD ["python3", "app.py"]
DOCKERFILE

echo 'print("Hello, World!")' > app.py

# Build both
docker build -t myapp:insecure -f Dockerfile.bad .
docker build -t myapp:secure -f Dockerfile.good .

# Scan both — compare results
echo "=== INSECURE IMAGE ==="
trivy image --severity HIGH,CRITICAL myapp:insecure

echo "=== SECURE IMAGE ==="
trivy image --severity HIGH,CRITICAL myapp:secure
```

** Checkpoint:** The secure image should have significantly fewer CVEs than the insecure one.

---

## Exercise 2: Detect Secrets with gitleaks

### Step 1: Install gitleaks

```bash
# Linux
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz
tar -xzf gitleaks_8.18.0_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/

# Verify
gitleaks version
```

### Step 2: Create a Repo with Secrets

```bash
mkdir -p secret-test && cd secret-test
git init

# Simulate accidental secret commits
cat > config.py << 'CODE'
# Database config
DB_HOST = "db.example.com"
DB_USER = "admin"
DB_PASS = "SuperSecret123!"

# AWS credentials
AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

# API token
GITHUB_TOKEN = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef"
CODE

git add . && git commit -m "add config"

# Scan the repo
gitleaks detect -v
```

You should see gitleaks flagging the AWS keys and GitHub token.

### Step 3: Fix and Prevent

```bash
# Remove secrets from code
cat > config.py << 'CODE'
import os

DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_USER = os.environ.get("DB_USER")
DB_PASS = os.environ.get("DB_PASS")
AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
CODE

# Add .gitignore
cat > .gitignore << 'GI'
.env
*.pem
*.key
GI

git add . && git commit -m "fix: remove hardcoded secrets"

# Scan again — the old commit still has secrets!
gitleaks detect -v
# gitleaks scans ALL history — secrets in old commits are still found
```

** Checkpoint:** gitleaks detects secrets in git history even after removal from current code.

---

## Exercise 3: Scan IaC and Kubernetes Configs

```bash
mkdir -p iac-scan && cd iac-scan

# Create an insecure Terraform config
cat > main.tf << 'HCL'
resource "aws_security_group" "bad" {
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # Open to the world!
  }
}

resource "aws_s3_bucket" "bad" {
  bucket = "my-public-bucket"
  acl    = "public-read" # Public bucket!
}
HCL

# Create an insecure K8s manifest
cat > pod.yml << 'YAML'
apiVersion: v1
kind: Pod
metadata:
  name: insecure-pod
spec:
  containers:
    - name: app
      image: myapp:latest
      securityContext:
        privileged: true            # Full host access!
        runAsUser: 0                # Running as root!
YAML

# Scan with Trivy
trivy config .

# You should see misconfigurations flagged:
# - Security group open to 0.0.0.0/0
# - S3 bucket with public access
# - Pod running as root with privileged mode
```

** Checkpoint:** Trivy catches infrastructure and K8s misconfigurations before they reach production.

---

## Break It: Four Ways Security Scanning Gives False Confidence

You now have three scanners producing green output. Every scenario below produces **green output on genuinely vulnerable systems** — which is worse than no scanning, because it manufactures confidence.

### Scenario 1: The Scanner That Passes an Exploitable Image

**Break it:**

```bash
mkdir -p ~/security-lab/false-negative && cd ~/security-lab/false-negative

cat > Dockerfile <<'EOF'
FROM alpine:3.19
RUN apk add --no-cache curl
# Install a dependency OUTSIDE the package manager — the way real apps do it
RUN mkdir -p /app/vendor && \
    echo 'log4j-core-2.14.1.jar (vulnerable to CVE-2021-44228)' > /app/vendor/log4j-core-2.14.1.jar && \
    echo 'requests==2.6.0' > /app/requirements.txt
COPY . /app
CMD ["sleep", "3600"]
EOF

docker build -q -t false-negative:v1 . && trivy image --severity HIGH,CRITICAL false-negative:v1
```

**Symptom:** Trivy reports **zero HIGH/CRITICAL** findings, or only a handful of base-OS CVEs. The Log4Shell-era jar and the ancient `requests` pin are invisible.

**Investigate:**

```bash
#  What did the scanner actually look at?
trivy image --list-all-pkgs false-negative:v1 | head -20
# Only apk packages. It never opened /app.

# Force it to look at application dependencies too
trivy image --scanners vuln,secret,misconfig --detection-priority comprehensive false-negative:v1

# Generate an SBOM and see what's really in there
syft false-negative:v1 -o table 2>/dev/null | head -20
```

**Root cause:** Scanners detect what they can **identify**. They parse OS package databases (`apk`, `apt`, `rpm`) and recognised lockfiles (`package-lock.json`, `requirements.txt`, `go.sum`, `Gemfile.lock`). A jar copied in by hand, a binary downloaded with `curl`, a vendored directory, or a statically-linked Go binary is just bytes to them.

**Fix:**

```bash
# 1. Commit real lockfiles so the scanner has something to parse
# 2. Scan the SOURCE tree, not only the image — it sees manifests the image lost
trivy fs --scanners vuln,secret,misconfig .

# 3. Generate and retain an SBOM per build; scan the SBOM as new CVEs are published
syft false-negative:v1 -o spdx-json > sbom.json
trivy sbom sbom.json

# 4. Cross-check with a second scanner — they have different databases
grype false-negative:v1
```

>**A clean scan means "no *known* vulnerabilities in *recognised* components."** It does not mean secure. Ask what fraction of your dependency tree the scanner could actually see.

---

### Scenario 2: The `.trivyignore` That Became Permanent

**Break it:**

```bash
cd ~/security-lab
cat > .trivyignore <<'EOF'
CVE-2023-45853
CVE-2024-2511
CVE-2023-6237
EOF

trivy image --severity HIGH,CRITICAL --exit-code 1 python:3.9-slim ; echo "exit=$?"
```

**Symptom:** The gate passes. The ignore file has no reasons, no owners, and no expiry — nobody remembers whether these were assessed or just silenced to make a red build green at 5pm on a Friday.

**Investigate:**

```bash
#  What is this file actually hiding right now?
trivy image --severity HIGH,CRITICAL --ignorefile /dev/null python:3.9-slim | head -30

# Compare the counts
suppressed=$(trivy image -q -f json --ignorefile /dev/null python:3.9-slim | jq '[.Results[].Vulnerabilities[]? | select(.Severity=="CRITICAL" or .Severity=="HIGH")] | length')
visible=$(trivy image -q -f json python:3.9-slim | jq '[.Results[].Vulnerabilities[]? | select(.Severity=="CRITICAL" or .Severity=="HIGH")] | length')
echo "visible=$visible  actual=$suppressed  suppressed=$((suppressed - visible))"

# Who added these, and when?
git log -p --follow .trivyignore 2>/dev/null | head -40
```

**Root cause:** Suppression is necessary — not every CVE is reachable or fixable today. But a bare CVE ID carries no decision, so the accepted risk becomes invisible and permanent. Three years later nobody dares remove a line because nobody knows why it's there.

**Fix — every suppression is a dated, owned, reviewable decision:**

```yaml
# .trivyignore.yaml — the structured format, with built-in expiry 
vulnerabilities:
  - id: CVE-2023-45853
    statement: |
      zlib MiniZip. We never call MiniZip — the vulnerable code path is not
      reachable from our entrypoint (verified by grep + call-graph review).
      Accepted by @alice, security review 2026-08-04.
    expired_at: 2026-11-04        #  the finding REAPPEARS after this date

  - id: CVE-2024-2511
    statement: |
      OpenSSL TLS session cache DoS. Our service sits behind an ALB that
      terminates TLS; the container never handles untrusted TLS handshakes.
      Accepted by @bob 2026-08-04, re-review 2026-11-04.
    expired_at: 2026-11-04
```

```bash
# CI: fail if any suppression is missing a justification or an expiry date
python3 - <<'EOF'
import sys, yaml, datetime, pathlib
p = pathlib.Path(".trivyignore.yaml")
if not p.exists(): sys.exit(0)
data = yaml.safe_load(p.read_text()) or {}
bad = []
for v in data.get("vulnerabilities", []):
    if not v.get("statement", "").strip(): bad.append(f'{v["id"]}: no justification')
    if not v.get("expired_at"):            bad.append(f'{v["id"]}: no expiry date')
if bad:
    print(" invalid suppressions:"); [print("  ", b) for b in bad]; sys.exit(1)
print(" all suppressions justified and dated")
EOF
```

---

### Scenario 3: Rotation Is the Fix — Purging History Is Not

**Break it:**

```bash
mkdir -p ~/security-lab/leak && cd ~/security-lab/leak
git init -q

cat > config.py <<'EOF'
AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
EOF
git add -A && git commit -qm "add config"

# "Fix" it the way most people first try
cat > config.py <<'EOF'
import os
AWS_ACCESS_KEY_ID = os.environ["AWS_ACCESS_KEY_ID"]
AWS_SECRET_ACCESS_KEY = os.environ["AWS_SECRET_ACCESS_KEY"]
EOF
git add -A && git commit -qm "fix: use environment variables for credentials"

gitleaks detect --source . --no-banner ; echo "exit=$?"
```

**Symptom:** gitleaks still finds it — because the secret is in commit 1 forever. But here's the part that matters: even after you purge history, **the credential is still valid**.

**Investigate:**

```bash
git log --oneline
git show HEAD~1:config.py           #  still fully readable
git rev-list --all --objects | git cat-file --batch-check='%(objecttype) %(objectname)' | grep blob | wc -l
```

**Root cause:** Git is append-only. A "fix" commit adds a new version; it does not remove the old one. And history rewriting — the step people focus on — is **cleanup, not remediation**. By the time a secret reaches a remote it must be assumed compromised: automated scanners crawl public GitHub within seconds of a push, and forks, clones, CI caches, and GitHub's own cached views all keep copies you cannot reach.

**Fix — in this order, and the order is the entire lesson:**

```bash
# ── 1. ROTATE. First. Before anything else. ────────────────────────────
aws iam update-access-key --user-name svc-app --access-key-id AKIA... --status Inactive
aws iam create-access-key --user-name svc-app          # issue the replacement
# deploy the new value, verify the app works, then:
aws iam delete-access-key --user-name svc-app --access-key-id AKIA...

# ── 2. CHECK FOR ABUSE ─────────────────────────────────────────────────
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=AccessKeyId,AttributeValue=AKIA... \
  --max-results 50 --query 'Events[].{Time:EventTime,Name:EventName,Src:Username}' --output table

# ── 3. PURGE HISTORY (hygiene) ─────────────────────────────────────────
pip install -q git-filter-repo
printf 'AKIAIOSFODNN7EXAMPLE==>REDACTED\nwJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY==>REDACTED\n' > replacements.txt
git filter-repo --replace-text replacements.txt --force
gitleaks detect --source . --no-banner ; echo "exit=$?"    # now clean

# ── 4. FORCE-PUSH, tell every collaborator to re-clone,
#      and ask GitHub Support to purge cached views and fork references.

# ── 5. PREVENT ─────────────────────────────────────────────────────────
gitleaks protect --staged                 # pre-commit
# + enable GitHub secret scanning with PUSH PROTECTION (blocks at the server)
```

>**The single most important sentence in this module**: *rotation is the fix; history rewriting is cleanup.* An engineer who purges history and skips rotation has done the visible work and none of the useful work.

---

### Scenario 4: The Green Pipeline That Ships a Root Container

**Break it:**

```bash
mkdir -p ~/security-lab/green-but-bad && cd ~/security-lab/green-but-bad

cat > Dockerfile <<'EOF'
FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY app.sh /app.sh
RUN chmod +x /app.sh
CMD ["/app.sh"]
EOF
echo -e '#!/bin/sh\nwhile :; do sleep 30; done' > app.sh

docker build -q -t green-but-bad:v1 .
trivy image --severity HIGH,CRITICAL --exit-code 1 green-but-bad:v1 ; echo "trivy exit=$?"
```

**Symptom:** Trivy exits **0**. A fresh Alpine base genuinely has no HIGH/CRITICAL CVEs. Your pipeline gate is green — and you have just shipped a container that runs as **root**, with a **writable root filesystem** and **every Linux capability** the runtime grants by default.

**Investigate:**

```bash
docker run --rm green-but-bad:v1 id
# uid=0(root) gid=0(root) groups=0(root)    CVE scanning never checks this

docker inspect green-but-bad:v1 --format 'USER={{.Config.User}}'    # empty = root

# The scanners that DO check configuration
hadolint Dockerfile
dockle green-but-bad:v1
trivy config .                     # Dockerfile misconfiguration rules
```

**Root cause:** CVE scanning and configuration scanning answer **different questions**. Trivy's `vuln` scanner asks "does this image contain known-vulnerable packages?" It never asks "is this image configured safely?" A pipeline that runs only `trivy image` has a large, silent blind spot.

**Fix — the Dockerfile:**

```dockerfile
FROM alpine:3.20@sha256:...          # pin by digest
RUN apk add --no-cache ca-certificates && \
    addgroup -g 10001 -S app && adduser -u 10001 -S app -G app
COPY --chown=app:app app.sh /app/app.sh
RUN chmod +x /app/app.sh
USER 10001:10001                     #  non-root, numeric (works with runAsNonRoot)
ENTRYPOINT ["/app/app.sh"]
```

**And the pipeline — layer the scanners, because each sees something the others don't:**

```yaml
- run: hadolint Dockerfile                                    # Dockerfile lint
- run: trivy fs --scanners vuln,secret,misconfig .            # source: deps + secrets + IaC
- run: gitleaks detect --source . --redact                    # git history
- run: docker build -t $IMAGE .
- run: trivy image --exit-code 1 --severity HIGH,CRITICAL $IMAGE   # CVEs
- run: dockle --exit-code 1 --exit-level warn $IMAGE          #  image CONFIGURATION
- run: syft $IMAGE -o spdx-json > sbom.json                   # provenance
- run: cosign sign --yes $IMAGE                               # signing
```

**Then enforce it at runtime**, because a well-built image can still be run badly:

```yaml
# Kubernetes admission — the image config is only half the control
securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities: {drop: [ALL]}
  seccompProfile: {type: RuntimeDefault}
```

---

### What Each Tool Actually Covers

| Question | Tool | Blind to |
|----------|------|----------|
| Known CVEs in recognised packages? | `trivy image`, `grype` | Vendored/hand-installed deps, image configuration |
| Is the Dockerfile well-formed? | `hadolint` | Runtime behaviour, actual CVEs |
| Is the **image** configured safely? | `dockle`, `trivy config` | CVEs, application logic |
| Secrets in code or history? | `gitleaks`, `trufflehog` | Secrets injected at runtime, secrets in image layers |
| IaC misconfiguration? | `trivy config`, `checkov` | Anything not in the IaC |
| What is actually in this artifact? | `syft` (SBOM) | Nothing — but it only *reports*, it doesn't judge |
| Application logic flaws? | `semgrep`, `bandit` | Dependencies, infrastructure |
| Is the running cluster safe? | `kube-bench`, `kubescape` | Application code |

>**The meta-lesson of this lab**: a green pipeline means *"the checks we configured found nothing"* — never *"this is secure."* When someone says "the scan passed," the right follow-up is **"which scanner, and what can't it see?"** Write your triage decisions down (Scenario 2), rotate before you clean up (Scenario 3), and layer tools that have different blind spots (Scenarios 1 and 4).

**Write this up** in `failure-notes.md`: for each scenario, what the scanner reported, what was actually true, and the control you added to close the gap.

```bash
cd ~ && rm -rf ~/security-lab/false-negative ~/security-lab/leak ~/security-lab/green-but-bad
```

---

## Cleanup

```bash
cd ..
rm -rf trivy-lab secret-test iac-scan
```

---

## Validation

- [ ] Scan container images with Trivy and identify HIGH/CRITICAL CVEs
- [ ] Compare CVE counts between a fat image and a slim/alpine image
- [ ] Detect hardcoded secrets in git history with gitleaks
- [ ] Refactor code to use environment variables instead of hardcoded secrets
- [ ] Scan Terraform and Kubernetes configs for misconfigurations
- [ ] Explain why secrets in old git commits are still a risk
- [ ] Build a secure Dockerfile (non-root, slim base, pinned version)
- [ ] Describe how to integrate security scanning into a CI/CD pipeline

## What to Commit

Add these to your portfolio repo as evidence of completed work:

- Trivy scan output comparing insecure vs secure images
- gitleaks scan results showing detected secrets
- IaC scan output showing misconfigurations found
- Notes on remediation steps for each finding

---

[← Back to Module README](../README.md)

---

# Lab 02: Secrets Management

## Objective

Stop putting secrets where they can be read. You'll compare the four ways a secret reaches a running application, encrypt secrets safely enough to commit them to git, issue **dynamic credentials that expire on their own**, and practise the rotation drill — because the fix for a leaked secret is always rotation, never cleanup.

---

## Prerequisites

- Completed [Lab 01: Security Scanning](./lab-01-security-scanning.md)
- Docker and Docker Compose
- `age` and `sops` (installed in Exercise 3), `jq`

```bash
docker --version && docker compose version
command -v jq >/dev/null || echo "install jq first"
```

>**Cost**: everything here runs locally in containers. No cloud resources.

---

## Deliverables and Evidence

- A comparison table of the four delivery mechanisms, with the leak path you found for each
- A SOPS-encrypted file you would be comfortable committing, plus proof of what's readable in it
- Vault issuing a database credential that expires, with the expiry demonstrated
- A completed rotation drill with timings
- `failure-notes.md`

---

## Lab Files

Reference copies are in [`../code/lab-02/`](../code/lab-02/).

```bash
cp -r /path/to/the-devops-handbook/13-security-basics/code/lab-02/. .
```

---

## Exercise 1: Where Secrets Leak

Four ways to get a secret into a container. Each leaks somewhere different.

### Step 1: Set Up

```bash
mkdir -p secrets-lab && cd secrets-lab
```

### Step 2: Baked Into the Image — the Worst Option

```bash
cat > Dockerfile.baked <<'EOF'
FROM alpine:3.20
ENV API_TOKEN=sk-live-baked-into-the-image-forever
ARG BUILD_SECRET=arg-secrets-are-also-visible
RUN echo "using $BUILD_SECRET during build" > /tmp/build.log
CMD ["sleep", "3600"]
EOF

docker build -q -t leak-baked:v1 -f Dockerfile.baked .
```

**Where it leaks — three independent places:**

```bash
# 1. Image metadata, readable by anyone who can pull the image
docker inspect leak-baked:v1 --format '{{range .Config.Env}}{{println .}}{{end}}'

# 2.  Build history — ARG values too, even though they aren't in the final env
docker history --no-trunc leak-baked:v1 | grep -i secret

# 3. The image layers themselves. Deleting a file in a later layer does NOT remove it.
docker save leak-baked:v1 | tar -t 2>/dev/null | head -5
```

>**`ARG` is not a secret mechanism.** It doesn't appear in the final environment, which makes people think it's safe — but `docker history` prints it. So does anyone who pulls the image from your registry.

### Step 3: Environment Variables — Better, Still Leaky

```bash
docker run -d --name leak-env -e API_TOKEN='sk-live-from-env' alpine:3.20 sleep 3600

# Leak 1: inspect
docker inspect leak-env --format '{{range .Config.Env}}{{println .}}{{end}}' | grep API_TOKEN

# Leak 2:  /proc — any process in the container can read another's environment
docker exec leak-env sh -c 'cat /proc/1/environ | tr "\0" "\n" | grep API_TOKEN'

# Leak 3: child processes inherit it, and often log it
docker exec leak-env sh -c 'env | grep API_TOKEN'

# Leak 4: crash dumps, error reporters, and `docker inspect` in support tickets
```

### Step 4: A Mounted File — Better Again

```bash
mkdir -p secrets && echo -n 'sk-live-from-file' > secrets/api_token
chmod 600 secrets/api_token

docker run -d --name leak-file \
  -v "$PWD/secrets/api_token:/run/secrets/api_token:ro" \
  alpine:3.20 sleep 3600

docker exec leak-file cat /run/secrets/api_token; echo
docker inspect leak-file --format '{{range .Config.Env}}{{println .}}{{end}}' | grep -c API_TOKEN || echo "   not in the environment"
docker exec leak-file sh -c 'cat /proc/1/environ | tr "\0" "\n" | grep -c API_TOKEN' || echo "   not in /proc"

# But: it IS on the host disk, and the mount path is visible
docker inspect leak-file --format '{{range .Mounts}}{{.Source}} → {{.Destination}}{{end}}'
```

### Step 5: tmpfs — Never Touches Disk

```bash
docker run -d --name leak-tmpfs \
  --tmpfs /run/secrets:rw,noexec,nosuid,size=1m \
  alpine:3.20 sh -c 'echo -n "sk-live-in-ram" > /run/secrets/api_token; sleep 3600'

docker exec leak-tmpfs cat /run/secrets/api_token; echo
docker exec leak-tmpfs mount | grep /run/secrets     #  tmpfs — RAM only
```

### Step 6: Score Them

```bash
docker rm -f leak-env leak-file leak-tmpfs >/dev/null 2>&1
```

| Mechanism | In the image? | In `inspect`? | In `/proc`? | On host disk? | Verdict |
|-----------|--------------|--------------|-------------|--------------|---------|
| `ENV` in Dockerfile |  **Yes, forever** | Yes | Yes | Yes |  Never |
| `ARG` in Dockerfile |  **In `docker history`** | No | No | Yes |  Never |
| `-e` at runtime | No |  **Yes** |  **Yes** | No |  Acceptable with care |
| Mounted file | No | Path only |  No |  Yes |  Good |
| **tmpfs / secret manager** | No | Path only |  No |  **No** |  Best |

>**The ranking that matters in practice**: image > environment > file > tmpfs, worst to best. But the mechanism is secondary. A **short-lived, automatically-rotated** credential delivered via environment variable is safer than a **permanent** one delivered via tmpfs. Lifetime beats delivery.

---

## Exercise 2: BuildKit Secrets

You often need a credential *during* a build — a private package registry token — without it entering the image.

```bash
cat > .npmrc <<'EOF'
//registry.npmjs.org/:_authToken=npm_SECRET_TOKEN_VALUE
EOF

cat > Dockerfile.buildkit <<'EOF'
# syntax=docker/dockerfile:1
FROM alpine:3.20
#  The secret is mounted for THIS RUN only. It is never a layer.
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    echo "token starts with: $(head -c 20 /root/.npmrc)" > /build-evidence.txt
CMD ["cat", "/build-evidence.txt"]
EOF

DOCKER_BUILDKIT=1 docker build -q --secret id=npmrc,src=.npmrc -t buildkit-safe:v1 -f Dockerfile.buildkit .

# The build USED it...
docker run --rm buildkit-safe:v1

# ...and it is nowhere in the image
docker history --no-trunc buildkit-safe:v1 | grep -c 'npm_SECRET' || echo "   not in history"
docker save buildkit-safe:v1 | tar -xO 2>/dev/null | strings 2>/dev/null | grep -c 'npm_SECRET_TOKEN_VALUE' || echo "   not in any layer"
```

** Checkpoint:** The build read the token, and the token is not in `history` or any layer. Compare that with `Dockerfile.baked` from Exercise 1.

```bash
rm -f .npmrc
```

Other BuildKit mount types worth knowing:

```dockerfile
RUN --mount=type=secret,id=aws,target=/root/.aws/credentials ...
RUN --mount=type=ssh git clone git@github.com:org/private.git     # forwards your agent
RUN --mount=type=cache,target=/root/.npm npm ci                    # not a secret, but the same idea
```

---

## Exercise 3: SOPS — Encrypted Secrets in Git

The GitOps problem: you want configuration in version control, but configuration contains secrets.

### Step 1: Install

```bash
# age — modern, simple encryption
curl -sL https://github.com/FiloSottile/age/releases/download/v1.2.0/age-v1.2.0-linux-amd64.tar.gz \
  | tar xz -C /tmp && sudo install /tmp/age/age /tmp/age/age-keygen /usr/local/bin/

# sops
curl -sLo /tmp/sops https://github.com/getsops/sops/releases/download/v3.9.0/sops-v3.9.0.linux.amd64
sudo install /tmp/sops /usr/local/bin/sops

sops --version && age --version
```

### Step 2: Generate a Key

```bash
mkdir -p ~/.config/sops/age
age-keygen -o ~/.config/sops/age/keys.txt 2>/dev/null || echo "(key already exists)"
chmod 600 ~/.config/sops/age/keys.txt

export SOPS_AGE_RECIPIENT=$(grep 'public key' ~/.config/sops/age/keys.txt | awk '{print $NF}')
echo "public key: $SOPS_AGE_RECIPIENT"
```

>`~/.config/sops/age/keys.txt` holds the **private** key. It never goes in git. In production the equivalent is a KMS key, and access to it is the real access control.

### Step 3: Configure and Encrypt

```bash
cat > .sops.yaml <<EOF
creation_rules:
  - path_regex: secrets/.*\.ya?ml$
    age: $SOPS_AGE_RECIPIENT
  - path_regex: .*\.enc\.ya?ml$
    age: $SOPS_AGE_RECIPIENT
    #  Encrypt only the values of keys matching this pattern
    encrypted_regex: '^(password|token|secret|key|.*_KEY|.*_SECRET)$'
EOF

mkdir -p secrets
cat > secrets/app.yaml <<'EOF'
environment: production
replicas: 3
database:
  host: db.internal
  port: 5432
  username: appuser
  password: SuperSecret-Prod-2026
api:
  endpoint: https://api.example.com
  token: sk-live-abc123def456
EOF

sops -e -i secrets/app.yaml
cat secrets/app.yaml
```

### Step 4: See What Is and Isn't Hidden

```bash
grep -E 'environment|replicas|host|port|username' secrets/app.yaml     #  still readable
grep -E 'password|token' secrets/app.yaml                              # ENC[AES256_GCM,...]
```

** Checkpoint:** Structure and non-sensitive values stay in plaintext, so the file **diffs meaningfully in a PR**. Only the secret values are encrypted. That's the property that makes SOPS usable in review — an all-or-nothing encrypted blob produces useless diffs.

### Step 5: Use It

```bash
sops -d secrets/app.yaml                                    # decrypt to stdout
sops -d --extract '["database"]["password"]' secrets/app.yaml; echo
sops secrets/app.yaml                                       # edit decrypted in $EDITOR, re-encrypt on save

# In an app or entrypoint
sops exec-env secrets/app.yaml 'echo "password is: $database_password"' 2>/dev/null \
  || sops -d --output-type json secrets/app.yaml | jq -r '.database.password'
```

### Step 6: Prove It's Safe to Commit

```bash
git init -q 2>/dev/null
git add .sops.yaml secrets/app.yaml && git commit -qm "add encrypted app secrets"

# A scanner finds nothing, because there is nothing to find
gitleaks detect --source . --no-banner 2>/dev/null && echo "   gitleaks: clean"
git show HEAD:secrets/app.yaml | grep -E 'password|token'
```

>SOPS supports `age`, AWS KMS, GCP KMS, Azure Key Vault, and PGP — and **multiple recipients at once**, which is how a team shares access. Adding a colleague is `sops updatekeys secrets/app.yaml` after adding their key to `.sops.yaml`. Revoking someone means removing their key **and rotating the secret**, because they could have decrypted it already.

---

## Exercise 4: Vault and Dynamic Credentials

The strongest pattern: the credential doesn't exist until it's needed, and expires on its own.

### Step 1: Run Vault and Postgres

```bash
cat > compose.yaml <<'YAML'
services:
  vault:
    image: hashicorp/vault:1.17
    cap_add: [IPC_LOCK]
    environment:
      VAULT_DEV_ROOT_TOKEN_ID: root-token-dev-only
      VAULT_DEV_LISTEN_ADDRESS: 0.0.0.0:8200
    ports: ["8200:8200"]

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: bootstrap-only
      POSTGRES_DB: appdb
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 10
YAML

docker compose up -d
sleep 12
export VAULT_ADDR=http://127.0.0.1:8200
export VAULT_TOKEN=root-token-dev-only
alias vault='docker compose exec -e VAULT_ADDR=http://127.0.0.1:8200 -e VAULT_TOKEN=root-token-dev-only vault vault'
vault status | head -6
```

>**Dev mode only.** It runs unsealed, in memory, with a fixed root token. A real Vault is sealed on start, needs unseal keys or auto-unseal, and root tokens are generated then revoked.

### Step 2: Static Secrets (KV v2)

```bash
vault kv put secret/myapp/prod db_password='S3cr3t' api_key='sk-live-xyz'
vault kv get secret/myapp/prod
vault kv get -field=db_password secret/myapp/prod        #  scriptable

vault kv put secret/myapp/prod db_password='RotatedPassword' api_key='sk-live-xyz'
vault kv metadata get secret/myapp/prod | head -12       #  versioned automatically
vault kv get -version=1 -field=db_password secret/myapp/prod
vault kv rollback -version=1 secret/myapp/prod
```

### Step 3: Dynamic Database Credentials

This is the part worth the setup.

```bash
vault secrets enable database

vault write database/config/appdb \
  plugin_name=postgresql-database-plugin \
  allowed_roles="readonly,readwrite" \
  connection_url="postgresql://{{username}}:{{password}}@postgres:5432/appdb?sslmode=disable" \
  username="postgres" \
  password="bootstrap-only"

vault write database/roles/readonly \
  db_name=appdb \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
                       GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
  default_ttl="2m" \
  max_ttl="10m"
```

```bash
#  Generate a credential that did not exist a second ago
vault read database/creds/readonly
```

```
Key                Value
---                -----
lease_id           database/creds/readonly/xY9...
lease_duration     2m
lease_renewable    true
password           A1a-8kZq...
username           v-root-readonly-xK2p8...
```

### Step 4: Watch It Expire

```bash
CREDS=$(vault read -format=json database/creds/readonly)
DBUSER=$(echo "$CREDS" | jq -r .data.username)
DBPASS=$(echo "$CREDS" | jq -r .data.password)
LEASE=$(echo "$CREDS" | jq -r .lease_id)
echo "issued: $DBUSER"

# It works now
docker compose exec -e PGPASSWORD="$DBPASS" postgres \
  psql -U "$DBUSER" -d appdb -c 'SELECT current_user, now();'

# The role really exists in Postgres
docker compose exec -e PGPASSWORD=bootstrap-only postgres \
  psql -U postgres -d appdb -c "\du" | grep -c "$DBUSER"

# Revoke early, or wait 2 minutes for the TTL
vault lease revoke "$LEASE"
sleep 3

docker compose exec -e PGPASSWORD="$DBPASS" postgres \
  psql -U "$DBUSER" -d appdb -c 'SELECT 1;' 2>&1 | tail -2
#    authentication failed — the role no longer exists

docker compose exec -e PGPASSWORD=bootstrap-only postgres \
  psql -U postgres -d appdb -c "\du" | grep -c "$DBUSER" || echo "   role removed from Postgres"
```

** Checkpoint:** Vault created a real Postgres role, handed you the credential, and **deleted the role** when the lease ended. A credential that leaks from a log or a crash dump is worthless two minutes later.

| | Static secret | Dynamic secret |
|---|--------------|----------------|
| Exists before it's requested | Yes |  **No** |
| Shared between consumers | Usually | Never — one per request |
| Rotation | Manual, coordinated, scary |  Automatic, continuous |
| Value of a leaked copy | Full, until someone notices | Expires in minutes |
| Attribution after an incident | "someone with the app password" |  The exact lease and requester |

### Step 5: Policies and App Auth

```bash
vault policy write myapp-read - <<'EOF'
path "secret/data/myapp/*"      { capabilities = ["read"] }
path "database/creds/readonly"  { capabilities = ["read"] }
EOF

vault auth enable approle
vault write auth/approle/role/myapp \
  token_policies="myapp-read" token_ttl=20m token_max_ttl=1h secret_id_ttl=10m

ROLE_ID=$(vault read -field=role_id auth/approle/role/myapp/role-id)
SECRET_ID=$(vault write -f -field=secret_id auth/approle/role/myapp/secret-id)
APP_TOKEN=$(vault write -field=token auth/approle/login role_id="$ROLE_ID" secret_id="$SECRET_ID")

# The app's token can read what it needs...
docker compose exec -e VAULT_ADDR=http://127.0.0.1:8200 -e VAULT_TOKEN="$APP_TOKEN" vault \
  vault kv get -field=db_password secret/myapp/prod

# ...and nothing else
docker compose exec -e VAULT_ADDR=http://127.0.0.1:8200 -e VAULT_TOKEN="$APP_TOKEN" vault \
  vault kv get secret/otherapp/prod 2>&1 | tail -2
```

>In Kubernetes you'd use the **Kubernetes auth method** instead of AppRole — the pod's ServiceAccount token *is* its Vault identity, so there's no bootstrap secret at all. That closes the "secret-zero" problem: with AppRole you still have to deliver the `secret_id` somehow.

---

## Exercise 5: The Rotation Drill

Rotation is a procedure, and an untested procedure doesn't work. Time yourself.

### Step 1: The Scenario

> A `git push` at 14:32 included `config/database.yml` containing the production Postgres password. The repository is public. It has been 6 minutes.

### Step 2: Run It

```bash
cat > rotation-drill.md <<'MD'
# Rotation Drill — Production DB Password

Start time: ____

## 1. ROTATE (target: < 15 min)    FIRST. Always first.
- [ ] Generate a new credential
- [ ] Deploy it to every consumer (list them — this is where drills find gaps)
- [ ] Verify the application works on the new credential
- [ ] Revoke the old one
- [ ] Confirm the old one now FAILS

## 2. ASSESS (in parallel)
- [ ] When was it pushed? How long was it exposed?
- [ ] Was the repo public? Forked? Indexed?
- [ ] Check the audit log for use from unknown sources
- [ ] Any data accessed that shouldn't have been?

## 3. CLEAN UP (hygiene, not remediation)
- [ ] git filter-repo to purge from history
- [ ] Force-push; every collaborator re-clones
- [ ] Ask the host to purge cached views and fork references

## 4. PREVENT
- [ ] Pre-commit secret scan
- [ ] Server-side push protection
- [ ] Move this secret to a manager so the next one is dynamic

## Findings
- Consumers I forgot about: ____
- Time to rotate:           ____
- What made it slow:        ____
MD
```

### Step 3: Practise Against Vault

```bash
# The "leaked" credential
vault kv get -field=db_password secret/myapp/prod

# ── ROTATE ──
NEW_PASS=$(openssl rand -base64 24)
vault kv put secret/myapp/prod db_password="$NEW_PASS" api_key='sk-live-xyz'

# Consumers pick it up on their next read — no redeploy needed
vault kv get -field=db_password secret/myapp/prod

# ── VERIFY the old value is gone from the current version ──
vault kv get -version=1 -field=db_password secret/myapp/prod    # still in history…
vault kv metadata delete secret/myapp/prod                       # …destroy every version
vault kv get secret/myapp/prod 2>&1 | tail -1
```

**Time each phase.** The number that matters is **time-to-rotate**, and the thing drills reliably find is a consumer nobody remembered — a cron job, a BI tool, a partner integration.

>**Rotation is the fix. History rewriting is cleanup.** A secret is compromised the moment it reaches a remote: bots scan public GitHub within seconds, and forks, clones, CI caches and cached web views all keep copies you cannot reach. An engineer who purges history and skips rotation has done the visible work and none of the useful work.

---

## Break It: Four Secret-Management Failures

### Scenario 1: The Secret in the Log

**Break it:**

```bash
cat > leaky-app.sh <<'SH'
#!/usr/bin/env bash
set -x                                  #  traces every command, with its arguments
DB_PASSWORD="${DB_PASSWORD:-fallback-secret}"
echo "connecting..."
curl -s -u "admin:$DB_PASSWORD" http://localhost:9999/health 2>/dev/null || true
SH
chmod +x leaky-app.sh
DB_PASSWORD='sk-live-REAL-SECRET' ./leaky-app.sh 2>&1 | tee app.log
grep -c 'sk-live-REAL-SECRET' app.log
```

**Symptom:** The password is in the log, in plaintext, twice. That log goes to your centralised logging stack (Module 08), gets indexed, replicated, retained for 90 days, and is readable by everyone with Kibana access.

**Investigate — where else does this happen:**

```bash
grep -rn 'set -x' . 2>/dev/null | head
ps auxww | grep -i 'password\|token' | grep -v grep | head    #  CLI args are world-readable via ps
docker compose logs 2>&1 | grep -ciE 'password|token|secret' || echo "   compose logs clean"
```

**Root cause:** Four common paths — `set -x`, passing secrets as command-line arguments (visible in `ps` to **every user on the host**), verbose HTTP client logging, and unhandled exceptions that dump the environment.

**Fix:**

```bash
cat > safe-app.sh <<'SH'
#!/usr/bin/env bash
set -Eeuo pipefail
: "${DB_PASSWORD:?DB_PASSWORD is required}"

# Disable tracing around anything that touches the secret
run_authenticated() {
  { set +x; } 2>/dev/null
  #  Pass via stdin or a file, NEVER as an argument — argv is public
  curl -s --config <(printf 'user = "admin:%s"\n' "$DB_PASSWORD") http://localhost:9999/health
  local rc=$?
  return $rc
}
run_authenticated || echo "request failed (no secret printed)"
SH
chmod +x safe-app.sh
```

| Path | Guard |
|------|-------|
| `set -x` | `{ set +x; } 2>/dev/null` around secret-handling code |
| CLI arguments |  stdin, a file, or an env var — never `argv` |
| Verbose HTTP logs | Redact `Authorization` headers before logging |
| Exception handlers | Never log the whole environment |
| CI output | `::add-mask::$VALUE` in Actions; `no_log: true` in Ansible; `sensitive` in Terraform |

```bash
rm -f app.log leaky-app.sh safe-app.sh
```

---

### Scenario 2: Kubernetes Secrets Are Not Encrypted

**Break it:**

```bash
# Simulate what a Kubernetes Secret actually is
echo -n 'SuperSecretProdPassword' | base64
echo 'U3VwZXJTZWNyZXRQcm9kUGFzc3dvcmQ=' | base64 -d; echo
```

**Symptom:** Base64 is **encoding, not encryption**. It exists so binary data survives YAML, not to protect anything. Anyone who can read the Secret object — or read etcd, or read a backup of etcd — has the plaintext.

**Investigate (on a real cluster):**

```bash
# Anyone with `get secret` RBAC:
#   kubectl get secret db -o jsonpath='{.data.password}' | base64 -d
#
# Who has it?
#   for sa in $(kubectl get sa -o name); do
#     echo "$sa $(kubectl auth can-i get secrets --as=system:serviceaccount:default:${sa#*/})"
#   done
#
# Is encryption at rest even on? (self-managed clusters)
#   ps aux | grep kube-apiserver | grep -o 'encryption-provider-config=[^ ]*'
```

**Root cause:** Two compounding facts. Secrets are stored in etcd **unencrypted by default**, and the built-in `edit` ClusterRole — the standard grant for a dev team — **includes** Secrets.

**Fix — in increasing order of strength:**

```yaml
# 1. Encryption at rest on the API server
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources: ["secrets"]
    providers:
      - aescbc: { keys: [{ name: key1, secret: <base64 32-byte key> }] }
      - identity: {}
```

```bash
# 2. Sealed Secrets — safe to commit, decryptable only by the cluster controller
#    kubectl create secret generic db --from-literal=password=x --dry-run=client -o yaml \
#      | kubeseal --format yaml > sealed-db.yaml     #  commit THIS

# 3.  External Secrets Operator — the plaintext never enters git OR etcd long-term
```

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata: { name: db-creds }
spec:
  refreshInterval: 1h                 #  picks up rotation automatically
  secretStoreRef: { name: vault-backend, kind: SecretStore }
  target: { name: db-creds }
  data:
    - secretKey: password
      remoteRef: { key: secret/myapp/prod, property: db_password }
```

>Combine this with Vault's dynamic credentials and the Kubernetes Secret holds a value that expires on its own. That's the strongest commonly-available posture: nothing permanent in git, nothing permanent in etcd.

---

### Scenario 3: The Encrypted File Anyone Can Decrypt

**Break it:**

```bash
cd secrets-lab 2>/dev/null || cd .
# The private key committed alongside the encrypted file
cp ~/.config/sops/age/keys.txt ./age-key.txt
git add -f age-key.txt 2>/dev/null && git commit -qm "add key for CI" 2>/dev/null
ls -l age-key.txt secrets/app.yaml

SOPS_AGE_KEY_FILE=./age-key.txt sops -d secrets/app.yaml | grep password
```

**Symptom:** The encryption is intact and completely pointless — the decryption key is in the same repository. This happens because someone needed CI to decrypt and took the shortest path.

**Investigate:**

```bash
git log --all --diff-filter=A --name-only --pretty=format: 2>/dev/null \
  | sort -u | grep -iE '\.(key|pem|p12|pfx)$|keys?\.txt|age-key' | head
gitleaks detect --source . --no-banner 2>/dev/null || echo "   gitleaks flagged the private key"
```

**Root cause:** Encryption relocates the problem from "protect the secret" to "protect the key". If the key travels with the ciphertext, you've achieved nothing.

**Fix:**

```bash
git rm --cached age-key.txt -q 2>/dev/null
rm -f age-key.txt
cat >> .gitignore <<'EOF'
*.key
*.pem
age-key*.txt
keys.txt
EOF
git add .gitignore && git commit -qm "never commit private keys" 2>/dev/null
```

| Where the key lives | Verdict |
|---------------------|---------|
| Committed next to the ciphertext |  Pointless |
| A CI secret variable |  Works, but it's a long-lived secret you must protect |
| **KMS** (AWS/GCP/Azure) |  The key never leaves the HSM; access is IAM-controlled and audited |
| **OIDC → KMS**, no stored key at all |  CI proves its identity, then decrypts. Nothing to leak |

```yaml
# .sops.yaml with KMS — access control becomes an IAM question, and it's logged
creation_rules:
  - path_regex: secrets/.*\.yaml$
    kms: 'arn:aws:kms:us-east-1:123456789012:key/abcd-1234'
```

>**The question to ask of any secrets scheme**: *"who can decrypt this, and how would I know if they did?"* With a committed key: everyone, and never. With KMS: whoever IAM allows, and every decrypt is in CloudTrail.

---

### Scenario 4: The Secret That Was Never Rotated

**Break it:**

```bash
cat > audit-secret-age.sh <<'SH'
#!/usr/bin/env bash
# How old is every secret you have?
echo "── Vault KV ──"
for p in myapp/prod; do
  created=$(vault kv metadata get -format=json "secret/$p" 2>/dev/null | jq -r '.data.created_time' 2>/dev/null)
  [ -n "$created" ] && [ "$created" != "null" ] && echo "  secret/$p  created: $created"
done
echo "── AWS access keys ──"
echo "  aws iam get-credential-report | ... (see Module 09 Lab 02)"
echo "── K8s Secrets ──"
echo "  kubectl get secrets -A -o json | jq -r '.items[] | \"\(.metadata.creationTimestamp) \(.metadata.namespace)/\(.metadata.name)\"' | sort"
SH
chmod +x audit-secret-age.sh && ./audit-secret-age.sh
```

**Symptom:** In most organisations, running this reveals credentials created years ago that have never changed — surviving multiple staff departures, laptop losses, and vendor breaches. Nobody knows who has copies.

**Investigate — the questions nobody can answer:**

```
For each long-lived secret:
  □ Who has ever had access to it?
  □ Has anyone who left the company had it?
  □ Is it in an old backup, a Slack message, a wiki page, a screenshot?
  □ How long would rotating it take, and what would break?
  □  Would you know if someone else were using it right now?
```

**Root cause:** Rotation is manual, coordinated, and risky, so it gets deferred — and the longer it's deferred the riskier it feels, which defers it further.

**Fix — reduce the cost of rotation until it isn't a decision:**

| Approach | Rotation cost |
|----------|--------------|
| Password in a config file | Hours, coordinated, scary |
| Password in a secret manager | Minutes — consumers re-read |
| **Managed rotation** (AWS Secrets Manager + Lambda) |  Zero — scheduled, automatic |
| **Dynamic credentials** (Vault) |  N/A — nothing lives long enough to rotate |

```bash
# AWS Secrets Manager: rotation as configuration
# aws secretsmanager rotate-secret --secret-id prod/db \
#   --rotation-lambda-arn arn:aws:lambda:... \
#   --rotation-rules AutomaticallyAfterDays=30

# Alert on staleness
# aws secretsmanager list-secrets \
#   --query 'SecretList[?LastRotatedDate==null].[Name,CreatedDate]' --output table
```

```bash
rm -f audit-secret-age.sh
```

---

### Summary

| Failure | Detection | Prevention |
|---------|-----------|------------|
| Secret in a log | `grep` your own logs for known values | `set +x`, never in `argv`, mask in CI |
| Base64 ≠ encryption | Anyone with `get secret` reads it | Encryption at rest + External Secrets |
| Key committed with ciphertext | Scan history for `*.key`, `keys.txt` | KMS, or OIDC → KMS |
| Never rotated | Audit creation dates | Managed rotation, or dynamic credentials |

**The decision table:**

| Situation | Use |
|-----------|-----|
| Secret needed during a **build** |  BuildKit `--mount=type=secret` |
| Config in git for **GitOps** |  SOPS + KMS, or Sealed Secrets |
| App needs a **database** credential |  Vault dynamic secrets |
| App needs a **third-party API key** | Secret manager + scheduled rotation |
| **CI** needs cloud access |  OIDC — no stored credential at all |
| Local development | `.env` in `.gitignore`, with fake values |

>**The single question to judge any scheme by**: *how long is a leaked copy useful?* Forever → you have a problem, whatever the encryption. Fifteen minutes → the leak is an inconvenience.

**Write this up** in `failure-notes.md`.

---

## Cleanup

```bash
cd secrets-lab 2>/dev/null || true
docker compose down -v 2>/dev/null
docker rm -f leak-baked leak-env leak-file leak-tmpfs 2>/dev/null
docker rmi leak-baked:v1 buildkit-safe:v1 2>/dev/null
cd .. && rm -rf secrets-lab

# Keep your age key if you'll use SOPS again, or:
# rm -f ~/.config/sops/age/keys.txt

docker ps -a | grep -E 'leak-|vault|postgres' || echo " nothing left running"
```

---

## Validation

- [ ] Name the four delivery mechanisms and where each one leaks
- [ ] Explain why `ARG` is not a secret mechanism
- [ ] Use a BuildKit secret and prove it isn't in `docker history` or any layer
- [ ] Encrypt a file with SOPS so it still produces a readable PR diff
- [ ] Explain why `encrypted_regex` matters for reviewability
- [ ] Issue a dynamic database credential and demonstrate it expiring
- [ ] Compare static and dynamic secrets on rotation cost and leak value
- [ ] Explain why a Kubernetes Secret is not encrypted, and name two fixes
- [ ] Explain why a key committed beside its ciphertext defeats encryption
- [ ] State the rotation order and why rotation precedes history rewriting

---

## What to Commit

- The SOPS-encrypted `secrets/app.yaml` and `.sops.yaml` ( **never** the age key)
- Your Vault policy and database role definitions
- Terminal output showing a dynamic credential working, then failing after revocation
- Your completed `rotation-drill.md`, including the consumers you'd forgotten
- `failure-notes.md` covering all four scenarios

---

[← Previous Lab: Security Scanning](./lab-01-security-scanning.md) | [Back to Module README](../README.md) | [Next Lab: Supply Chain Security →](./lab-03-supply-chain-security.md)

---

# Lab 03: Supply Chain Security

## Objective

Answer three questions about the software you ship: **what is actually in it**, **did we really build it**, and **can anything else get deployed**. You'll generate an SBOM, sign an image and verify the signature, pin dependencies so a build is reproducible, and set up an admission policy that refuses unsigned images — closing the loop from build to runtime.

This closes the biggest gap in Lab 01: scanning tells you about *known* vulnerabilities in *recognised* packages. Supply chain security is about knowing what you have in the first place.

---

## Prerequisites

- Completed [Lab 01: Security Scanning](./lab-01-security-scanning.md) and [Lab 02: Secrets Management](./lab-02-secrets-management.md)
- Docker with BuildKit
- A local registry (started below) — no external account needed

```bash
docker --version && docker buildx version
```

---

## Deliverables and Evidence

- An SBOM for an image you built, and the count of components the CVE scanner *couldn't* see
- A signed image, a successful verification, and a **failed** verification on a tampered image
- A build pinned by digest, demonstrated to be reproducible
- An admission policy rejecting an unsigned image
- `failure-notes.md`

---

## Lab Files

Reference copies are in [`../code/lab-03/`](../code/lab-03/).

```bash
cp -r /path/to/the-devops-handbook/13-security-basics/code/lab-03/. .
```

---

## Exercise 1: What Is Actually In Your Image?

### Step 1: Set Up

```bash
mkdir -p supply-chain-lab && cd supply-chain-lab

# A local registry, so nothing leaves your machine
docker run -d -p 5000:5000 --name registry --restart=unless-stopped registry:2 >/dev/null
sleep 3
curl -s http://localhost:5000/v2/_catalog
```

### Step 2: Build Something Realistically Messy

```bash
mkdir -p app
cat > app/requirements.txt <<'EOF'
flask==3.0.0
requests==2.31.0
pyyaml==6.0.1
EOF

cat > app/main.py <<'EOF'
from flask import Flask
app = Flask(__name__)

@app.get("/health")
def health():
    return {"status": "ok"}
EOF

cat > Dockerfile <<'EOF'
FROM python:3.12-slim
WORKDIR /app
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# A vendored binary — the way real applications actually acquire dependencies
RUN mkdir -p /app/vendor && \
    echo "#!/bin/sh" > /app/vendor/legacy-tool && \
    echo "echo 'legacy-tool v1.2.3'" >> /app/vendor/legacy-tool && \
    chmod +x /app/vendor/legacy-tool
COPY app/ .
RUN useradd -r -u 10001 appuser && chown -R appuser /app
USER 10001
CMD ["python", "main.py"]
EOF

docker build -q -t localhost:5000/demo-app:v1 .
docker push -q localhost:5000/demo-app:v1
```

### Step 3: Generate an SBOM

```bash
# syft
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /tmp
sudo install /tmp/syft /usr/local/bin/ 2>/dev/null || export PATH="/tmp:$PATH"
syft version

syft localhost:5000/demo-app:v1 -o table | head -25
syft localhost:5000/demo-app:v1 -o spdx-json > sbom.spdx.json
syft localhost:5000/demo-app:v1 -o cyclonedx-json > sbom.cdx.json
```

### Step 4: Compare the SBOM With What the Scanner Sees

```bash
TOTAL=$(jq '[.packages[]] | length' sbom.spdx.json)
echo "SBOM components: $TOTAL"

jq -r '[.packages[].externalRefs[]?.referenceLocator] | map(select(startswith("pkg:")))
       | map(split("/")[0] | sub("pkg:";"")) | group_by(.) | map({(.[0]): length}) | add' sbom.spdx.json

# What the CVE scanner examined
trivy image --format json localhost:5000/demo-app:v1 2>/dev/null \
  | jq '[.Results[].Packages[]?] | length' 2>/dev/null

#  The vendored binary — in the image, in no package database
docker run --rm localhost:5000/demo-app:v1 /app/vendor/legacy-tool
grep -c 'legacy-tool' sbom.spdx.json || echo "    the vendored binary is NOT in the SBOM either"
```

** Checkpoint:** You now have a concrete number for what the tooling can and can't see. `legacy-tool` runs inside the container and appears in neither the SBOM nor the scan — because neither can identify a shell script someone dropped in.

| Format | Use for |
|--------|---------|
| **SPDX** | Compliance, licence reporting, US federal (EO 14028) |
| **CycloneDX** |  Security tooling, VEX, dependency-track |
| **syft-json** | Richest detail; syft-specific |

### Step 5: Why an SBOM Is Worth Keeping

The value isn't at build time — it's the day a new CVE drops.

```bash
# Scan the SBOM instead of re-pulling and re-analysing every image
trivy sbom sbom.cdx.json 2>/dev/null | head -20

#  "Is log4j anywhere in our estate?" — answerable in seconds across thousands of images
jq -r '.packages[] | select(.name | test("flask|requests"; "i")) | "\(.name) \(.versionInfo)"' sbom.spdx.json
```

>**The Log4Shell test.** In December 2021 the question that mattered was "which of our services ship log4j, and which version?" Organisations with SBOMs answered in minutes. Organisations without spent weeks. Generate an SBOM per build, store it beside the image, and that question becomes a `jq` query.

---

## Exercise 2: Signing and Verification

An SBOM says what's inside. A signature says **who built it** and that **nobody changed it since**.

### Step 1: Install cosign

```bash
curl -sLo /tmp/cosign https://github.com/sigstore/cosign/releases/download/v2.4.0/cosign-linux-amd64
sudo install /tmp/cosign /usr/local/bin/cosign
cosign version | head -3
```

### Step 2: Sign With a Key Pair

```bash
COSIGN_PASSWORD="" cosign generate-key-pair
ls -l cosign.key cosign.pub

DIGEST=$(docker inspect localhost:5000/demo-app:v1 --format '{{index .RepoDigests 0}}' 2>/dev/null \
         || crane digest localhost:5000/demo-app:v1 2>/dev/null)
echo "signing: $DIGEST"

COSIGN_PASSWORD="" cosign sign --key cosign.key --yes --allow-insecure-registry \
  localhost:5000/demo-app:v1
```

### Step 3: Verify

```bash
cosign verify --key cosign.pub --allow-insecure-registry localhost:5000/demo-app:v1 2>&1 | tail -12
```

```
Verification for localhost:5000/demo-app:v1 --
The following checks were performed:
  - The cosign claims were validated
  - The signatures were verified against the specified public key
```

### Step 4: Watch Verification Fail

```bash
# Build a DIFFERENT image and push it to the same tag — a registry compromise, or a
# careless overwrite by another pipeline
cat > Dockerfile.evil <<'EOF'
FROM python:3.12-slim
RUN echo "malicious payload" > /tmp/pwned
CMD ["sleep", "3600"]
EOF
docker build -q -t localhost:5000/demo-app:v1 -f Dockerfile.evil .
docker push -q localhost:5000/demo-app:v1

cosign verify --key cosign.pub --allow-insecure-registry localhost:5000/demo-app:v1 2>&1 | tail -4
#    "no matching signatures" — the tag now points at an unsigned image
```

** Checkpoint:** Signature verification is what makes a **tag** trustworthy. Without it, a mutable tag means whoever can push to the registry decides what runs in production.

```bash
# Rebuild and re-sign the real one
docker build -q -t localhost:5000/demo-app:v1 . && docker push -q localhost:5000/demo-app:v1
COSIGN_PASSWORD="" cosign sign --key cosign.key --yes --allow-insecure-registry localhost:5000/demo-app:v1
```

### Step 5: Keyless Signing

Managing a private key reintroduces the problem from Lab 02. Keyless signing removes it.

```bash
# In CI, with OIDC available, no key exists at all:
#   cosign sign --yes ghcr.io/myorg/app@sha256:...
#
# The identity comes from the CI OIDC token; the signature and a short-lived
# certificate go to the public Rekor transparency log.
#
# Verification asserts WHO signed it:
#   cosign verify \
#     --certificate-identity-regexp 'https://github.com/myorg/.*' \
#     --certificate-oidc-issuer https://token.actions.githubusercontent.com \
#     ghcr.io/myorg/app@sha256:...
```

| | Key-based | Keyless (Sigstore) |
|---|-----------|-------------------|
| Private key to protect |  Yes |  None |
| Identity proven | "whoever holds the key" |  "this repo, this workflow, this ref" |
| Revocation | Rotate the key, re-sign everything | Certificate expires in minutes |
| Audit trail | Whatever you build |  Public Rekor transparency log |
| Works offline | Yes | Needs Fulcio/Rekor |

### Step 6: Attach the SBOM as an Attestation

```bash
COSIGN_PASSWORD="" cosign attest --key cosign.key --yes --allow-insecure-registry \
  --predicate sbom.spdx.json --type spdxjson localhost:5000/demo-app:v1

cosign verify-attestation --key cosign.pub --allow-insecure-registry \
  --type spdxjson localhost:5000/demo-app:v1 2>&1 | tail -3
```

>An **attestation** is a signed statement *about* an artifact. Beyond the SBOM you can attest the scan results, the test results, the build provenance (SLSA), and a manual approval. Admission control can then require them: *"only run images that have a signed SBOM, a scan with no CRITICALs, and a provenance statement naming our CI."*

---

## Exercise 3: Pinning and Reproducibility

### Step 1: See Why Tags Aren't Enough

```bash
docker pull -q python:3.12-slim
docker inspect python:3.12-slim --format '{{index .RepoDigests 0}}'
```

The tag `3.12-slim` points at a different image today than it did last month. Every rebuild silently picks up a new base — usually good (security patches), occasionally a breaking change you didn't ask for, and at worst a compromised upstream.

### Step 2: Pin by Digest

```bash
BASE_DIGEST=$(docker inspect python:3.12-slim --format '{{index .RepoDigests 0}}' | cut -d@ -f2)
echo "pinning to: $BASE_DIGEST"

cat > Dockerfile.pinned <<EOF
#  Immutable: this digest can never point at different content
FROM python:3.12-slim@$BASE_DIGEST
WORKDIR /app
COPY app/requirements.txt .
RUN pip install --no-cache-dir --require-hashes -r requirements.txt 2>/dev/null \
 || pip install --no-cache-dir -r requirements.txt
COPY app/ .
RUN useradd -r -u 10001 appuser && chown -R appuser /app
USER 10001
CMD ["python", "main.py"]
EOF

docker build -q -t localhost:5000/demo-app:pinned -f Dockerfile.pinned .
```

### Step 3: Pin Dependencies Too

A pinned base image with unpinned Python packages is only half-pinned.

```bash
pip install --quiet pip-tools 2>/dev/null || python3 -m pip install --quiet --user pip-tools 2>/dev/null

cat > app/requirements.in <<'EOF'
flask
requests
pyyaml
EOF

#  Generates every transitive dependency with a SHA256 hash
pip-compile --generate-hashes --quiet --output-file app/requirements.lock app/requirements.in 2>/dev/null \
  && head -20 app/requirements.lock \
  || echo "(pip-tools unavailable — the pattern is what matters)"
```

```
# requirements.lock (generated)
flask==3.0.3 \
    --hash=sha256:34e815dfaa43340d1d15a5c3a02b8476004037eb4840b34910c6e21679d288f3 \
    --hash=sha256:...
```

With `--require-hashes`, pip refuses any package whose content doesn't match — so a compromised PyPI mirror or a hijacked package version cannot substitute different code.

| Ecosystem | Lockfile | Hash verification |
|-----------|----------|-------------------|
| Python | `requirements.lock` (pip-tools), `poetry.lock`, `uv.lock` | `--require-hashes` |
| Node | `package-lock.json`, `pnpm-lock.yaml` | `npm ci`  (not `npm install`) |
| Go | `go.sum` |  Automatic, plus the checksum database |
| Rust | `Cargo.lock` | Automatic |
| Terraform | `.terraform.lock.hcl` | Automatic |
| Docker base | `FROM image@sha256:...` | Automatic |
| GH Actions | `uses: org/action@<full-sha>` |  Tags are mutable — pin the SHA |

### Step 4: Prove Reproducibility

```bash
docker build -q -t localhost:5000/demo-app:build1 -f Dockerfile.pinned . >/dev/null
docker build -q --no-cache -t localhost:5000/demo-app:build2 -f Dockerfile.pinned . >/dev/null

# The layer that matters — the dependency install
docker history --no-trunc --format '{{.Size}}\t{{.CreatedBy}}' localhost:5000/demo-app:build1 | grep pip | head -1
docker history --no-trunc --format '{{.Size}}\t{{.CreatedBy}}' localhost:5000/demo-app:build2 | grep pip | head -1
```

>Byte-identical image digests require more work (timestamps, file ordering, `SOURCE_DATE_EPOCH`), which is what the *reproducible builds* movement is about. **Dependency reproducibility** — the same inputs producing the same package versions — is achievable today with lockfiles and digests, and it's where the security value is.

---

## Exercise 4: Enforce It at Deploy Time

Signing is worthless if nothing checks the signature.

### Step 1: The Verification Gate as a Script

```bash
cat > verify-before-deploy.sh <<'SH'
#!/usr/bin/env bash
# Run before every deploy. Exits non-zero if the image is not trustworthy.
set -uo pipefail

IMAGE="${1:?usage: verify-before-deploy.sh <image>}"
PUBKEY="${COSIGN_PUBKEY:-cosign.pub}"
FAIL=0

echo "── 1. signature ──"
if cosign verify --key "$PUBKEY" --allow-insecure-registry "$IMAGE" >/dev/null 2>&1; then
  echo "   signed and verified"
else
  echo "   NOT signed by our key"; FAIL=1
fi

echo "── 2. SBOM attestation ──"
if cosign verify-attestation --key "$PUBKEY" --allow-insecure-registry \
     --type spdxjson "$IMAGE" >/dev/null 2>&1; then
  echo "   SBOM attestation present"
else
  echo "    no SBOM attestation"; FAIL=1
fi

echo "── 3. vulnerabilities ──"
if trivy image --quiet --severity CRITICAL --exit-code 1 --ignore-unfixed "$IMAGE" >/dev/null 2>&1; then
  echo "   no fixable CRITICALs"
else
  echo "   fixable CRITICAL vulnerabilities present"; FAIL=1
fi

echo "── 4. pinned by digest ──"
if [[ "$IMAGE" == *"@sha256:"* ]]; then
  echo "   digest-pinned"
else
  echo "    deploying a mutable TAG — the content can change under you"
fi

exit $FAIL
SH
chmod +x verify-before-deploy.sh

./verify-before-deploy.sh localhost:5000/demo-app:v1; echo "exit=$?"
./verify-before-deploy.sh localhost:5000/demo-app:pinned; echo "exit=$?"    # unsigned → fails
```

** Checkpoint:** `demo-app:v1` passes, `demo-app:pinned` fails because it was never signed. That's a gate you can put in front of any deploy.

### Step 2: Admission Control in Kubernetes

A script protects your pipeline. Admission control protects the **cluster** — including from anyone who bypasses the pipeline.

```bash
cat > kyverno-verify-images.yaml <<'YAML'
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: verify-image-signatures
spec:
  validationFailureAction: Enforce        # Audit first, then Enforce
  background: false
  rules:
    - name: require-signature
      match:
        any:
          - resources:
              kinds: [Pod]
              namespaces: ["production", "staging"]
      verifyImages:
        - imageReferences: ["ghcr.io/myorg/*"]
          mutateDigest: true              #  rewrites the tag to the verified digest
          required: true
          attestors:
            - entries:
                - keyless:
                    subject: "https://github.com/myorg/*"
                    issuer: "https://token.actions.githubusercontent.com"

    - name: require-sbom-attestation
      match:
        any:
          - resources:
              kinds: [Pod]
              namespaces: ["production"]
      verifyImages:
        - imageReferences: ["ghcr.io/myorg/*"]
          attestations:
            - predicateType: https://spdx.dev/Document
              attestors:
                - entries:
                    - keyless:
                        subject: "https://github.com/myorg/*"
                        issuer: "https://token.actions.githubusercontent.com"

    - name: no-latest-tag
      match:
        any:
          - resources:
              kinds: [Pod]
      validate:
        message: "Deploy an immutable digest, not a mutable tag."
        pattern:
          spec:
            containers:
              - image: "*@sha256:*"
YAML
python3 -c "import yaml,sys; list(yaml.safe_load_all(open('kyverno-verify-images.yaml'))); print(' valid policy YAML')"
```

>**`mutateDigest: true` is the subtle, important one.** Kyverno resolves the tag to the digest it verified and rewrites the pod spec. Without it there's a time-of-check-to-time-of-use gap: you verify `:v1`, and by the time the kubelet pulls, `:v1` points somewhere else.

### Step 3: The Full Pipeline

```yaml
# .github/workflows/secure-build.yml
permissions:
  contents: read
  packages: write
  id-token: write          #  keyless signing needs this

steps:
  - uses: actions/checkout@v4

  - name: Secret scan (full history)
    uses: gitleaks/gitleaks-action@v2

  - name: Dependency + IaC + secret scan of the source
    run: trivy fs --scanners vuln,secret,misconfig --exit-code 1 --severity HIGH,CRITICAL .

  - name: SAST
    run: semgrep --config=auto --error .

  - id: build
    uses: docker/build-push-action@v6
    with:
      push: true
      tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
      provenance: true          #  SLSA build provenance
      sbom: true

  #  Everything below operates on the DIGEST, never the tag
  - name: Scan the built image
    run: trivy image --exit-code 1 --severity CRITICAL --ignore-unfixed
         ghcr.io/${{ github.repository }}@${{ steps.build.outputs.digest }}

  - name: Generate SBOM
    run: syft ghcr.io/${{ github.repository }}@${{ steps.build.outputs.digest }} -o spdx-json > sbom.json

  - uses: sigstore/cosign-installer@v3
  - name: Sign and attest — keyless
    run: |
      IMG=ghcr.io/${{ github.repository }}@${{ steps.build.outputs.digest }}
      cosign sign --yes "$IMG"
      cosign attest --yes --predicate sbom.json --type spdxjson "$IMG"

  - name: Deploy the verified digest
    run: kubectl set image deploy/app app=ghcr.io/${{ github.repository }}@${{ steps.build.outputs.digest }}
```

| Control | What it stops |
|---------|--------------|
| Secret scan | Credentials reaching the remote |
| Dependency scan | Known-vulnerable libraries |
| SAST | Your own code's flaws |
| Image scan **on the digest** | Vulnerabilities in what you actually built |
| SBOM | Not knowing what you shipped when the next CVE lands |
| Provenance | "Which commit and workflow produced this?" |
| Signature | A registry compromise, or a tag overwrite |
| Admission control | Anything that bypassed all of the above |

---

## Break It: Four Supply Chain Failures

### Scenario 1: The Mutable Tag

**Break it:**

```bash
cd supply-chain-lab
docker build -q -t localhost:5000/svc:v1.0.0 . && docker push -q localhost:5000/svc:v1.0.0
GOOD=$(crane digest localhost:5000/svc:v1.0.0 2>/dev/null || \
       docker inspect localhost:5000/svc:v1.0.0 --format '{{index .RepoDigests 0}}' | cut -d@ -f2)
echo "released digest: $GOOD"

# A release tag is supposed to be immutable. Nothing enforces that.
docker build -q -t localhost:5000/svc:v1.0.0 -f Dockerfile.evil . && docker push -q localhost:5000/svc:v1.0.0
NOW=$(crane digest localhost:5000/svc:v1.0.0 2>/dev/null || \
      docker inspect localhost:5000/svc:v1.0.0 --format '{{index .RepoDigests 0}}' | cut -d@ -f2)
echo "digest now:      $NOW"
[ "$GOOD" != "$NOW" ] && echo "   v1.0.0 now points at DIFFERENT content"
```

**Symptom:** `v1.0.0` is a different image than the one you tested, reviewed, and released. Every node that pulls it from now on runs something else — and your manifests, your changelog and your audit trail all still say `v1.0.0`.

**Investigate:**

```bash
curl -s http://localhost:5000/v2/svc/tags/list | jq
docker run --rm localhost:5000/svc:v1.0.0 cat /tmp/pwned 2>/dev/null && echo "   running the substituted image"
```

**Root cause:** Tags are mutable pointers. Anyone with push access — a compromised CI token, a mistaken pipeline, a malicious insider — can repoint one, and nothing about the reference changes.

**Fix:**

```bash
# 1. Deploy digests, not tags
echo "deploy: localhost:5000/svc@$GOOD"

# 2. Enable registry tag immutability
#    ECR:  aws ecr put-image-tag-mutability --repository-name svc --image-tag-mutability IMMUTABLE
#    GHCR/Harbor/Artifactory: immutable tag rules in the repo settings

# 3. Sign, and verify at admission — a substituted image has no valid signature
```

```yaml
#  In Kubernetes, always:
image: ghcr.io/myorg/svc@sha256:abc123...
# never:
image: ghcr.io/myorg/svc:v1.0.0
```

>Tags are for humans. **Digests are for machines.** Let CI resolve the tag to a digest once, then carry the digest through scanning, signing, and deployment. Everything downstream is then referring to the same bytes.

---

### Scenario 2: Typosquatting

**Break it:**

```bash
cat > requirements-typo.txt <<'EOF'
flask==3.0.0
requsts==2.31.0
python-dateutil==2.8.2
EOF
grep -n 'requsts' requirements-typo.txt
```

**Symptom:** `requsts` (missing the `e`) is a plausible typo. On a public index, names one edit away from popular packages get registered by attackers. `pip install` finds it, installs it, and runs its `setup.py` — **arbitrary code execution during the build**, before any scanner sees the image.

**Investigate:**

```bash
# Compare declared dependencies against what you actually intended
python3 - <<'PY'
POPULAR = {"requests","flask","django","numpy","pandas","urllib3","boto3","pyyaml","cryptography"}
def dist(a, b):
    if abs(len(a)-len(b)) > 2: return 9
    prev = list(range(len(b)+1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j]+1, cur[j-1]+1, prev[j-1] + (ca != cb)))
        prev = cur
    return prev[-1]

for line in open("requirements-typo.txt"):
    name = line.split("==")[0].strip()
    if not name or name in POPULAR: continue
    for p in POPULAR:
        if 0 < dist(name, p) <= 2:
            print(f"    '{name}' is {dist(name,p)} edit(s) from '{p}' — typosquat?")
PY
```

**Root cause:** Public package indexes allow anyone to register any unclaimed name. Related attacks: **dependency confusion** (an attacker publishes your *internal* package name publicly at a higher version, and your resolver prefers it), and **maintainer compromise** of a legitimate package.

**Fix:**

```bash
rm -f requirements-typo.txt
```

| Control | Stops |
|---------|-------|
|  **Lockfile with hashes** | Any substitution, including a hijacked version of the *right* package |
|  **Private registry/proxy** (Artifactory, Nexus, CodeArtifact) | Uncurated public packages entering at all |
| Explicit index pinning (`--index-url`, `.npmrc` scopes) | Dependency confusion |
| `pip install --require-hashes` / `npm ci` | Anything not in the lockfile |
| `--ignore-scripts` (npm) | Install-time code execution |
| Dependency review in PRs | A new dependency arriving unnoticed |
| SBOM diff between releases |  "What changed in our dependency tree?" |

```bash
#  Diff SBOMs between two versions — the single best signal that something changed
# syft app:v1 -o json > v1.json && syft app:v2 -o json > v2.json
# diff <(jq -r '.artifacts[].name' v1.json | sort) <(jq -r '.artifacts[].name' v2.json | sort)
```

---

### Scenario 3: The GitHub Action Pinned to a Tag

**Break it:**

```bash
mkdir -p .github/workflows
cat > .github/workflows/risky.yml <<'YAML'
name: Risky
on: [push]
permissions:
  contents: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4                    #  mutable tag
      - uses: some-community/setup-tool@v1           #  mutable tag, third party
      - uses: another/deploy-action@main             #  a BRANCH
        env:
          AWS_ROLE: ${{ secrets.AWS_DEPLOY_ROLE }}
YAML
python3 -c "import yaml;yaml.safe_load(open('.github/workflows/risky.yml'));print('valid YAML — and dangerous')"
```

**Symptom:** Nothing. It works. But `@v1` and `@main` are **mutable git refs**. Whoever controls that repository — the maintainer, or anyone who compromises their account — can change what runs inside your pipeline, with access to `secrets` and your OIDC identity. This is not hypothetical: it's how several real supply chain compromises worked.

**Investigate:**

```bash
grep -rn 'uses:' .github/workflows/ | grep -vE 'uses:.*@[0-9a-f]{40}' \
  || echo "   everything pinned to a full SHA"
```

**Root cause:** Every `uses:` is remote code execution in your CI, with your permissions. A tag is a pointer the *other* repository controls.

**Fix:**

```bash
cat > .github/workflows/safe.yml <<'YAML'
name: Safe
on: [push]
permissions:
  contents: read          #  least privilege by default
jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write     # only where actually needed
    steps:
      #  Full commit SHA. The comment tracks the human-readable version.
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
      - uses: sigstore/cosign-installer@59acb6260d9c0ba8f4a2f9d9b48431a222b68e20 # v3.5.0
YAML
python3 -c "import yaml;yaml.safe_load(open('.github/workflows/safe.yml'));print(' pinned')"

# Automate it: `pin-github-action`, or Dependabot, which updates SHAs and keeps the comment
```

**And never interpolate untrusted input into a shell:**

```yaml
#  The PR title is attacker-controlled and becomes shell code
- run: echo "Building ${{ github.event.pull_request.title }}"

#  Pass through the environment, where it stays data
- run: echo "Building $TITLE"
  env:
    TITLE: ${{ github.event.pull_request.title }}
```

```bash
rm -rf .github
```

---

### Scenario 4: The SBOM Nobody Looks At

**Break it:**

```bash
# The compliance-checkbox version: generate it, upload it, never read it
syft localhost:5000/demo-app:v1 -o spdx-json > sbom-archived.json
ls -lh sbom-archived.json
echo "→ uploaded to the artifact store. Job done. "
```

**Symptom:** A file exists. Six months later a critical CVE drops in a transitive dependency and the questions are: *which of our 200 services ship it?* *Which versions?* *Which are internet-facing?* Nobody has ever queried these files, there's no index, and each one is attached to a build number nobody can map to a running service.

**Investigate — the questions an SBOM must be able to answer:**

```bash
echo "── 1. Do we ship package X, and at what version? ──"
jq -r '.packages[] | select(.name=="requests") | "\(.name) \(.versionInfo)"' sbom.spdx.json

echo "── 2. What licences are we shipping? ──"
jq -r '[.packages[].licenseConcluded // "NOASSERTION"] | group_by(.) | map({(.[0]): length}) | add' sbom.spdx.json

echo "── 3. What changed between releases? ──"
echo "   diff <(jq -r '.packages[].name' old.json|sort) <(jq -r '.packages[].name' new.json|sort)"

echo "── 4. Which RUNNING services contain it? ──"
echo "     requires SBOMs linked to deployed digests, not to build numbers"
```

**Root cause:** Generating an SBOM is the easy 10%. The value is in **storage keyed by image digest**, **continuous re-scanning as new CVEs are published**, and a **link from digest to running workload**.

**Fix:**

```bash
# 1.  Attach the SBOM to the image itself, so it travels with the artifact
COSIGN_PASSWORD="" cosign attest --key cosign.key --yes --allow-insecure-registry \
  --predicate sbom.spdx.json --type spdxjson localhost:5000/demo-app:v1

# Anyone, anywhere, can now retrieve it from the digest alone
cosign download attestation --allow-insecure-registry localhost:5000/demo-app:v1 2>/dev/null \
  | jq -r '.payload' | base64 -d 2>/dev/null | jq '.predicate.name' 2>/dev/null | head -1
```

```bash
# 2. Continuous re-scan — the CVE that matters didn't exist when you built
#    trivy sbom sbom.spdx.json          # nightly, against today's database
#
# 3. An inventory that maps DIGEST → SBOM → running workload
#    kubectl get pods -A -o json | jq -r '.items[].status.containerStatuses[]?.imageID' | sort -u
#
# 4. Dependency-Track or a similar server ingests SBOMs and alerts you
#    when a new CVE affects something you already shipped.
```

>**The test for whether your SBOM programme is real**: can you answer *"which running services contain package X at version Y?"* in under five minutes, without rebuilding anything? If not, you are generating files, not managing a supply chain.

---

### Summary

| Failure | Detection | Prevention |
|---------|-----------|------------|
| Mutable tag repointed | Digest changed for the same tag | Deploy digests; immutable tags; verify signatures |
| Typosquat / dependency confusion | Edit-distance check; SBOM diff | Lockfiles with hashes; private proxy; index pinning |
| Action pinned to a tag or branch | `grep uses:` for non-SHA refs | Full commit SHAs; least-privilege `permissions:` |
| SBOM nobody queries | Try to answer "who ships X?" | Attest to the digest; re-scan continuously; keep an inventory |

**The supply chain checklist:**

- [ ] Base images pinned by **digest**
- [ ] Dependencies in a lockfile with **hashes**; `npm ci` / `--require-hashes`
- [ ] Every GitHub Action pinned to a **full commit SHA**
- [ ] Workflow `permissions:` set explicitly, least privilege
- [ ] SBOM generated per build and **attested to the image digest**
- [ ] Images **signed**, ideally keyless via OIDC
- [ ] Build **provenance** (SLSA) attested
- [ ] Registry configured for **immutable tags**
- [ ] Deployments reference **digests**, never tags
- [ ] **Admission control** verifies signature and attestations before anything runs
- [ ] SBOMs re-scanned on a schedule against a current CVE database
- [ ] An inventory mapping running digests to SBOMs

>**The three questions this lab answers** — *what is in it*, *did we build it*, *can anything else run* — are what "supply chain security" means in practice. Lab 01's scanners tell you about known problems in things they recognise. This lab is about the things they don't.

**Write this up** in `failure-notes.md`.

---

## Cleanup

```bash
cd supply-chain-lab 2>/dev/null || true
docker rm -f registry 2>/dev/null
docker rmi -f localhost:5000/demo-app:v1 localhost:5000/demo-app:pinned \
  localhost:5000/demo-app:build1 localhost:5000/demo-app:build2 localhost:5000/svc:v1.0.0 2>/dev/null
cd .. && rm -rf supply-chain-lab
docker ps -a | grep registry || echo " clean"
```

---

## Validation

- [ ] Generate an SBOM and state how many components the CVE scanner didn't examine
- [ ] Explain what SPDX and CycloneDX are each used for
- [ ] Sign an image, verify it, and make verification fail by substituting the tag
- [ ] Explain why keyless signing is stronger than a key pair
- [ ] Attach an SBOM as an attestation and retrieve it from the digest
- [ ] Pin a base image by digest and dependencies by hash
- [ ] Explain the difference between reproducible builds and reproducible dependencies
- [ ] Write an admission policy requiring a signature, and explain `mutateDigest`
- [ ] Explain why a GitHub Action pinned to `@v1` is remote code execution
- [ ] Answer "which running services contain package X?" and describe what infrastructure that needs

---

## What to Commit

- `sbom.spdx.json` and `sbom.cdx.json`, with your component-count analysis
- Terminal output showing verification succeeding, then failing after the tag was repointed
- `Dockerfile.pinned` and a hash-pinned lockfile
- `verify-before-deploy.sh` and `kyverno-verify-images.yaml`
- The secure pipeline workflow
- `failure-notes.md` covering all four scenarios

---

[← Previous Lab: Secrets Management](./lab-02-secrets-management.md) | [Back to Module README](../README.md) | [Module 14: System Design →](../../14-system-design-devops/)
<!-- tab: Projects -->
# Project: Security Scan and Triage Report

## Problem Statement

Run security scans against a small application, container image, or infrastructure config. Triage the findings and document what you fixed, what remains, and why.

## Deliverables

- Scan command and tool version
- Raw or summarized scan output
- Triage table with severity, impact, fix, and owner
- Evidence for at least one fixed issue
- Residual-risk note for accepted findings

## Validation

Run the scan before and after a fix. Capture enough output to prove the finding changed or was intentionally accepted.

## Failure Scenario

Include one leaked dummy secret, vulnerable dependency, or insecure config in a safe test repo. Document how the scan detects it and how prevention should be added to CI.

## What to Commit

- Scan notes
- Triage report
- Fix evidence
- CI/prevention recommendation

## Review Rubric

Use this rubric to self-assess your work or have a peer review it.

| Criteria | What to Look For | Score (1-5) |
|----------|-----------------|-------------|
| **Reproducibility** | Scan commands and tool versions are documented for reproducibility | |
| **Correctness** | Triage accurately assesses severity, exploitability, and impact | |
| **Debugging quality** | At least one finding is fixed with before/after evidence | |
| **Security basics** | Scan covers code, dependencies, images, and infrastructure configs | |
| **Cleanup quality** | Test repos and dummy secrets are removed after the exercise | |
| **Explanation clarity** | Triage report clearly explains each finding, decision, and rationale | |

**Scoring**: 1 = Not attempted, 2 = Partial, 3 = Meets expectations, 4 = Exceeds expectations, 5 = Production quality
<!-- tab: Resources -->
---

## Essential Reading

| Resource | Type | Difficulty | Notes |
|----------|------|------------|-------|
| [OWASP Top 10](https://owasp.org/www-project-top-ten/) | Guide | Beginner | The 10 most critical web application security risks — **must know** |
| [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks) | Guide | Intermediate | Security configuration baselines for Linux, Docker, K8s |
| [AWS Security Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) | Documentation | Intermediate | IAM and cloud security fundamentals |
| [Kubernetes Security (Liz Rice)](https://www.oreilly.com/library/view/kubernetes-security/9781492039075/) | Book | Intermediate | Container and K8s security deep dive |
| [The DevSecOps Playbook](https://www.oreilly.com/library/view/the-devsecops-playbook/9781098162641/) | Book | Intermediate | Integrating security into DevOps workflows |

---

## Videos & Courses

| Resource | Type | Duration | Notes |
|----------|------|----------|-------|
| [DevSecOps Explained (TechWorld with Nana)](https://www.youtube.com/watch?v=nrhxNNH5lt0) | Video | 15 min | Best DevSecOps overview |
| [Container Security (Liz Rice)](https://www.youtube.com/watch?v=lbJK28whV1Q) | Video | 45 min | Container security from first principles |
| [Kubernetes Security Best Practices (CNCF)](https://www.youtube.com/watch?v=oBf5lrmquYI) | Video | 40 min | K8s security from the CNCF |
| [OWASP Top 10 Explained (IBM Technology)](https://www.youtube.com/watch?v=rWHvp7rUka8) | Video | 12 min | Quick overview of top web vulnerabilities |
| [HashiCorp Vault Tutorial](https://www.youtube.com/watch?v=VYfl-DGun_A) | Video | 30 min | Centralized secrets management |

---

## Tools & References

| Resource | Type | Notes |
|----------|------|-------|
| [Trivy](https://github.com/aquasecurity/trivy) | Scanner | Container image, filesystem, IaC, and K8s scanning |
| [gitleaks](https://github.com/gitleaks/gitleaks) | Scanner | Detect secrets in git repos |
| [Semgrep](https://semgrep.dev/) | SAST | Static code analysis for security bugs |
| [Checkov](https://github.com/bridgecrewio/checkov) | Scanner | IaC security scanning (Terraform, K8s, Docker) |
| [Snyk](https://snyk.io/) | Platform | Dependency and container vulnerability scanning |
| [HashiCorp Vault](https://www.vaultproject.io/) | Tool | Centralized secrets management |
| [Falco](https://falco.org/) | Tool | Runtime security for K8s (detect anomalous behavior) |
| [kube-bench](https://github.com/aquasecurity/kube-bench) | Tool | Check K8s cluster against CIS benchmark |

---

## Recommended Practice Path

1. **Week 1**: Install Trivy and scan your Docker images from previous modules. Install gitleaks as a pre-commit hook. Harden an SSH config. Set up UFW firewall rules. Run `lynis audit system` on a Linux box.
2. **Week 2**: Add security scanning to a GitHub Actions pipeline (secret scan + SAST + image scan). Create a K8s pod with full security context. Write a least-privilege IAM policy. Practice the incident response framework on a mock scenario.
<!-- /tabs -->
