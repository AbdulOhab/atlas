---
title: "CI/CD"
order: 7
summary: "If it hurts, do it more frequently, and bring the pain forward."
category: "Core Tools"
level: Intermediate
---

# Module 06: CI/CD

> *"If it hurts, do it more frequently, and bring the pain forward." — Jez Humble*

---

>**Command reference**: [`cheatsheet.md`](./cheatsheet.md) — every command in this module, grouped by task, with the gotchas.
>
>**Cross-module lookup**: [Quick Reference](../QUICK-REFERENCE.md)

---

## Why This Module Matters

CI/CD is the **backbone of modern software delivery**. Without it, every deployment is a manual, error-prone, stressful event. With it, you ship code multiple times a day with confidence.

**In real-world DevOps work**, you will:

- Build CI pipelines that automatically test every code change
- Create CD pipelines that deploy to staging and production
- Configure deployment strategies (rolling, blue-green, canary)
- Manage secrets and environment-specific configurations
- Debug failed pipelines under pressure
- Enforce quality gates before code reaches production

---

## Table of Contents

1. [CI/CD Concepts](#1-cicd-concepts)
2. [Pipeline Architecture](#2-pipeline-architecture)
3. [GitHub Actions — Primary Tool](#3-github-actions--primary-tool)
4. [Building a CI Pipeline](#4-building-a-ci-pipeline)
5. [Building a CD Pipeline](#5-building-a-cd-pipeline)
6. [Jenkins — Secondary Tool](#6-jenkins--secondary-tool)
7. [GitLab CI — Translating What You Know](#7-gitlab-ci--translating-what-you-know)
8. [Azure Pipelines — The Enterprise Sibling](#8-azure-pipelines--the-enterprise-sibling)
9. [Testing in CI/CD](#9-testing-in-cicd)
10. [Deployment Strategies](#10-deployment-strategies)
11. [Common Mistakes and Anti-Patterns](#11-common-mistakes-and-anti-patterns)
12. [Debugging Mindset](#12-debugging-mindset)
13. [Security Considerations](#13-security-considerations)
14. [Interview Insights](#14-interview-insights)

---

## 1. CI/CD Concepts

### What Do These Terms Actually Mean?

```
Continuous Integration (CI):
  Developers merge code to main branch frequently (multiple times/day).
  Every merge triggers automated build + tests.
  Goal: Catch bugs early, keep the codebase always releasable.

Continuous Delivery (CD):
  Every change that passes CI is automatically deployable to production.
  Deployment to production requires manual approval (button click).
  Goal: Release on demand, any time.

Continuous Deployment (CD):
  Every change that passes CI goes to production automatically.
  No human intervention at all.
  Goal: Ship every commit to users immediately.
```

| Aspect | CI | Continuous Delivery | Continuous Deployment |
|--------|----|--------------------|----------------------|
| **Trigger** | Code push/PR | After CI passes | After CI passes |
| **Automation** | Build + test | Build + test + stage | Build + test + stage + prod |
| **Human step** | None | Approve deploy to prod | None |
| **Risk level** | Low | Medium | Requires mature testing |
| **Adoption** | Nearly universal | Common | Advanced teams |

### The Pipeline Mental Model

The three terms describe **where the automation stops**. Same pipeline, different end point:

```mermaid
flowchart LR
    DEV([" Developer<br/>git push"]) --> B["Build"]
    B --> T["Test"]
    T --> STG["Deploy to<br/>Staging"]
    STG --> GATE{"Manual<br/>approval?"}
    GATE -->|"required"| PROD["Deploy to<br/>Production"]
    GATE -->|"skipped"| PROD
    PROD --> USERS([" Users"])

    subgraph ci["Continuous Integration"]
        B
        T
    end
    subgraph cdel["Continuous Delivery — stops at the gate"]
        STG
        GATE
    end
    subgraph cdep["Continuous Deployment — no gate at all"]
        PROD
    end

    style ci fill:#e8f0ff,stroke:#3366cc
    style cdel fill:#fff4e0,stroke:#cc8800
    style cdep fill:#e8ffe8,stroke:#22aa22
    style GATE fill:#fff,stroke:#cc8800,stroke-width:2px
```

**CI** = every merge is built and tested. **Continuous Delivery** = every passing build *could* go to prod, a human decides when. **Continuous Deployment** = it goes, no human involved. The only structural difference between the last two is that one diamond.

---

## 2. Pipeline Architecture

### Stages of a Production Pipeline

Real pipelines are a **graph**, not a line. Independent checks fan out in parallel; everything converges on a single build artifact that is then promoted — never rebuilt — through each environment.

```mermaid
flowchart TD
    SRC(["git push / pull_request"]) --> CHECKOUT["Checkout + restore cache"]

    CHECKOUT --> LINT["Lint<br/><i>~20s</i>"]
    CHECKOUT --> SAST["SAST + secret scan<br/><i>~40s</i>"]
    CHECKOUT --> UNIT["Unit tests<br/><i>~2m</i>"]

    LINT --> BUILD
    SAST --> BUILD
    UNIT --> BUILD

    BUILD["<b>Build once</b><br/>compile · bundle · docker build<br/>tag with the commit SHA"]
    BUILD --> SCAN["Image scan — Trivy<br/>fail on HIGH/CRITICAL"]
    SCAN --> PUSH["Push artifact to registry<br/><code>myapp:a1b2c3d</code>"]

    PUSH --> DEPSTG["Deploy to <b>staging</b><br/>same artifact"]
    DEPSTG --> INTEG["Integration + E2E tests"]
    INTEG --> SMOKE1["Smoke test staging"]

    SMOKE1 --> GATE{"Approval gate<br/><i>Continuous Delivery only</i>"}
    GATE --> DEPPROD["Deploy to <b>production</b><br/><b>same artifact</b> — never rebuilt"]
    DEPPROD --> SMOKE2["Smoke test prod"]
    SMOKE2 --> WATCH["Watch error rate + latency<br/>Module 07"]
    WATCH -->|"SLO breached"| RB[" Automatic rollback"]
    WATCH -->|"healthy"| DONE([" Released"])

    LINT -.->|""| FB
    SAST -.->|""| FB
    UNIT -.->|""| FB
    SCAN -.->|""| FB
    INTEG -.->|""| FB
    FB[" Notify: PR comment · Slack · red check"]

    style BUILD fill:#e8f0ff,stroke:#3366cc,stroke-width:2px
    style GATE fill:#fff4e0,stroke:#cc8800
    style DONE fill:#e0ffe0,stroke:#0a0
    style RB fill:#ffe0e0,stroke:#c00
    style FB fill:#ffe0e0,stroke:#c00
```

**Key Principles:**

- **Fail fast** — cheapest checks (linting) run first, and in parallel
- **Immutable artifacts** — build once, deploy the same artifact everywhere. If you rebuild between staging and prod, you tested a different thing than you shipped
- **Environment parity** — staging mirrors production
- **Feedback loops** — developers know within minutes if something broke

---

## 3. GitHub Actions — Primary Tool

### Why GitHub Actions?

- Native to GitHub (where most code lives)
- Free for public repos, generous free tier for private
- Massive marketplace of reusable actions
- Matrix builds, caching, artifacts built-in
- YAML-based, version-controlled alongside code

### Workflow Anatomy

Four nested concepts. Getting the boundaries wrong is the most common source of "why is my file missing in the next job?"

```mermaid
flowchart TB
    EVT(["<b>Event</b><br/>push · pull_request · schedule ·<br/>workflow_dispatch"]) --> WF

    subgraph WF["<b>Workflow</b> — .github/workflows/ci.yml"]
        direction TB

        subgraph J1["<b>Job: lint</b> — fresh ubuntu-latest VM"]
            S1["Step: actions/checkout@v4"]
            S2["Step: setup-python@v5"]
            S3["Step: run flake8"]
            S1 --> S2 --> S3
        end

        subgraph J2["<b>Job: test</b> — fresh ubuntu-latest VM"]
            T1["Step: checkout"]
            T2["Step: pytest"]
            T1 --> T2
        end

        subgraph J3["<b>Job: build</b> — fresh ubuntu-latest VM"]
            B1["Step: docker build"]
            B2["Step: upload-artifact"]
            B1 --> B2
        end
    end

    J1 -->|"needs: lint"| J2
    J2 -->|"needs: test"| J3

    style J1 fill:#e8f0ff,stroke:#3366cc
    style J2 fill:#e8f0ff,stroke:#3366cc
    style J3 fill:#e8f0ff,stroke:#3366cc
```

| Level | What it is | Key rule |
|-------|-----------|----------|
| **Event** | What triggers the run | Defined by `on:` |
| **Workflow** | One YAML file | A repo can have many; they run independently |
| **Job** | A unit that gets **its own clean VM** | Jobs run **in parallel** unless linked with `needs:` |
| **Step** | One command or action | Steps in a job share the same filesystem and shell session |

> ** The boundary that trips everyone up**: each job starts on a **brand-new machine**. Files written in the `build` job do **not** exist in the `deploy` job — and neither does your checkout. To move data between jobs use `actions/upload-artifact` / `download-artifact`, or `outputs:`. To move data between *steps*, just write a file; they share a disk.

```yaml
# .github/workflows/ci.yml
name: CI Pipeline                    # Workflow name (shown in UI)

on:                                  # Triggers
  push:
    branches: [main, develop]        # Run on push to these branches
  pull_request:
    branches: [main]                 # Run on PRs targeting main

env:                                 # Global environment variables
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:                                # Jobs run in PARALLEL by default
  lint:                              # Job ID
    name: Lint Code                  # Display name
    runs-on: ubuntu-latest           # Runner (GitHub-hosted VM)
    steps:
      - name: Checkout code
        uses: actions/checkout@v4    # Reusable action from marketplace

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install and run linter
        run: |                       # Shell commands
          pip install flake8
          flake8 . --max-line-length=120

  test:
    name: Run Tests
    runs-on: ubuntu-latest
    needs: lint                      # Run AFTER lint passes
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest --cov=app --cov-report=xml
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage.xml
```

### Key Concepts

**Triggers (`on`):**

```yaml
on:
  push:
    branches: [main]
    paths:
      - "src/**"                     # Only run when src/ changes
      - "!docs/**"                   # Ignore docs changes
  pull_request:
    types: [opened, synchronize]
  schedule:
    - cron: "0 2 * * 1"             # Weekly Monday 2am UTC
  workflow_dispatch:                 # Manual trigger (button in UI)
    inputs:
      environment:
        description: "Deploy target"
        required: true
        default: "staging"
        type: choice
        options: [staging, production]
```

**Matrix Builds:**

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]
        os: [ubuntu-latest, macos-latest]
      fail-fast: false               # Don't cancel others if one fails
    steps:
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
      - run: pytest
```

**Caching:**

```yaml
      - name: Cache pip dependencies
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('requirements.txt') }}
          restore-keys: |
            ${{ runner.os }}-pip-
```

**Secrets & Environment Variables:**

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production          # Links to GitHub environment settings
    steps:
      - name: Deploy
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: ./deploy.sh
```

>**Never hardcode secrets.** Use GitHub's encrypted secrets (Settings → Secrets → Actions).

---

## 4. Building a CI Pipeline

### Complete CI Pipeline Example

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: |
          pip install flake8 black
          flake8 . --max-line-length=120
          black --check .

  test:
    name: Test
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: pip-${{ hashFiles('requirements.txt') }}
      - run: pip install -r requirements.txt
      - name: Run tests
        env:
          DATABASE_URL: postgres://test:test@localhost:5432/testdb
        run: pytest --cov --cov-report=xml -v
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage.xml

  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: test
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: |
            ghcr.io/${{ github.repository }}:${{ github.sha }}
            ghcr.io/${{ github.repository }}:latest
```

### Pipeline Flow

```
PR opened / push to main
        │
        ▼
   ┌─────────┐     ┌─────────┐     ┌────────────┐
   │  Lint    │────▶│  Test   │────▶│ Build+Push │
   │ flake8   │     │ pytest  │     │ Docker img │
   │ black    │     │ + DB    │     │ to GHCR    │
   └─────────┘     └─────────┘     └────────────┘
                                    (push only,
                                     not on PRs)
```

---

## 5. Building a CD Pipeline

### Deployment Workflow with Environments

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  workflow_run:
    workflows: [CI]
    types: [completed]
    branches: [main]

jobs:
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to staging
        env:
          DEPLOY_KEY: ${{ secrets.STAGING_DEPLOY_KEY }}
        run: |
          echo "Deploying ${{ github.sha }} to staging..."
          # Your deployment script here
          ./scripts/deploy.sh staging ${{ github.sha }}

      - name: Smoke test
        run: |
          sleep 10
          curl -f https://staging.example.com/health || exit 1

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment:
      name: production             # Requires manual approval in GitHub settings
      url: https://example.com
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production
        env:
          DEPLOY_KEY: ${{ secrets.PROD_DEPLOY_KEY }}
        run: |
          echo "Deploying ${{ github.sha }} to production..."
          ./scripts/deploy.sh production ${{ github.sha }}

      - name: Smoke test production
        run: |
          sleep 15
          curl -f https://example.com/health || exit 1

      - name: Notify success
        if: success()
        run: echo " Deployed ${{ github.sha }} to production"

      - name: Notify failure
        if: failure()
        run: echo " Production deploy failed — rolling back"
```

### Environment Protection Rules

Configure in GitHub: **Settings → Environments → production**:

-Required reviewers (team lead must approve)
-Wait timer (e.g., 5 minutes after staging)
-Deployment branch restrictions (only `main`)

### The Other Model: Pull-Based Delivery (GitOps)

Everything above is **push**: the pipeline holds production credentials and runs the deployment. That is still the common case, and for anything that isn't Kubernetes it is usually the only case.

The alternative is **pull**: a controller running *inside* the target cluster watches a Git repository of manifests and reconciles the cluster toward it continuously. The pipeline's job stops at building an image and committing a manifest change — it never touches the cluster, and never needs a credential that could deploy to it.

| | Push (this section) | Pull (GitOps) |
|---|---|---|
| Who deploys | The CI runner | A controller in the cluster |
| Prod credentials live in | The CI system | Nowhere outside the cluster |
| Deployment history | Pipeline run logs | `git log` on the manifests repo |
| Drift from manual changes | Undetected until something breaks | Detected, and reverted if configured to |
| Works for | Anything | Kubernetes, essentially |

> ** DevOps Impact**: The security argument is the one that wins arguments — a compromised pipeline with no cluster credentials cannot deploy anything. The operational argument is drift detection: push-based delivery has no idea what the cluster looks like between deploys.

Concepts and tradeoffs, including when GitOps is overkill: [Module 14 §9](../14-system-design-devops/README.md). Hands-on with Argo CD, once you know Kubernetes: [Module 12, Lab 06](../12-kubernetes/labs/lab-06-gitops-argocd.md).

---

## 6. Jenkins — Secondary Tool

### Why Learn Jenkins?

- Still used by ~50% of enterprises (legacy + complex needs)
- Extremely flexible (2000+ plugins)
- Self-hosted = full control over infrastructure
- Understanding Jenkins makes you more employable

### Jenkins Architecture

```
┌──────────────────────────────────────────┐
│           Jenkins Controller             │
│  • Manages jobs, configuration, UI       │
│  • Schedules builds                      │
│  • Stores build history                  │
└──────┬──────────────┬───────────────────┘
       │              │
  ┌────▼────┐   ┌─────▼────┐
  │ Agent 1 │   │ Agent 2  │
  │ (Linux) │   │ (Docker) │
  │ Runs    │   │ Runs     │
  │ builds  │   │ builds   │
  └─────────┘   └──────────┘
```

### Declarative Jenkinsfile

```groovy
// Jenkinsfile (Declarative)
pipeline {
    agent any

    environment {
        REGISTRY = 'ghcr.io'
        IMAGE = 'myorg/myapp'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Lint') {
            steps {
                sh 'pip install flake8'
                sh 'flake8 . --max-line-length=120'
            }
        }

        stage('Test') {
            steps {
                sh 'pip install -r requirements.txt'
                sh 'pytest --junitxml=results.xml --cov=app'
            }
            post {
                always {
                    junit 'results.xml'
                }
            }
        }

        stage('Build Image') {
            steps {
                script {
                    def image = docker.build("${IMAGE}:${env.BUILD_NUMBER}")
                    docker.withRegistry("https://${REGISTRY}", 'registry-creds') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                sh './scripts/deploy.sh staging'
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            input {
                message 'Deploy to production?'
                ok 'Yes, deploy!'
            }
            steps {
                sh './scripts/deploy.sh production'
            }
        }
    }

    post {
        success {
            echo ' Pipeline completed successfully'
        }
        failure {
            echo ' Pipeline failed'
            // slackSend(message: "Build failed: ${env.JOB_NAME}")
        }
        always {
            cleanWs()  // Clean workspace
        }
    }
}
```

### GitHub Actions vs Jenkins

| Feature | GitHub Actions | Jenkins |
|---------|---------------|---------|
| **Hosting** | Cloud (GitHub-hosted) | Self-hosted |
| **Config** | YAML files | Groovy Jenkinsfile |
| **Setup** | Zero (just add YAML) | Install + configure server |
| **Plugins** | Marketplace actions | 2000+ plugins |
| **Cost** | Free tier generous | Free (but you pay for infra) |
| **Scaling** | Auto (GitHub runners) | Manual (add agents) |
| **Best for** | GitHub-hosted projects | Enterprise, complex needs |
| **Learning** | Lower barrier | Steeper curve |

---

## 7. GitLab CI — Translating What You Know

### Why Bother, When You Know Actions

Because roughly a third of the jobs you apply for run GitLab CI, and the interview question is never "write me a `.gitlab-ci.yml`" — it is "you've used GitHub Actions; how quickly can you be useful on GitLab?" The concepts are the same. The vocabulary is not.

GitLab's distinguishing feature is that CI is part of the same product as the repository, the registry, the issue tracker, and the environments. There is no marketplace of third-party actions to lean on, which means more of the pipeline is shell commands you wrote — a fair trade for some teams, a dealbreaker for others.

### The Concept Map

Learn this table and you can read any `.gitlab-ci.yml`:

| GitHub Actions | GitLab CI | Notes |
|----------------|-----------|-------|
| `.github/workflows/*.yml` (many files) | `.gitlab-ci.yml` (one file, `include:` for more) | GitLab defaults to one entry point |
| Workflow | Pipeline | |
| Job | Job | Same idea, same isolation |
| Step | Script line |  No `uses:` — no action marketplace. You write shell, or use a container image that already has the tool |
| `runs-on: ubuntu-latest` | `tags:` selecting a runner, plus `image:` | Every job runs *in* a container image you name |
| `needs:` | `needs:` (DAG) or `stage:` (ordered groups) | `stages` are the default mental model; `needs` unlocks the same DAG parallelism |
| `uses: actions/cache` | `cache:` key + paths | Built in, not an action |
| `upload-artifact` | `artifacts: paths:` | Built in, and artifacts pass to later stages automatically |
| `secrets.FOO` | CI/CD variables (masked, protected) |  "Protected" means only protected branches see it — the closest thing to environment approvals |
| `environment:` | `environment:` | Both give deployment history and approval gates |
| `if:` conditions | `rules:` / `only:` / `except:` | `rules:` is current; `only/except` is legacy you will still meet |
| Reusable workflows | `include:` + `extends:` | Composition is templating rather than a call |
| GitHub-hosted runners | Shared or self-hosted runners | Self-hosting is far more common on GitLab, so runner debugging is your problem |

### The Same Pipeline, Translated

This is the CI pipeline from §4, expressed in GitLab:

```yaml
# .gitlab-ci.yml
stages: [lint, test, build, scan, deploy]

default:
  image: python:3.12-slim          # every job runs in this unless it says otherwise
  interruptible: true             #  a new push cancels the old pipeline; saves runner minutes

variables:
  PIP_CACHE_DIR: "$CI_PROJECT_DIR/.cache/pip"
  IMAGE: "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"     # SHA-tagged, built once

cache:
  key:
    files: [requirements.txt]     # cache invalidates when dependencies change
  paths: [.cache/pip]

lint:
  stage: lint
  script:
    - pip install ruff
    - ruff check .

test:
  stage: test
  script:
    - pip install -r requirements.txt pytest pytest-cov
    - pytest --junitxml=report.xml --cov=. --cov-report=term
  artifacts:
    when: always                  #  upload the report even when the job fails
    reports:
      junit: report.xml           # GitLab renders failures in the merge request itself
    expire_in: 1 week

build:
  stage: build
  image: docker:27
  services: [docker:27-dind]      # Docker-in-Docker: the usual way to build images here
  script:
    - echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin "$CI_REGISTRY"
    - docker build -t "$IMAGE" .
    - docker push "$IMAGE"
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"

scan:
  stage: scan
  image:
    name: aquasec/trivy:0.54.1
    entrypoint: [""]              #  images with their own entrypoint need this override
  script:
    - trivy image --exit-code 1 --severity CRITICAL "$IMAGE"

deploy:
  stage: deploy
  script: ./deploy.sh production "$CI_COMMIT_SHA"
  environment:
    name: production
    url: https://example.com
  when: manual                    # the approval gate
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

### The Four Things That Will Surprise You

**1. Every job runs inside an image you choose.** There is no ambient toolchain. If `terraform` is not in the image, the job cannot see it. This is stricter and more reproducible than a hosted runner with everything preinstalled — and it is the most common source of "works on GitHub, fails here".

**2. Runners are yours to operate.** Self-hosted runners mean an executor choice (`docker`, `shell`, `kubernetes`) and real failure modes: a full disk on the runner host, a stale Docker cache, a `shell` executor leaking state between jobs. `shell` executors in particular break the isolation you assumed.

**3. `rules:` evaluate in order and the first match wins.** A job with no matching rule is silently *not created*, which reads exactly like a broken pipeline. `CI_PIPELINE_SOURCE` (`push`, `merge_request_event`, `schedule`, `web`) is the variable you will reach for most.

**4. Artifacts flow forward automatically.** Later stages get earlier stages' artifacts without asking, which is convenient until a 500 MB artifact from stage one is downloaded by every job in stage four. Use `dependencies: []` to opt out.

```bash
# Debugging, in the order you'll want it
npx gitlab-ci-local --list                    #  WHICH JOBS WOULD EXIST for this ref
npx gitlab-ci-local lint                      # run one job locally, in Docker, no account
gitlab-runner verify                          # (self-hosted) is the runner registered
# In the UI: Build → Pipeline editor → Validate; the Lint tab simulates job creation
```

>**`gitlab-runner exec` is gone** — deprecated in Runner 15.7, removed in 17.0. Any tutorial
> that recommends it predates that. [`gitlab-ci-local`](https://github.com/firecow/gitlab-ci-local)
> is the current way to execute a job on your machine.

Hands-on, on the same application you built the Actions pipeline for: **[Lab 03: GitLab CI](./labs/lab-03-gitlab-ci.md)**.

> ** DevOps Impact**: the transferable skill is not the syntax, it is knowing that every CI system has the same five moving parts — triggers, an execution environment, a dependency graph, caching/artifacts, and a secret store. When you meet CircleCI, Buildkite, or Tekton next, find those five and you can read the config on day one.

---

## 8. Azure Pipelines — The Enterprise Sibling

If a company runs Microsoft 365, Active Directory, and .NET, its CI is very often Azure DevOps. The pipeline language is close enough to GitHub Actions that the translation takes an afternoon — unsurprising, since Microsoft owns both — and the differences that matter are about **where the controls live**, not about syntax.

### The Concept Map

| GitHub Actions | Azure Pipelines | Note |
|----------------|-----------------|------|
| `on: push` | `trigger:` | `pr:` is a separate block, not a filter |
| `jobs:` | `stages:` → `jobs:` → `steps:` |  One extra level; stages are the deployment boundary |
| `runs-on: ubuntu-latest` | `pool: { vmImage: ubuntu-latest }` | Or `pool: { name: <pool> }` for self-hosted |
| `uses: actions/checkout@v4` | implicit, or `- checkout: self` | Checkout happens by default |
| `uses: some/action@v1` | `task: SomeTask@1` | Tasks are versioned by major number |
| `run:` | `script:` (or `bash:` / `pwsh:`) | `script:` is bash on Linux, cmd on Windows |
| `secrets.FOO` | `$(FOO)` from a variable group | Variable groups live in **Library**, shared across pipelines |
| `actions/upload-artifact` | `publish:` / `download:` | Automatic inside a `deployment:` job |
| composite action / reusable workflow | `template:` and `extends:` |  Also a security boundary — see below |
| `environment:` with reviewers | `environment:` with **approvals and checks** | Same idea, richer checks |
| OIDC to a cloud role | **Service connection** (workload identity federation) | The connection is the credential, held outside the YAML |

### The Four Things That Are Genuinely Different

**1. A new organisation has zero parallel jobs.** Microsoft-hosted agents require a **free grant request** that takes a few business days to approve. Until then every run queues forever with no error — the single most common "Azure DevOps is broken" experience. **Self-hosted agents are free and immediate**, which is why [Lab 04](./labs/lab-04-azure-pipelines.md) runs one in Docker.

**2. Approvals attach to environments, not to pipelines.** Add an approval to the `production` environment and *every* pipeline deploying there inherits it, including ones written later by people who never read yours. Only a `deployment:` job binds to an environment — a plain `job:` silently skips the whole mechanism.

**3. Templates are a security control, not just reuse.** A pipeline that says `extends: a-template-from-a-protected-repo` can only do what the template permits. That is how an organisation stops a pull request from editing the pipeline to print its own secrets — a threat GitHub Actions addresses differently, with `pull_request` scoping and environment protection rules.

**4. Service connections hold the credentials.** A service connection to Azure, AWS, or a registry is an object with its own permissions and its own approval checks, referenced by name from the YAML. The pipeline never contains the credential, and an administrator can restrict which pipelines may use it.

```mermaid
flowchart TB
    subgraph Editable["In the repo — anyone with a PR can change this"]
        Y["azure-pipelines.yml<br/>stages, jobs, steps, conditions"]
    end

    subgraph Protected["Project settings — administrators only"]
        E["Environments<br/><i>approvals, checks</i>"]
        SC["Service connections<br/><i>cloud credentials</i>"]
        T["Protected template repo<br/><i>extends:</i>"]
        P["Agent pools<br/><i>and their permissions</i>"]
    end

    Y -->|"references by name"| E
    Y -->|"references by name"| SC
    Y -->|"constrained by"| T
    Y -->|"runs on"| P

    style Editable fill:#fff4e0,stroke:#cc8800
    style Protected fill:#e8ffe8,stroke:#00aa44
```

 **That split is the lesson worth carrying to any CI system.** A safeguard written in the file being reviewed can be edited by the same pull request that needs safeguarding. A safeguard held outside it cannot. When you assess a pipeline's security — Actions, Pipelines, GitLab, Jenkins — sort every control into those two boxes first.

### A Minimal Two-Stage Pipeline

```yaml
trigger:
  branches: { include: [main] }

pool:
  name: Default              # a self-hosted pool; vmImage: for Microsoft-hosted

stages:
  - stage: Build
    jobs:
      - job: build
        steps:
          - script: ./ci.sh all          #  the same script you run locally
            displayName: Build and test
          - publish: dist                # stages don't share a filesystem
            artifact: app

  - stage: Deploy
    dependsOn: Build
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: deployStaging        # deployment, not job — this binds the environment
        environment: staging             # approvals live here
        strategy:
          runOnce:
            deploy:
              steps:
                - script: ./deploy.sh $(Pipeline.Workspace)/app
```

>**Stages run on different agents.** Anything Build wrote to disk is gone in Deploy unless it was published as an artefact — and a deploy step that "succeeds" against an empty directory is the quiet version of that bug.

Hands-on, translating the Lab 01 pipeline: **[Lab 04: Azure Pipelines — Agents, Stages, and Approvals](./labs/lab-04-azure-pipelines.md)**.

> ** DevOps Impact**: knowing Azure Pipelines roughly doubles the number of enterprise roles you can take, and it costs you very little once you know Actions. The five moving parts from §7 are all here — triggers, execution environment, dependency graph, artifacts, secret store — plus a sixth that Actions is still growing into: controls that live outside the file.

---

## 9. Testing in CI/CD

### Test Pyramid in Pipelines

```
                 ┌───────┐
                 │  E2E  │  ← Slow, expensive, few
                 │ tests │     (Selenium, Cypress)
                ┌┴───────┴┐
                │Integr.  │  ← Medium speed, some
                │ tests   │     (API tests, DB tests)
               ┌┴─────────┴┐
               │  Unit      │  ← Fast, cheap, many
               │  tests     │     (pytest, jest)
               └────────────┘
```

**Run order in pipeline:** Unit → Integration → E2E (fail fast with cheap tests first)

```yaml
  test-unit:
    runs-on: ubuntu-latest
    steps:
      - run: pytest tests/unit/ -v

  test-integration:
    needs: test-unit
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
    steps:
      - run: pytest tests/integration/ -v

  test-e2e:
    needs: test-integration
    runs-on: ubuntu-latest
    steps:
      - run: npx cypress run
```

---

## 10. Deployment Strategies

All three strategies achieve zero downtime. They differ in **how much infrastructure you pay for** and **how fast you can undo a bad release**.

### Rolling Deployment

Replace instances a few at a time. The default in Kubernetes.

```
Time 0: [v1] [v1] [v1] [v1]    ← All running v1
Time 1: [v2] [v1] [v1] [v1]    ← Replace one at a time
Time 2: [v2] [v2] [v1] [v1]
Time 3: [v2] [v2] [v2] [v1]
Time 4: [v2] [v2] [v2] [v2]    ← All running v2
```

```mermaid
sequenceDiagram
    participant LB as Load Balancer
    participant P as Pool (4 instances)

    Note over P: v1 v1 v1 v1
    LB->>P: drain instance 1
    Note over P: -- v1 v1 v1
    LB->>P: start v1 → v2, wait for readiness probe
    Note over P: v2 v1 v1 v1
    LB->>P: repeat for instances 2, 3, 4
    Note over P: v2 v2 v2 v2
    Note over LB,P:  v1 and v2 serve traffic simultaneously<br/>for the whole rollout window
```

-**Pros**: Zero downtime, no extra infrastructure, built into Kubernetes
-**Cons**: Both versions run at once — your API and DB schema must be **backward compatible**. Rollback is another full rolling update, so it's slow.

### Blue-Green Deployment

Two complete environments. Flip all traffic at once.

```mermaid
flowchart TB
    U(["Users"]) --> LB{"Load Balancer /<br/>DNS / Target Group"}

    LB ==>|"100% — live"| BLUE
    LB -.->|"0% — idle, warmed"| GREEN

    subgraph BLUE[" Blue — v1 (current)"]
        B1["v1"]
        B2["v1"]
    end
    subgraph GREEN[" Green — v2 (new)"]
        G1["v2"]
        G2["v2"]
    end

    GREEN -.-> TEST["Smoke tests run here<br/>with zero user impact"]
    TEST -->|"pass → flip the LB"| SWITCH["Cut 100% to Green<br/><i>Blue stays up as the rollback target</i>"]

    style BLUE fill:#ddeeff,stroke:#3366cc,stroke-width:2px
    style GREEN fill:#ddffdd,stroke:#22aa22
```

-**Pros**: **Instant rollback** — flip the load balancer back. Full testing against production infrastructure before any user sees it.
-**Cons**: Double the infrastructure cost during the switch. Shared state (databases, caches, queues) doesn't get duplicated, so schema changes still need care.

### Canary Deployment

Shift a small slice of real traffic, watch the metrics, then decide.

```mermaid
flowchart LR
    U(["Users"]) --> LB{"Traffic split"}

    LB -->|"95%"| V1["v1<br/>stable"]
    LB -->|"5%"| V2["v2<br/>canary"]

    V1 --> M[" Prometheus<br/>error rate · p99 latency · saturation"]
    V2 --> M

    M --> D{"Canary healthier than<br/>or equal to stable?"}
    D -->|"yes"| UP["Promote: 5% → 25% → 50% → 100%"]
    D -->|"no"| AB[" Abort: route 100% back to v1<br/>only 5% of users were ever affected"]

    style V2 fill:#fff4e0,stroke:#cc8800
    style AB fill:#ffe0e0,stroke:#c00
    style UP fill:#e0ffe0,stroke:#0a0
```

-**Pros**: Smallest blast radius of any strategy — a bad release hits 5% of users, not 100%. Validates against real production traffic patterns that staging can't reproduce.
-**Cons**: Needs weighted routing (service mesh, ingress, or ALB rules) **and** the observability from Module 07 to make the promote/abort decision. Without metrics, a canary is just a slow rollout.

### Choosing One

| | Rolling | Blue-Green | Canary |
|---|---------|-----------|--------|
| **Extra infrastructure** | None | 2× during switch | ~5–10% |
| **Rollback speed** | Slow (another rollout) | **Instant** (flip LB) | Instant (reroute) |
| **Blast radius of a bad release** | Grows as rollout proceeds | 100% at once after the flip | 5% |
| **Requires good metrics** | Helpful | Helpful | **Mandatory** |
| **Complexity** | Low | Medium | High |
| **Good default for** | Most services on Kubernetes | Releases you must be able to undo in seconds | High-traffic, user-facing services |

> ** All three break the same way**: none of them protect you from a **non-backward-compatible database migration**. During any of these rollouts, old and new code run against the same database. Use the expand/contract pattern — add the new column, deploy code that writes both, backfill, deploy code that reads the new one, *then* drop the old column across separate releases.

---

## 11. Common Mistakes and Anti-Patterns

### Hardcoding Secrets

```yaml
# BAD: Secret in plain text (committed to repo!)
env:
  AWS_KEY: AKIAIOSFODNN7EXAMPLE
  DB_PASS: mysecretpassword

# GOOD: Use encrypted secrets
env:
  AWS_KEY: ${{ secrets.AWS_ACCESS_KEY_ID }}
  DB_PASS: ${{ secrets.DB_PASSWORD }}
```

### No Caching

```yaml
# BAD: Install everything from scratch every run (5+ minutes)
- run: pip install -r requirements.txt

# GOOD: Cache dependencies (30 seconds)
- uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: pip-${{ hashFiles('requirements.txt') }}
- run: pip install -r requirements.txt
```

### Running Tests Only on Main

```yaml
# BAD: Only test on main (bugs found after merge)
on:
  push:
    branches: [main]

# GOOD: Test on PRs too (bugs found before merge)
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

### No Rollback Strategy

Always plan for failure:

- Keep the previous Docker image tagged and available
- Use blue-green or canary deployments
- Have a one-command rollback script
- Test your rollback process regularly

---

## 12. Debugging Mindset

### CI/CD Debugging Framework

```
Pipeline failed?
│
├─ 1. READ THE LOGS (90% of answers are here)
│     └─ Find the FIRST error, not the last
│
├─ 2. Check: Is it a code issue or pipeline issue?
│     ├─ Code: Does it work locally? → Fix code
│     └─ Pipeline: YAML syntax? Permissions? Secrets?
│
├─ 3. Reproduce locally
│     ├─ GitHub Actions: use `act` tool
│     └─ Jenkins: run the same commands in Docker
│
└─ 4. Common culprits:
      ├─ Missing secrets or wrong secret name
      ├─ YAML indentation error
      ├─ Permission denied (checkout, push, deploy)
      ├─ Dependency version changed (pin versions!)
      └─ Flaky tests (timing, external services)
```

### Using `act` for Local GitHub Actions Testing

```bash
# Install act (runs GHA workflows locally using Docker)
# macOS
brew install act

# Linux
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run your workflow locally
act push                        # Simulate push event
act pull_request                # Simulate PR event
act -j test                     # Run specific job
act --secret-file .env.secrets  # With secrets
```

---

## 13. Security Considerations

>Your CI/CD pipeline has access to production — it's a prime attack target.

- **Secrets management** — Never commit secrets. Use GitHub encrypted secrets or external vaults (HashiCorp Vault, AWS Secrets Manager)
- **Least-privilege tokens** — Use `permissions` in workflows to restrict `GITHUB_TOKEN` scope
- **Pin action versions** — Use `@v4` or SHA, not `@main` (supply chain attack vector)
- **Build provenance** — Attest what your pipeline built and how, to prove artifact integrity
- **Dependency scanning** — Run `dependabot`, `snyk`, or `trivy` in CI
- **Branch protection** — Require CI to pass before merging to main
- **Signed commits** — Verify code authenticity with GPG/SSH signatures
- **OIDC authentication** — Use OpenID Connect instead of static AWS/cloud keys

```yaml
# GOOD: Minimal permissions
permissions:
  contents: read
  packages: write

# GOOD: Pin action to specific SHA (not tag that can be moved)
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

# GOOD: Attest build provenance (supply chain security)
# After building and pushing a Docker image:
- name: Attest build provenance
  uses: actions/attest-build-provenance@v2
  with:
    subject-name: ghcr.io/${{ github.repository }}
    subject-digest: ${{ steps.push.outputs.digest }}
    push-to-registry: true
# This creates a signed, verifiable record of WHAT was built,
# WHERE (which repo/workflow), and WHO triggered it.
# Consumers can verify: gh attestation verify <image>
```

---

## 14. Interview Insights

**Q: What's the difference between Continuous Delivery and Continuous Deployment?**
> Continuous Delivery means every change is *deployable* to production but requires manual approval. Continuous Deployment means every change that passes tests goes to production *automatically*. Delivery is the safer choice for most teams; Deployment requires very mature testing.

**Q: Describe a CI/CD pipeline you've built or worked with.**
> Structure your answer: trigger → lint → test → build artifact → deploy to staging → manual approval → deploy to production. Mention specific tools (GitHub Actions, Docker, pytest), caching strategy, and how you handle failures.

**Q: How do you handle secrets in CI/CD?**
> Never in code or environment files committed to git. Use the platform's secret store (GitHub Secrets, Jenkins Credentials, Vault). Rotate regularly. Use OIDC for cloud providers instead of static keys. Audit access logs.

**Q: A deployment failed in production. What do you do?**
>
> 1. Rollback immediately (don't debug in production). 2. Verify rollback with health checks. 3. Check deployment logs for the root cause. 4. Reproduce in staging. 5. Fix, test, and redeploy. Always have a rollback plan *before* you deploy.

**Q: What are the benefits of pipeline-as-code?**
> Pipeline configuration lives alongside application code, version-controlled, reviewed in PRs, and reproducible. Changes to the pipeline go through the same review process as code changes. Any team member can understand and modify the pipeline.

**Q: How do you make pipelines faster?**
> Cache dependencies, run independent jobs in parallel, use matrix builds for multi-version testing, fail fast (lint before test), use slim Docker base images, only run relevant jobs (path filters), and avoid unnecessary steps on PRs vs main.

---

## Labs and Projects

Read the sections above first, then work through these **in order**. Every lab ends with a  **Break It** section — those are not optional; they are where the debugging skill actually comes from.

| # | Lab | What you'll do |
|---|-----|----------------|
| 1 | **[GitHub Actions](./labs/lab-01-github-actions.md)** | Go from zero to a working CI/CD pipeline. |
| 2 | **[Jenkins Pipeline](./labs/lab-02-jenkins-pipeline.md)** | Set up Jenkins from scratch using Docker, create a Declarative Pipeline, configure credentials and triggers, and debug common failures. |
| 3 | **[GitLab CI](./labs/lab-03-gitlab-ci.md)** | Take the pipeline you built in Lab 01 and run it on GitLab CI, on the same application, so the difference you learn is the *dialect* rather than the… |
| 4 | **[Azure Pipelines](./labs/lab-04-azure-pipelines.md)** | Run a multi-stage Azure Pipelines build on an agent you own, translating the GitHub Actions concepts from Lab 01 into Azure DevOps vocabulary:… |

**Portfolio project:**

- [Project: Pull Request CI Pipeline](./projects/project-01-pull-request-pipeline.md) — Create a CI pipeline that gives fast feedback on every pull request and blocks changes that fail linting, tests, or build checks.

**Reference code** for every lab: [`code/`](./code/) — real files, validated in CI.

---

## Self-Check

Answer these from memory before you expand them. If more than two give you trouble, re-read the sections they come from — the labs assume this material is solid.

<details>
<summary><strong>1. In what order should pipeline stages run, and why does that order matter more than total runtime?</strong></summary>

Cheapest and most likely to fail first: lint, unit tests, build, then integration tests, scans, and deploy. Feedback speed is what people actually experience — a forty-minute suite that fails on a formatting error teaches everyone to stop watching CI.

</details>

<details>
<summary><strong>2. Blue-green or canary?</strong></summary>

Blue-green runs two complete environments and switches traffic at once: instant rollback, double the infrastructure, and one exposed moment. Canary shifts a small share of real traffic first and watches metrics: it catches what only production traffic reveals, but it is slower and needs observability good enough to make the call.

</details>

<details>
<summary><strong>3. Why should the pipeline build the artefact exactly once?</strong></summary>

Rebuilding per environment means the thing you tested is not the thing you shipped — different base image, different transitive dependency, different timestamp. Build once, then promote that immutable artefact through environments with configuration injected at deploy time.

</details>

<details>
<summary><strong>4. What do CI secrets actually protect you from, and where do they leak?</strong></summary>

Masking in logs prevents accidental printing, not deliberate exfiltration: any step that can run code can read the secrets exposed to it. Pull requests from forks get none by default — reaching for `pull_request_target` to work around that is how repositories hand write access to strangers.

</details>

<details>
<summary><strong>5. A test fails intermittently. Why is re-running it the wrong first move?</strong></summary>

Because the retry hides the defect and trains the team to click until green, at which point the suite stops being evidence of anything. Flakiness has causes you can find: shared state between tests, `latest` tags and unpinned dependencies, ordering assumptions, and real race conditions in the code under test.

</details>

<details>
<summary><strong>6. What has to be true before you let deployment to production happen automatically?</strong></summary>

Tests you actually trust, monitoring that will tell you a release went bad without a human watching, and a rollback that is one automated step. Without those three, automating deployment just means arriving at the outage faster.

</details>

<details>
<summary><strong>7. You know GitHub Actions and the job runs GitLab CI. What are the five things you look for in any CI system, and what is the one GitLab difference that breaks pipelines most often?</strong></summary>

Triggers, the execution environment, the dependency graph, caching/artifacts, and the secret store — find those five and you can read any CI config on day one. The GitLab difference that bites: every job runs inside an image you name, with no ambient toolchain, so a missing binary is a config error rather than a preinstalled convenience. Second place goes to `rules:` — a job whose rules don't match is never created, which looks exactly like a broken pipeline.

</details>

---

## Practical Checkpoint

Before moving on, you should be able to:

- Build a pipeline that runs on pull requests and blocks unsafe changes.
- Separate lint, test, build, scan, and deploy stages with clear failure output.
- Debug pipeline failures by reading logs, reproducing locally, and narrowing the failing stage.

Portfolio evidence to keep:

- Workflow or Jenkinsfile definitions.
- Passing and failing pipeline run notes.
- A short explanation of what each pipeline stage protects.

Suggested project: [Pull Request CI Pipeline](./projects/project-01-pull-request-pipeline.md)

---

## What's Next?

With CI/CD mastered, you can now build the observability stack needed to monitor what your pipelines deploy.

**[Module 07: Observability →](../07-observability/)**

---

<div align="center">

**Module 06 Complete** 

[← Back to Docker](../05-containers-docker/) | [ Cheat Sheet](./cheatsheet.md) | [Next: Observability →](../07-observability/)

</div>


## Reference
<!-- tab: Cheatsheet -->
> GitHub Actions and Jenkins reference. Concepts live in the [module README](./README.md).
> Cross-module daily commands: **[QUICK-REFERENCE.md](../QUICK-REFERENCE.md)**

**Jump to:** [Triggers](#workflow-triggers) · [Contexts](#contexts--expressions) · [Jobs & steps](#jobs--steps) · [Matrix](#matrix-builds) · [Caching](#caching) · [Artifacts](#artifacts--outputs) · [Secrets & OIDC](#secrets--oidc) · [Reusable](#reusable-workflows--composite-actions) · [Full pipeline](#a-complete-pipeline) · [gh CLI](#debugging-with-gh) · [Jenkins](#jenkins) · [Errors](#error-decoder)

---

## Workflow Triggers

```yaml
on:
  push:
    branches: [main, 'release/**']
    paths: ['src/**', 'Dockerfile']          # only run when these change
    paths-ignore: ['**.md', 'docs/**']
    tags: ['v*.*.*']
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened, ready_for_review]
  schedule:
    - cron: '0 3 * * *'                      # UTC only. Not guaranteed on time
  workflow_dispatch:                          #  manual run button
    inputs:
      environment:
        type: choice
        options: [staging, production]
        required: true
      dry_run:
        type: boolean
        default: true
  workflow_call:                              # callable from another workflow
  workflow_run:
    workflows: ["CI"]
    types: [completed]
  release:
    types: [published]
  issue_comment:
    types: [created]
```

```yaml
# Cancel superseded runs on the same branch — saves a lot of runner minutes 
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

# Never cancel a production deploy midway
concurrency:
  group: deploy-production
  cancel-in-progress: false
```

---

## Contexts & Expressions

| Expression | Value |
|------------|-------|
| `${{ github.repository }}` | `owner/repo` |
| `${{ github.ref }}` | `refs/heads/main`, `refs/tags/v1.0.0` |
| `${{ github.ref_name }}` | `main`, `v1.0.0` |
| `${{ github.sha }}` | Full commit SHA |
| `${{ github.event_name }}` | `push`, `pull_request`, … |
| `${{ github.actor }}` | Who triggered it |
| `${{ github.run_id }}` / `run_number` / `run_attempt` | Run identifiers |
| `${{ github.workspace }}` | Checkout directory |
| `${{ github.event.pull_request.number }}` | PR number |
| `${{ secrets.NAME }}` | Encrypted secret |
| `${{ vars.NAME }}` | Non-secret configuration variable |
| `${{ env.NAME }}` | Environment variable |
| `${{ runner.os }}` / `runner.temp` / `runner.arch` | Runner info |
| `${{ job.status }}` | `success`, `failure`, `cancelled` |
| `${{ steps.<id>.outputs.<key> }}` | Output from an earlier step |
| `${{ needs.<job>.outputs.<key> }}` | Output from an upstream job |

**Functions:** `contains()` · `startsWith()` · `endsWith()` · `format()` · `join()` · `toJSON()` · `fromJSON()` · `hashFiles()` · `success()` · `failure()` · `always()` · `cancelled()`

```yaml
if: github.ref == 'refs/heads/main'
if: github.event_name == 'pull_request'
if: contains(github.event.head_commit.message, '[skip ci]') == false
if: startsWith(github.ref, 'refs/tags/v')
if: failure()                                 # only when a previous step failed
if: always()                                  #  run even after failure (cleanup, reports)
if: success() && github.actor != 'dependabot[bot]'
if: github.event.pull_request.draft == false
```

>`${{ }}` interpolation happens **before** the shell sees the line, so untrusted input (PR titles, branch names, issue bodies) becomes shell code. Never write `run: echo "${{ github.event.pull_request.title }}"`. Pass it through `env:` instead and reference `"$TITLE"`.

---

## Jobs & Steps

```yaml
jobs:
  build:
    name: Build and test
    runs-on: ubuntu-latest              # ubuntu-24.04 | windows-latest | macos-latest
                                        # or: [self-hosted, linux, x64]
    timeout-minutes: 15                 #  always set — stops runaway jobs burning minutes
    needs: [lint]                       # dependency: run after lint
    if: github.event_name == 'push'
    permissions:                        #  least privilege for GITHUB_TOKEN
      contents: read
      packages: write
      id-token: write                   # required for OIDC
    environment:
      name: production                  # ties into environment protection rules/approvals
      url: https://example.com
    outputs:
      image_tag: ${{ steps.meta.outputs.tag }}
    defaults:
      run:
        working-directory: ./app
        shell: bash
    env:
      LOG_LEVEL: debug
    services:                           #  sidecar containers for integration tests
      postgres:
        image: postgres:15
        env: {POSTGRES_PASSWORD: test}
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready --health-interval 10s
          --health-timeout 5s --health-retries 5

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0                # full history (needed for tags/changelogs)

      - name: Compute image tag
        id: meta
        run: echo "tag=${GITHUB_SHA::7}" >> "$GITHUB_OUTPUT"

      - name: Multi-line script
        run: |
          set -euo pipefail
          make build
          make test
        env:
          API_TOKEN: ${{ secrets.API_TOKEN }}

      - name: Continue even if this fails
        continue-on-error: true
        run: ./optional-check.sh

      - name: Always upload the report
        if: always()
        uses: actions/upload-artifact@v4
        with: {name: test-report, path: reports/}
```

### Workflow commands

```bash
echo "key=value"        >> "$GITHUB_OUTPUT"    # step output
echo "KEY=value"        >> "$GITHUB_ENV"       # env var for LATER steps
echo "/opt/tool/bin"    >> "$GITHUB_PATH"      # prepend to PATH
echo "## Results"       >> "$GITHUB_STEP_SUMMARY"   #  markdown on the run page

echo "::error file=app.js,line=10::Something broke"
echo "::warning::Deprecated API in use"
echo "::notice::Deployed to staging"
echo "::group::Detailed logs"; ...; echo "::endgroup::"
echo "::add-mask::$SENSITIVE_VALUE"            # redact a computed value from logs
```

### Essential actions

| Action | Purpose |
|--------|---------|
| `actions/checkout@v4` | Clone the repo |
| `actions/setup-node@v4` / `setup-python@v5` / `setup-go@v5` / `setup-java@v4` | Toolchains (with built-in caching) |
| `actions/cache@v4` | Cache arbitrary directories |
| `actions/upload-artifact@v4` / `download-artifact@v4` | Move files between jobs |
| `docker/setup-buildx-action@v3` | BuildKit builder |
| `docker/login-action@v3` | Registry auth |
| `docker/build-push-action@v6` | Build + push with layer caching |
| `docker/metadata-action@v5` | Generate tags and OCI labels |
| `aws-actions/configure-aws-credentials@v4` | AWS auth (supports OIDC) |
| `azure/login@v2`, `google-github-actions/auth@v2` | Azure / GCP auth |
| `hashicorp/setup-terraform@v3` | Terraform CLI |
| `aquasecurity/trivy-action@master` | Vulnerability scanning |
| `github/codeql-action/analyze@v3` | SAST |
| `softprops/action-gh-release@v2` | Create releases |
| `peter-evans/create-pull-request@v6` | Bot-authored PRs |

>Pin third-party actions to a **full commit SHA**, not a tag: `uses: foo/bar@a1b2c3d...`. Tags are mutable — a compromised maintainer can repoint `@v1` at malicious code that then runs with your secrets.

---

## Matrix Builds

```yaml
strategy:
  fail-fast: false            #  don't cancel siblings when one fails
  max-parallel: 4
  matrix:
    os: [ubuntu-latest, macos-latest]
    node: [18, 20, 22]
    include:
      - os: ubuntu-latest
        node: 22
        coverage: true        # extra variable for one combination
    exclude:
      - os: macos-latest
        node: 18

runs-on: ${{ matrix.os }}
steps:
  - uses: actions/setup-node@v4
    with: {node-version: '${{ matrix.node }}'}

# Dynamic matrix generated by an upstream job
strategy:
  matrix:
    service: ${{ fromJSON(needs.discover.outputs.services) }}
```

---

## Caching

```yaml
# Generic cache
- uses: actions/cache@v4
  with:
    path: |
      ~/.cache/pip
      ~/.npm
    key: ${{ runner.os }}-deps-${{ hashFiles('**/requirements.txt', '**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-deps-

# Built into the setup actions — simpler and usually enough
- uses: actions/setup-node@v4
  with: {node-version: '20', cache: 'npm'}
- uses: actions/setup-python@v5
  with: {python-version: '3.12', cache: 'pip'}

# Docker layer caching via GitHub's cache backend
- uses: docker/build-push-action@v6
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

| Rule | Why |
|------|-----|
| Key must include a **hash of the lockfile** | Otherwise you restore stale dependencies |
| `restore-keys` gives a partial-match fallback | A near-miss cache still beats a cold install |
| Caches are **immutable** once written for a key | Change the key to invalidate |
| Branch caches are isolated; `main`'s cache is readable by PRs | Warm `main` and PRs benefit |
| Don't cache the build **output** | Cache dependencies; rebuild artifacts |

---

## Artifacts & Outputs

```yaml
# Job A: produce
- uses: actions/upload-artifact@v4
  with:
    name: dist
    path: dist/
    retention-days: 7
    if-no-files-found: error       #  fail loudly instead of silently uploading nothing

# Job B: consume (needs: [a])
- uses: actions/download-artifact@v4
  with: {name: dist, path: dist/}

# Pass a value instead of a file
jobs:
  build:
    outputs:
      version: ${{ steps.v.outputs.version }}
    steps:
      - id: v
        run: echo "version=1.2.3" >> "$GITHUB_OUTPUT"
  deploy:
    needs: build
    steps:
      - run: echo "Deploying ${{ needs.build.outputs.version }}"
```

>**Each job runs on a fresh machine.** Files from an earlier job do not exist unless you upload/download them, and neither does the checkout. This is the single most common Actions surprise.

---

## Secrets & OIDC

```yaml
env:
  TOKEN: ${{ secrets.API_TOKEN }}
  # Organisation, repository, or environment-scoped secrets all resolve here
```

```bash
gh secret set API_TOKEN                             # reads from stdin
gh secret set API_TOKEN --env production
gh secret list
gh variable set LOG_LEVEL --body "info"             # non-secret config
```

**OIDC — stop storing long-lived cloud keys entirely:**

```yaml
permissions:
  id-token: write        #  required
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/github-actions-deploy
      aws-region: us-east-1
      # no access keys anywhere
```

The AWS trust policy restricts which repo and ref may assume the role:

```json
{
  "Effect": "Allow",
  "Principal": {"Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"},
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {
    "StringEquals": {"token.actions.githubusercontent.com:aud": "sts.amazonaws.com"},
    "StringLike":   {"token.actions.githubusercontent.com:sub": "repo:myorg/myrepo:ref:refs/heads/main"}
  }
}
```

**Secret hygiene:**

- Secrets are **not** passed to workflows triggered by `pull_request` from a fork — by design
- `pull_request_target` **does** get secrets and runs against the base repo — a known privilege-escalation vector. Never check out and execute PR code in it
- Set `permissions:` explicitly; the default `GITHUB_TOKEN` is often broader than needed
- GitHub masks known secret values in logs, but not values you derive from them — use `::add-mask::`
- Use **environments** with required reviewers for production secrets

---

## Reusable Workflows & Composite Actions

```yaml
# .github/workflows/reusable-deploy.yml
on:
  workflow_call:
    inputs:
      environment: {required: true, type: string}
      image_tag:   {required: true, type: string}
    secrets:
      deploy_key:  {required: true}
    outputs:
      url: {value: "${{ jobs.deploy.outputs.url }}"}

# Caller
jobs:
  staging:
    uses: ./.github/workflows/reusable-deploy.yml
    with: {environment: staging, image_tag: "${{ github.sha }}"}
    secrets: inherit
```

```yaml
# .github/actions/setup/action.yml — composite action
name: Setup toolchain
inputs:
  node-version: {default: '20'}
runs:
  using: composite
  steps:
    - uses: actions/setup-node@v4
      with: {node-version: "${{ inputs.node-version }}", cache: npm}
    - run: npm ci
      shell: bash        #  required in composite actions
```

---

## A Complete Pipeline

```yaml
name: CI/CD
on:
  push: {branches: [main]}
  pull_request: {branches: [main]}

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  REGISTRY: ghcr.io
  IMAGE: ${{ github.repository }}

jobs:
  quality:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    permissions: {contents: read}
    strategy:
      fail-fast: false
      matrix:
        check: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: '20', cache: npm}
      - run: npm ci
      - run: npm run ${{ matrix.check }}

  security:
    runs-on: ubuntu-latest
    permissions: {contents: read, security-events: write}
    steps:
      - uses: actions/checkout@v4
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: fs
          format: sarif
          output: trivy.sarif
          severity: HIGH,CRITICAL
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with: {sarif_file: trivy.sarif}

  build:
    needs: [quality, security]
    runs-on: ubuntu-latest
    permissions: {contents: read, packages: write}
    outputs:
      digest: ${{ steps.push.outputs.digest }}
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE }}
          tags: |
            type=sha,format=long
            type=ref,event=branch
            type=semver,pattern={{version}}
      - id: push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      - name: Scan the built image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE }}@${{ steps.push.outputs.digest }}
          severity: HIGH,CRITICAL
          exit-code: '1'          #  fail the build on real vulnerabilities

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: {name: production, url: 'https://example.com'}
    permissions: {contents: read, id-token: write}
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE }}
          aws-region: us-east-1
      - name: Deploy the exact digest that was scanned
        run: |
          kubectl set image deployment/app \
            app=${{ env.REGISTRY }}/${{ env.IMAGE }}@${{ needs.build.outputs.digest }}
          kubectl rollout status deployment/app --timeout=5m
      - name: Smoke test
        run: curl -fsS --retry 5 --retry-delay 5 https://example.com/health
      - name: Roll back on failure
        if: failure()
        run: kubectl rollout undo deployment/app
```

---

## Debugging with `gh`

```bash
gh run list --limit 10
gh run list --workflow=ci.yml --branch main --status failure
gh run view 12345
gh run view 12345 --log                 # full log
gh run view 12345 --log-failed          #  only the steps that failed
gh run view 12345 --job 67890 --log
gh run watch                            # live-follow the newest run
gh run rerun 12345 --failed             # re-run only failed jobs
gh run rerun 12345 --debug              # enable step debug logging
gh run download 12345                   # fetch artifacts
gh run cancel 12345

gh workflow list
gh workflow run deploy.yml -f environment=staging -f dry_run=false
gh workflow disable ci.yml / enable ci.yml

# Enable verbose logging repo-wide
gh secret set ACTIONS_STEP_DEBUG --body true
gh secret set ACTIONS_RUNNER_DEBUG --body true

# Run workflows locally
act -j build                            # nektos/act
act pull_request --secret-file .secrets
actionlint                              #  static analysis for workflow YAML
```

---

## GitLab CI

Same five moving parts as Actions, different names. `gitlab-ci-local` runs a job on your machine.

```yaml
stages: [lint, test, build, deploy]

default:
  image: python:3.12-slim        #  every job runs IN a container. No ambient toolchain
  interruptible: true            # a new push cancels the old pipeline

variables:
  IMAGE: "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"

test:
  stage: test
  script: [pytest --junitxml=report.xml]
  artifacts:
    when: always                 #  upload the report even when the job failed
    reports: {junit: report.xml}
    expire_in: 1 week
  cache:
    key: {files: [requirements.txt]}
    paths: [.cache/pip]
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

deploy:
  stage: deploy
  script: [./deploy.sh production]
  environment: {name: production, url: "https://example.com"}
  when: manual                   # the approval gate
  dependencies: []               #  don't download upstream artifacts you don't need
```

```bash
npx gitlab-ci-local --list            #  which jobs WOULD be created for this ref
npx gitlab-ci-local test              # run one job locally in Docker — fastest debug loop
npx gitlab-ci-local --variable CI_COMMIT_BRANCH=main test
gitlab-runner verify                  # (self-hosted runners) registered and reachable?
# UI: Build → Pipeline editor → Validate · Lint tab simulates job creation
```

 `gitlab-runner exec` was removed in Runner **17.0** (deprecated in 15.7). Use `gitlab-ci-local`.

| Variable | Is |
|----------|-----|
| `CI_PIPELINE_SOURCE` | `push` · `merge_request_event` · `schedule` · `web` — the main `rules:` input |
| `CI_COMMIT_SHA` / `CI_COMMIT_SHORT_SHA` | Tag images with this, never `latest` |
| `CI_COMMIT_BRANCH` / `CI_DEFAULT_BRANCH` | Branch guards |
| `CI_REGISTRY*` | Built-in registry host, user, password |
| `CI_ENVIRONMENT_NAME` | Which environment this job deploys to |

| Symptom | Cause |
|---------|-------|
| Job silently never runs | No `rules:` matched — a job with no match isn't created, which looks identical to a broken pipeline |
| `command not found` | The tool isn't in the job's `image:` |
| Works locally, fails on a shell runner | `shell` executor leaks state between jobs — no isolation |
| Stage 4 job downloads 500 MB | Artifacts flow forward automatically — `dependencies: []` |

---

## Jenkins

### Declarative pipeline

```groovy
pipeline {
    agent { docker { image 'node:20-slim'; args '-u root' } }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
        timestamps()
        ansiColor('xterm')
    }

    environment {
        REGISTRY   = 'ghcr.io/myorg'
        IMAGE_TAG  = "${env.GIT_COMMIT.take(7)}"
        NPM_TOKEN  = credentials('npm-token')      //  auto-masked in logs
    }

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['staging', 'production'])
        booleanParam(name: 'SKIP_TESTS', defaultValue: false)
    }

    triggers {
        cron('H 3 * * *')          // H spreads load across the hour
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Checkout') { steps { checkout scm } }

        stage('Quality') {
            parallel {
                stage('Lint') { steps { sh 'npm ci && npm run lint' } }
                stage('Test') {
                    when { expression { !params.SKIP_TESTS } }
                    steps { sh 'npm test -- --ci --reporters=jest-junit' }
                    post { always { junit 'junit.xml' } }
                }
            }
        }

        stage('Build image') {
            steps {
                sh 'docker build -t $REGISTRY/app:$IMAGE_TAG .'
                sh 'trivy image --exit-code 1 --severity HIGH,CRITICAL $REGISTRY/app:$IMAGE_TAG'
            }
        }

        stage('Deploy') {
            when { branch 'main' }
            steps {
                script {
                    if (params.ENVIRONMENT == 'production') {
                        timeout(time: 15, unit: 'MINUTES') {
                            input message: 'Deploy to production?', ok: 'Ship it'
                        }
                    }
                }
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh 'kubectl set image deployment/app app=$REGISTRY/app:$IMAGE_TAG'
                    sh 'kubectl rollout status deployment/app --timeout=5m'
                }
            }
        }
    }

    post {
        always  { archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: true; cleanWs() }
        success { slackSend color: 'good',   message: " ${env.JOB_NAME} #${env.BUILD_NUMBER}" }
        failure { slackSend color: 'danger', message: " ${env.JOB_NAME} #${env.BUILD_NUMBER} — ${env.BUILD_URL}" }
    }
}
```

### Jenkins reference

| Concept | Syntax |
|---------|--------|
| Conditional stage | `when { branch 'main' }`, `when { expression { ... } }`, `when { changeset "src/**" }` |
| Parallel stages | `parallel { stage('A'){...} stage('B'){...} }` |
| Manual gate | `input message: 'Proceed?'` (wrap in `timeout`) |
| Retry | `retry(3) { sh './flaky.sh' }` |
| Credentials | `withCredentials([usernamePassword(...), string(...), file(...)])` |
| Shared library | `@Library('my-lib@main') _` |
| Skip a stage's SCM checkout | `options { skipDefaultCheckout() }` |
| Post conditions | `always`, `success`, `failure`, `unstable`, `changed`, `aborted`, `cleanup` |
| Environment from a script | `environment { VER = sh(script: 'cat VERSION', returnStdout: true).trim() }` |

```bash
# Jenkins CLI
java -jar jenkins-cli.jar -s http://jenkins:8080 -auth user:token list-jobs
java -jar jenkins-cli.jar -s http://jenkins:8080 -auth user:token build my-job -f -v
curl -X POST "http://jenkins:8080/job/my-job/build" --user user:token

# Validate a Jenkinsfile before pushing 
curl -X POST -F "jenkinsfile=<Jenkinsfile" http://jenkins:8080/pipeline-model-converter/validate
```

---

## Error Decoder

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Error: Resource not accessible by integration` | `GITHUB_TOKEN` lacks a permission | Add it under `permissions:` |
| Secret is empty in a fork PR | Secrets aren't shared with fork PRs | Use `pull_request_target` carefully, or a `workflow_run` pattern |
| File missing in the next job | Jobs don't share a filesystem | `upload-artifact` / `download-artifact` |
| Cache never hits | Key doesn't change with the lockfile, or restore-keys missing | Include `hashFiles(...)` in the key |
| Job hangs until it's killed | Waiting on stdin, or no timeout set | Add `timeout-minutes`, use non-interactive flags |
| `denied: permission_denied` pushing to GHCR | Missing `packages: write` | Add the permission; check the package's linked repo |
| Works locally, fails in CI | Environment differences | Same container image locally and in CI; print `env`, versions, and OS |
| Random test failures | Shared state / real time / network flakiness | Isolate tests, seed randomness, mock the network |
| `exit code 137` in a build step | Runner ran out of memory | Reduce parallelism, use a bigger runner |
| Deploy used the wrong image | Rebuilt between stages, or `:latest` | Promote an **immutable digest** through environments |
| Workflow doesn't trigger | `paths:` filter, branch mismatch, or YAML in the wrong place | Must be on the default branch under `.github/workflows/`; validate with `actionlint` |

---

<div align="center">

[← Module 06 README](./README.md) · [Resources](./resources.md) · [Labs](./labs/) · [Handbook Quick Reference](../QUICK-REFERENCE.md)

</div>
<!-- tab: Labs -->
# Lab 01: GitHub Actions — Build Your First CI/CD Pipeline

## Objective

Go from zero to a working CI/CD pipeline. You'll create GitHub Actions workflows that lint, test, build Docker images, and deploy — the exact pipeline pattern used in production.

---

## Prerequisites

- A GitHub account with a repository (public or private)
- Docker installed locally (`docker --version`)
- Python 3.10+ or Node.js 18+ installed
- Completed Module 05 (Docker)

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
cp -r /path/to/the-devops-handbook/06-ci-cd/code/lab-01/. .
```

Use Option B when you're comparing against a known-good version, or when something
won't start and you need to rule out a typo. See [`../code/README.md`](../code/README.md).

---

## Exercise 1: Your First Workflow

### Step 1: Create the Workflow File

```bash
# In your project repository
mkdir -p .github/workflows

cat > .github/workflows/hello.yml << 'WORKFLOW'
name: Hello CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:    # Manual trigger

jobs:
  hello:
    name: Hello World
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Print info
        run: |
          echo " Hello from GitHub Actions!"
          echo "Repository: ${{ github.repository }}"
          echo "Branch: ${{ github.ref_name }}"
          echo "Commit: ${{ github.sha }}"
          echo "Triggered by: ${{ github.event_name }}"
          echo "Runner OS: ${{ runner.os }}"

      - name: List files
        run: ls -la

      - name: Check tools
        run: |
          python3 --version || echo "No Python"
          node --version || echo "No Node"
          docker --version || echo "No Docker"
WORKFLOW
```

### Step 2: Push and Watch

```bash
git add .github/workflows/hello.yml
git commit -m "ci: add hello world workflow"
git push origin main
```

Go to your repo on GitHub → **Actions** tab → Watch the workflow run!

### Step 3: Trigger Manually

1. Go to **Actions** → **Hello CI** → **Run workflow** (dropdown on the right)
2. Click **Run workflow**
3. Watch it execute

** Checkpoint:** You should see a green checkmark. Read every log line — understand what's happening.

---

## Exercise 2: Build a Real CI Pipeline

### Step 1: Create a Python App to Test

```bash
# Create project structure
mkdir -p src tests

# Application code
cat > src/app.py << 'APP'
def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b

def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b

def divide(a: int, b: int) -> float:
    """Divide two numbers."""
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

def is_even(n: int) -> bool:
    """Check if a number is even."""
    return n % 2 == 0
APP

# Tests
cat > tests/test_app.py << 'TEST'
import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
from app import add, multiply, divide, is_even

def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0
    assert add(0, 0) == 0

def test_multiply():
    assert multiply(3, 4) == 12
    assert multiply(-2, 3) == -6
    assert multiply(0, 100) == 0

def test_divide():
    assert divide(10, 2) == 5.0
    assert divide(7, 2) == 3.5

def test_divide_by_zero():
    with pytest.raises(ValueError, match="Cannot divide by zero"):
        divide(10, 0)

def test_is_even():
    assert is_even(4) is True
    assert is_even(3) is False
    assert is_even(0) is True
TEST

# Requirements
cat > requirements.txt << 'REQ'
pytest==8.0.0
pytest-cov==4.1.0
flake8==7.0.0
black==24.1.0
REQ
```

### Step 2: Create the CI Workflow

```bash
cat > .github/workflows/ci.yml << 'WORKFLOW'
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Cache pip
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('requirements.txt') }}
          restore-keys: ${{ runner.os }}-pip-

      - name: Install linters
        run: pip install flake8 black

      - name: Run flake8
        run: flake8 src/ tests/ --max-line-length=120

      - name: Check formatting
        run: black --check src/ tests/

  test:
    name: Test (Python ${{ matrix.python-version }})
    runs-on: ubuntu-latest
    needs: lint
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}

      - name: Cache pip
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ matrix.python-version }}-${{ hashFiles('requirements.txt') }}

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run tests with coverage
        run: pytest tests/ -v --cov=src --cov-report=xml --cov-report=term

      - name: Upload coverage report
        if: matrix.python-version == '3.12'
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage.xml
          retention-days: 7

  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:${{ github.sha }}
            ghcr.io/${{ github.repository }}:latest
WORKFLOW
```

### Step 3: Add a Dockerfile

```bash
cat > Dockerfile << 'DOCKERFILE'
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./src/
RUN useradd -r appuser
USER appuser
CMD ["python", "-c", "from src.app import add; print(f'2+3={add(2,3)}')"]
DOCKERFILE
```

### Step 4: Push and Verify

```bash
git add -A
git commit -m "ci: add full CI pipeline with lint, test, build"
git push origin main
```

Watch the pipeline in **Actions** tab:

1. **Lint** runs first (flake8 + black)
2. **Test** runs after lint passes (3 Python versions in parallel)
3. **Build** runs after all tests pass (pushes Docker image to GHCR)

** Checkpoint:** All three jobs should be green. The Docker image should appear in your repo's Packages.

---

## Exercise 3: Create a PR Workflow

### Step 1: Create a Feature Branch

```bash
git checkout -b feature/add-subtract

# Add new function
cat >> src/app.py << 'FUNC'

def subtract(a: int, b: int) -> int:
    """Subtract b from a."""
    return a - b
FUNC

# Add test
cat >> tests/test_app.py << 'TEST'

from app import subtract

def test_subtract():
    assert subtract(5, 3) == 2
    assert subtract(0, 5) == -5
    assert subtract(-3, -3) == 0
TEST

git add -A
git commit -m "feat: add subtract function"
git push origin feature/add-subtract
```

### Step 2: Create a Pull Request

1. Go to GitHub → your repo → **Pull requests** → **New pull request**
2. Select `feature/add-subtract` → `main`
3. Watch the CI pipeline run on the PR
4. Notice: **Build** job is skipped (it only runs on push to main)

** Checkpoint:** The PR shows CI status checks. Lint and Test must pass before merging.

---

## Break It: Debug Failing Workflows

### Failure 1: YAML Syntax Error

```yaml
# Create a broken workflow
name: Broken
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo "hello"
       - run: echo "bad indent"   # ← Wrong indentation!
```

Push this and observe: the workflow won't even start. GitHub shows a YAML parse error. **Fix:** proper indentation.

### Failure 2: Missing Secret

```yaml
      - name: Deploy
        env:
          API_KEY: ${{ secrets.MY_API_KEY }}   # Secret doesn't exist!
        run: |
          if [ -z "$API_KEY" ]; then
            echo "ERROR: API_KEY not set!"
            exit 1
          fi
```

The variable will be empty, not cause an error by default. **Fix:** Add the secret in Settings → Secrets → Actions.

### Failure 3: Test Failures

```bash
# Break a test intentionally
echo "def test_broken(): assert 1 == 2" >> tests/test_app.py
git add tests/ && git commit -m "test: broken test"
git push
```

Watch the pipeline fail at the Test stage. Read the logs — find the assertion error. **Fix:** correct the test, push again.

---

## Validation

- [ ] Create and run a basic GitHub Actions workflow
- [ ] Build a multi-stage CI pipeline (lint → test → build)
- [ ] Use matrix builds to test across multiple Python versions
- [ ] Cache dependencies to speed up pipelines
- [ ] Upload artifacts (coverage reports)
- [ ] Build and push Docker images from CI
- [ ] Create a PR and observe CI checks
- [ ] Debug a failing workflow by reading logs
- [ ] Explain the difference between `push` and `pull_request` triggers

## What to Commit

Add these to your portfolio repo as evidence of completed work:

- GitHub Actions workflow YAML files you created
- Screenshot or link to passing and failing pipeline runs
- Debug notes from the Break It workflow failures

---

[← Back to Module README](../README.md) | [Next Lab: Jenkins Pipeline →](./lab-02-jenkins-pipeline.md)

---

# Lab 02: Jenkins Pipeline

## Objective

Set up Jenkins from scratch using Docker, create a Declarative Pipeline, configure credentials and triggers, and debug common failures. Understanding Jenkins is essential — it's still the backbone of CI/CD in many enterprises.

---

## Prerequisites

- Docker installed and running
- Completed Lab 01 (GitHub Actions)
- A GitHub repository with your Python app from Lab 01

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
[`../code/lab-02/`](../code/lab-02/) (2 files).

```bash
# Option A — type them out yourself (recommended the first time; that's the learning)
# Option B — start from the reference copies
cp -r /path/to/the-devops-handbook/06-ci-cd/code/lab-02/. .
```

Use Option B when you're comparing against a known-good version, or when something
won't start and you need to rule out a typo. See [`../code/README.md`](../code/README.md).

---

## Exercise 1: Run Jenkins in Docker

### Step 1: Start Jenkins

```bash
mkdir -p ~/devops-labs/module-06/jenkins
cd ~/devops-labs/module-06/jenkins

# Create a Docker Compose file for Jenkins
cat > docker-compose.yml << 'COMPOSE'
services:
  jenkins:
    image: jenkins/jenkins:lts-jdk17
    container_name: jenkins
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - JAVA_OPTS=-Djenkins.install.runSetupWizard=false
    restart: unless-stopped

volumes:
  jenkins_home:
COMPOSE

# Start Jenkins
docker compose up -d

# Wait for Jenkins to start
echo "Waiting for Jenkins to start..."
sleep 30

# Get the initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Step 2: Initial Setup

1. Open `http://localhost:8080` in your browser
2. Enter the admin password from the command above
3. Click **Install suggested plugins** (wait ~2 minutes)
4. Create your admin user
5. Accept the default Jenkins URL

### Step 3: Install Additional Plugins

Go to **Manage Jenkins → Plugins → Available plugins** and install:

- **Pipeline** (usually pre-installed)
- **Git**
- **Docker Pipeline**
- **Blue Ocean** (modern UI)

** Checkpoint:** Jenkins dashboard is accessible at `http://localhost:8080`.

---

## Exercise 2: Create a Declarative Pipeline

### Step 1: Create a Pipeline Job

1. Click **New Item** on the Jenkins dashboard
2. Enter name: `my-python-pipeline`
3. Select **Pipeline**
4. Click **OK**

### Step 2: Write the Pipeline Script

In the job configuration, scroll to **Pipeline** section. Select **Pipeline script** and paste:

```groovy
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo ' Checking out code...'
                // For this lab, we create files inline
                // In production, you'd use: checkout scm
                writeFile file: 'app.py', text: '''
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b
'''
                writeFile file: 'test_app.py', text: '''
import pytest
from app import add, multiply, divide

def test_add():
    assert add(2, 3) == 5

def test_multiply():
    assert multiply(3, 4) == 12

def test_divide():
    assert divide(10, 2) == 5.0

def test_divide_by_zero():
    with pytest.raises(ValueError):
        divide(10, 0)
'''
                writeFile file: 'requirements.txt', text: 'pytest==8.0.0\npytest-cov==4.1.0\n'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo ' Installing dependencies...'
                sh 'pip install -r requirements.txt || pip3 install -r requirements.txt'
            }
        }

        stage('Test') {
            steps {
                echo ' Running tests...'
                sh 'python -m pytest test_app.py -v --junitxml=results.xml || python3 -m pytest test_app.py -v --junitxml=results.xml'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'results.xml'
                }
            }
        }

        stage('Build Info') {
            steps {
                echo " Build #${env.BUILD_NUMBER} completed"
                echo "Job: ${env.JOB_NAME}"
                echo "Workspace: ${env.WORKSPACE}"
            }
        }
    }

    post {
        success {
            echo ' Pipeline completed successfully!'
        }
        failure {
            echo ' Pipeline failed!'
        }
        always {
            echo ' Cleaning up...'
            cleanWs()
        }
    }
}
```

### Step 3: Run the Pipeline

1. Click **Save**
2. Click **Build Now** (left sidebar)
3. Click on the build number → **Console Output** to see logs
4. Or click **Blue Ocean** (left sidebar) for the modern visual view

** Checkpoint:** All stages should be green. Click into each stage to read the logs.

---

## Exercise 3: Pipeline from SCM (Jenkinsfile)

### Step 1: Create a Jenkinsfile in Your Repo

```bash
cd ~/devops-labs/module-06

# Create a sample project with a Jenkinsfile
mkdir -p jenkins-project && cd jenkins-project
git init

# Create the Jenkinsfile
cat > Jenkinsfile << 'JENKINSFILE'
pipeline {
    agent any

    environment {
        APP_NAME = 'my-app'
        APP_VERSION = '1.0.0'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Building ${APP_NAME} v${APP_VERSION}"
            }
        }

        stage('Lint') {
            steps {
                echo ' Linting...'
                sh '''
                    if command -v flake8 > /dev/null 2>&1; then
                        flake8 *.py --max-line-length=120 || true
                    else
                        echo "flake8 not installed, skipping lint"
                    fi
                '''
            }
        }

        stage('Test') {
            steps {
                echo ' Testing...'
                sh '''
                    pip install pytest --quiet 2>/dev/null || pip3 install pytest --quiet 2>/dev/null
                    python -m pytest test_app.py -v 2>/dev/null || python3 -m pytest test_app.py -v 2>/dev/null || echo "No tests found"
                '''
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                echo ' Deploying to staging...'
                echo "Would deploy ${APP_NAME}:${APP_VERSION}"
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            input {
                message 'Deploy to production?'
                ok 'Yes, deploy!'
                submitter 'admin'
            }
            steps {
                echo ' Deploying to production...'
                echo "Deployed ${APP_NAME}:${APP_VERSION} to production"
            }
        }
    }

    post {
        success {
            echo " ${APP_NAME} pipeline succeeded"
        }
        failure {
            echo " ${APP_NAME} pipeline failed"
        }
    }
}
JENKINSFILE

git add -A
git commit -m "ci: add Jenkinsfile"
```

### Step 2: Create a Pipeline Job from SCM

1. Jenkins dashboard → **New Item** → name: `scm-pipeline` → **Pipeline**
2. Under **Pipeline**, change **Definition** to: **Pipeline script from SCM**
3. **SCM**: Git
4. **Repository URL**: path to your local repo or GitHub URL
5. **Branch**: `*/main`
6. **Script Path**: `Jenkinsfile`
7. **Save** → **Build Now**

** Checkpoint:** Jenkins reads the Jenkinsfile from your repo and executes the pipeline.

---

## Break It: Debug Jenkins Failures

### Failure 1: Groovy Syntax Error

```groovy
// Add this broken stage to your Jenkinsfile
stage('Broken') {
    steps {
        echo 'Missing closing brace'
    }
// Missing closing brace for stage!
```

**What happens:** Pipeline fails to parse. The error message points to a line number.
**Fix:** Always match braces. Use an IDE with Groovy syntax highlighting.

### Failure 2: Permission Denied

```groovy
stage('Docker') {
    steps {
        sh 'docker build -t myapp .'  // Jenkins user can't access Docker socket
    }
}
```

**What happens:** `permission denied` when accessing `/var/run/docker.sock`.
**Fix:** Add Jenkins user to docker group, or mount the socket with proper permissions.

### Failure 3: Workspace Issues

```groovy
stage('Read File') {
    steps {
        sh 'cat /some/absolute/path/config.yml'  // Path doesn't exist on agent
    }
}
```

**What happens:** File not found. Jenkins runs on agents — files must be in the workspace.
**Fix:** Use `${WORKSPACE}` path or `checkout scm` to get files.

---

## Clean Up

```bash
# Stop Jenkins
cd ~/devops-labs/module-06/jenkins
docker compose down -v

# Remove all lab data (optional)
# rm -rf ~/devops-labs/module-06
```

---

## Validation

- [ ] Run Jenkins in Docker and complete initial setup
- [ ] Create and run a Declarative Pipeline with multiple stages
- [ ] Read and understand Jenkins Console Output logs
- [ ] Create a Pipeline from SCM (Jenkinsfile in repo)
- [ ] Use `post` blocks for cleanup and notifications
- [ ] Use `input` for manual approval gates
- [ ] Use `when` conditions for branch-specific stages
- [ ] Debug at least one pipeline failure by reading error logs
- [ ] Explain the difference between Scripted and Declarative pipelines

---

[← Previous Lab: GitHub Actions](./lab-01-github-actions.md) |

## What to Commit

Add these to your portfolio repo as evidence of completed work:

- Jenkinsfile with multi-stage declarative pipeline
- Docker Compose file for the Jenkins setup
- Pipeline debug notes from the Break It section

---

[← Previous Lab: GitHub Actions](./lab-01-github-actions.md) | [Back to Module README](../README.md) | [Next Lab: GitLab CI →](./lab-03-gitlab-ci.md)

---

# Lab 03: GitLab CI — The Same Pipeline, Translated

## Objective

Take the pipeline you built in Lab 01 and run it on GitLab CI, on the same application, so the difference you learn is the *dialect* rather than the concepts. Then break the four things that break in GitLab specifically — a job that is never created, a missing tool, an artifact that never arrives, and a secret that is silently empty.

The transferable skill is not YAML syntax. It is knowing that every CI system has the same five moving parts, and being able to find them in an hour on a system you have never used.

---

## Prerequisites

- Read [§7 GitLab CI — Translating What You Know](../README.md#7-gitlab-ci--translating-what-you-know)
- Completed [Lab 01: GitHub Actions](./lab-01-github-actions.md) — you will reuse its application
- A free [gitlab.com](https://gitlab.com) account. The free tier includes CI minutes and a container registry, which is all this lab needs
- Docker, for the local runner

```bash
docker --version
node --version        # for gitlab-ci-local
```

>**`gitlab-runner exec` no longer exists.** It was deprecated in Runner 15.7 and removed in 17.0, so any tutorial recommending it is stale. The current way to run a job locally is [`gitlab-ci-local`](https://github.com/firecow/gitlab-ci-local), which this lab uses — it executes your `.gitlab-ci.yml` in Docker with no account and no runner.

---

## Deliverables and Evidence

- A GitLab project running the translated pipeline, green, with the job log for each stage
- Your own concept-map table: for each Actions feature you used in Lab 01, the GitLab equivalent
- A local run of one job with `gitlab-ci-local`, and how long that loop takes versus pushing
- A pipeline where a job was **silently not created**, and the two commands that diagnosed it
- `failure-notes.md` covering all four scenarios

---

## Lab Files

Reference copy is in [`../code/lab-03/`](../code/lab-03/).

```bash
# The application is Lab 01's, unchanged — that's the point
mkdir gitlab-ci-lab && cd gitlab-ci-lab
cp -r /path/to/the-devops-handbook/06-ci-cd/code/lab-01/{src,tests,requirements.txt,Dockerfile} .
cp /path/to/the-devops-handbook/06-ci-cd/code/lab-03/.gitlab-ci.yml .
git init -b main && git add . && git commit -m "chore: app from lab 01, gitlab pipeline"
```

---

## Exercise 1: Translate and Run

### Step 1: Map the Concepts First

Before reading the config, fill this in from memory. It is the actual deliverable of this lab:

| You used in Lab 01 (Actions) | GitLab equivalent |
|------------------------------|-------------------|
| `.github/workflows/ci.yml` | ? |
| `jobs:` → `steps:` | ? |
| `runs-on: ubuntu-latest` | ? |
| `uses: actions/setup-python@v5` | ? |
| `uses: actions/cache@v4` | ? |
| `uses: actions/upload-artifact@v4` | ? |
| `needs:` | ? |
| `if: github.ref == 'refs/heads/main'` | ? |
| `secrets.FOO` | ? |
| `environment:` | ? |

Then check yourself against §7's table. The row worth internalising is the third: on GitLab **every job runs inside a container image you name**, and there is no `uses:` — no marketplace of actions. More of the pipeline is shell you wrote, which is more reproducible and more work.

### Step 2: Read the Translation

Open `.gitlab-ci.yml` and find the five parts:

| Part | Where |
|------|-------|
| **Triggers** | `workflow: rules:` — one place deciding whether a pipeline exists at all |
| **Execution environment** | `default: image:` plus per-job `image:` overrides |
| **Dependency graph** | `stages:` for ordered groups, `needs:` for a true DAG |
| **Caching / artifacts** | `cache:` keyed on `requirements.txt`; `artifacts:` with `when: always` |
| **Secret store** | CI/CD variables, referenced as `$DEPLOY_TOKEN` |

Note two lines that have no direct Actions equivalent and matter operationally:

```yaml
default:
  interruptible: true     # a new push cancels the running pipeline
build:
  dependencies: []        #  do NOT download upstream artifacts into this job
```

`interruptible` is free money on a busy repository. `dependencies: []` is the fix for the surprise in §7: artifacts flow forward *automatically*, so a 500 MB build output is otherwise downloaded by every later job.

### Step 3: Run a Job Locally, Before Pushing Anything

```bash
npx --yes gitlab-ci-local --list
npx --yes gitlab-ci-local lint
npx --yes gitlab-ci-local test
```

```text
parsing and downloads finished in 1.2 s
lint         starting python:3.12-slim (lint)
lint         copied to docker volumes in 0.4 s
lint         $ flake8 src/ tests/ --max-line-length=100
lint         $ black --check src/ tests/
lint         finished in 8 s
```

Twelve seconds, no push, no account. Compare that with commit → push → wait for a runner → read a web log, and you have the reason this tool exists: **the length of your feedback loop determines how carefully you write pipeline code**, and a two-minute loop makes people guess.

### Step 4: Push It and Watch a Real Pipeline

Create an empty project on gitlab.com, then:

```bash
git remote add origin https://gitlab.com/<your-username>/gitlab-ci-lab.git
git push -u origin main
```

Open **Build → Pipelines**. You should see five stages, with `deploy` waiting on a manual click.

```text
lint    test    build    scan    deploy  (manual)
```

Things to actually look at, because they are where GitLab is better than Actions:

```bash
# The test report is rendered in the UI — click a failed job's "Tests" tab.
# Break a test and push, to see it:
sed -i 's/assert add(2, 3) == 5/assert add(2, 3) == 6/' tests/test_app.py
git commit -am "test: deliberately wrong assertion" && git push
```

The merge request and the pipeline both show the failing test *by name*, parsed from the JUnit artifact — not buried in a log. That is what `reports: junit:` bought you, and why `when: always` on that artifact matters: the report is most valuable exactly when the job failed.

```bash
git revert --no-edit HEAD && git push
```

### Step 5: The Registry and the Gate

```bash
# The image the pipeline built, in GitLab's own registry, tagged with the commit SHA
# Deploy → Container Registry, or:
docker login registry.gitlab.com
docker pull registry.gitlab.com/<your-username>/gitlab-ci-lab:<full-sha>
```

Then click **Run** on the manual `deploy` job. It will fail — deliberately, and instructively:

```text
$ test -n "${DEPLOY_TOKEN:-}" || { echo "DEPLOY_TOKEN is empty — refusing to deploy"; exit 1; }
DEPLOY_TOKEN is empty — refusing to deploy
```

Add it under **Settings → CI/CD → Variables**: key `DEPLOY_TOKEN`, any value, **Masked**  and **Protected** . Re-run. Scenario 4 is about what those two checkboxes actually do.

---

## Break It: Four GitLab Failures

### Scenario 1: The Job That Was Never Created

**Break it.** Add a job whose rules cannot match — the most common GitLab mistake there is:

```bash
cat >> .gitlab-ci.yml <<'EOF'

integration-test:
  stage: test
  script:
    - echo "running integration tests"
  rules:
    # Intended: "run on merge requests". Actually: never, because these two conditions
    # cannot both be true — a pipeline is either an MR pipeline or a branch pipeline.
    - if: $CI_PIPELINE_SOURCE == "merge_request_event" && $CI_COMMIT_BRANCH
EOF
git commit -am "ci: add integration tests" && git push
```

**Symptom.** The pipeline is **green**. No warning, no error, no skipped-job indicator. Your integration tests simply do not exist, and every merge request from now on is approved on the strength of tests that never ran.

**Investigate.**

```bash
npx --yes gitlab-ci-local --list          #  integration-test is absent from the list
```

In the UI: **Build → Pipeline editor → Validate** simulates which jobs a given ref would create. Use the "Lint" tab with a branch name and read the job list — an empty result for a job is the whole diagnosis.

```bash
# Why: in an MR pipeline CI_COMMIT_BRANCH is not set, so the && can never be satisfied
npx --yes gitlab-ci-local integration-test 2>&1 | tail -2
```

**Root cause.** `rules:` are evaluated in order and the first match wins; a job with **no** matching rule is not created at all. GitLab treats that as a valid configuration — because it is — so nothing tells you. The trap is that "not created" and "passed" look identical on a green pipeline.

**Fix.** Use the variable that exists in both pipeline types, and assert the job exists:

```bash
python3 - <<'PY'
import pathlib
p = pathlib.Path('.gitlab-ci.yml'); t = p.read_text()
t = t.replace('    - if: $CI_PIPELINE_SOURCE == "merge_request_event" && $CI_COMMIT_BRANCH',
              '    - if: $CI_PIPELINE_SOURCE == "merge_request_event"\n'
              '    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH')
p.write_text(t)
PY
npx --yes gitlab-ci-local --list | grep integration-test     #  now it exists
git commit -am "fix(ci): integration tests actually run" && git push
```

>The durable defence is a job-count assertion in the pipeline itself, or a review habit: whenever you add `rules:`, run `--list` and confirm the job appears for the ref you intended. "It's green" is not evidence that anything ran.

### Scenario 2: No Ambient Toolchain

**Break it.** Add a job that uses a tool the image does not have — which is *every* tool, unless you put it there:

```bash
cat >> .gitlab-ci.yml <<'EOF'

audit:
  stage: lint
  script:
    - jq --version
    - jq -r '.name' package.json || echo "no package.json"
EOF
npx --yes gitlab-ci-local audit 2>&1 | tail -4
```

**Symptom.**

```text
audit    $ jq --version
audit    /bin/sh: 1: jq: not found
audit    finished in 2 s (exit code 127)
```

Exit 127, immediately. This one is loud — which is why it is the *second* scenario and not the first. It is worth doing because of what it teaches about the model: GitHub's hosted runners ship a large preinstalled toolchain, so pipelines quietly depend on tools nobody declared. GitLab has none, so every dependency is explicit.

**Root cause.** `python:3.12-slim` contains Python. Nothing else.

**Fix.** Three options, in order of preference:

```bash
python3 - <<'PY'
import pathlib
p = pathlib.Path('.gitlab-ci.yml'); t = p.read_text()
t = t.replace("""audit:
  stage: lint
  script:
    - jq --version""", """audit:
  stage: lint
  image: alpine:3.20        #  1. an image that HAS the tool — cheapest and fastest
  before_script:
    - apk add --no-cache jq  #    2. install it explicitly (slower, but visible)
  script:
    - jq --version""")
p.write_text(t)
PY
npx --yes gitlab-ci-local audit 2>&1 | tail -3
```

The third option is a purpose-built CI image your team maintains, which is what most organisations end up with — and the reason "which image does this job use?" is the first question when a GitLab job behaves unexpectedly.

### Scenario 3: The Artifact That Never Arrived

**Break it.** Remove the `needs:` from the report job, so it lands in the same stage with no declared dependency:

```bash
python3 - <<'PY'
import pathlib
p = pathlib.Path('.gitlab-ci.yml'); t = p.read_text()
t = t.replace("  needs: [test] #  DAG: also what makes test's artifacts available here\n", "")
# and make the script tolerant, the way real scripts are
t = t.replace("""    - test -s report.xml || { echo "report.xml missing — the artifact did not arrive"; exit 1; }""",
              """    - test -s report.xml || echo "no report found, skipping"   #  tolerant = silent""")
p.write_text(t)
PY
npx --yes gitlab-ci-local coverage-report 2>&1 | tail -4
```

**Symptom.**

```text
coverage-report  $ test -s report.xml || echo "no report found, skipping"
coverage-report  no report found, skipping
coverage-report  finished in 3 s
```

Green. Every pipeline from now on reports coverage on nothing, and the dashboard someone built from this job's output shows whatever the empty case produces. The job did exactly what it was told; what it was told was wrong.

**Investigate.**

```bash
npx --yes gitlab-ci-local --list | grep -A1 coverage-report
# In the UI: the job's "Job artifacts" panel is empty, and the "Dependencies" section
# of the job log shows nothing was downloaded.
```

**Root cause.** Artifacts pass from **earlier stages**, and jobs in the *same* stage run in parallel with no ordering — so `coverage-report` started before `test` finished and got nothing. `needs:` fixes both problems at once: it creates the dependency edge *and* makes that job's artifacts available.

**Fix.** Restore `needs:`, and — more importantly — restore the assertion:

```bash
python3 - <<'PY'
import pathlib
p = pathlib.Path('.gitlab-ci.yml'); t = p.read_text()
t = t.replace("""coverage-report:
  stage: test
""", """coverage-report:
  stage: test
  needs: [test]
""")
t = t.replace("""    - test -s report.xml || echo "no report found, skipping"   #  tolerant = silent""",
              """    - test -s report.xml || { echo "report.xml missing — the artifact did not arrive"; exit 1; }""")
p.write_text(t)
PY
npx --yes gitlab-ci-local coverage-report 2>&1 | tail -3
git commit -am "fix(ci): coverage report depends on test" && git push
```

>Any pipeline step that consumes a file must fail when the file is absent. `|| true` and `|| echo` in CI scripts are how green pipelines come to mean nothing — the same lesson as `set -euo pipefail` in Module 04, in a place where nobody reads the logs.

### Scenario 4: The Secret That Was Silently Empty

**Break it.** You marked `DEPLOY_TOKEN` as **Protected** in Step 5. Now use it from a branch that is not protected — exactly what happens when someone tests a deploy job on a feature branch:

```bash
git checkout -b feature/test-deploy
python3 - <<'PY'
import pathlib
p = pathlib.Path('.gitlab-ci.yml'); t = p.read_text()
t = t.replace("""  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
  script:
    #  Scenario 4""", """  rules:
    - if: $CI_COMMIT_BRANCH                  # any branch — for "testing"
  script:
    #  Scenario 4""")
p.write_text(t)
PY
git commit -am "ci: allow deploy from any branch for testing" && git push -u origin feature/test-deploy
```

Run the manual `deploy` job on that branch.

**Symptom.**

```text
$ test -n "${DEPLOY_TOKEN:-}" || { echo "DEPLOY_TOKEN is empty — refusing to deploy"; exit 1; }
DEPLOY_TOKEN is empty — refusing to deploy
```

The guard saved you. Now delete the guard mentally and reread the job: without it, the deploy script would run with an empty token, and depending on the target, either fail with a confusing 401 or **succeed against nothing** — deploying to no environment while reporting success. That second outcome is the reason this scenario exists.

**Investigate.**

```bash
# What the job can actually see (never echo the value itself — masking is not encryption)
echo 'debug: script: [ "env | grep -c DEPLOY_TOKEN || echo absent" ]'
```

In the UI: **Settings → CI/CD → Variables** shows `Protected: Yes`, and **Settings → Repository → Protected branches** shows which branches qualify. `main` does; `feature/*` does not.

**Root cause.** "Protected" means *only pipelines on protected branches and tags receive this variable*. On any other ref it is not an error — the variable is simply absent, and shell expansion of an unset variable is the empty string. This is the same class of failure as forks not receiving secrets in GitHub Actions, and the same wrong fix is available (unprotect the variable, or run untrusted refs with production credentials).

**Fix.** Three things, together:

```bash
git checkout main
git branch -D feature/test-deploy
git push origin --delete feature/test-deploy
```

1. **Keep the guard.** Every job that consumes a secret asserts it is non-empty first. This is two lines and it converts a silent misdeploy into a clear failure.
2. **Scope the job, not the variable.** Deploy jobs run on protected refs only — which is what the original `rules:` said.
3. **Never unprotect a production credential to make a branch pipeline pass.** The variable is protected precisely so a feature branch cannot deploy.

### Summary

| Failure | How you detect it | How you prevent it |
|---------|------------------|--------------------|
| Job never created | `gitlab-ci-local --list` omits it; green pipeline with fewer jobs than you wrote | Check `--list` (or the Lint tab) for the intended ref whenever you touch `rules:` |
| Tool missing from image | Exit 127, `not found` | Name an image that has the tool, or install it in `before_script`; maintain a CI image |
| Artifact never arrived | Empty artifacts panel; job "succeeds" on absent input | `needs:` for both ordering and artifacts; **fail** when a required file is missing |
| Protected variable empty | Guard trips, or a deploy that succeeds against nothing | Assert secrets are non-empty; scope deploy jobs to protected refs; never unprotect |

 **The theme of this lab**: three of these four are silent, and all three are silent in the same way — the pipeline is green because nothing failed, and nothing failed because nothing ran. A green pipeline is evidence that the jobs which existed passed. Whether the jobs you intended exist, ran, and consumed the inputs you think they did is a separate question, and one you have to ask deliberately.

**Write this up** in `failure-notes.md`.

---

## Cleanup

```bash
docker system prune -f                     # gitlab-ci-local leaves images and volumes
rm -rf .gitlab-ci-local
```

Keep the GitLab project — a working pipeline on a second CI system is worth more on a CV than a second pipeline on the same one. Delete the CI/CD variable if you used a real token anywhere.

---

## Validation

- [ ] Complete the concept-map table from memory, and explain why there is no `uses:`
- [ ] Name the five moving parts of any CI system and point at each in `.gitlab-ci.yml`
- [ ] Run a job locally, and say why `gitlab-runner exec` is not the answer any more
- [ ] Explain `stages:` versus `needs:`, and what `needs:` does to artifacts
- [ ] Explain why `when: always` on a test artifact matters
- [ ] Diagnose a job that was never created, using two different tools
- [ ] Explain why every job needs an image that contains its tools
- [ ] Explain what "Protected" does to a CI/CD variable, and the GitHub Actions equivalent
- [ ] Say what `interruptible` and `dependencies: []` each save you

---

## What to Commit

- `.gitlab-ci.yml`, and your filled-in concept-map table
- A link to a green pipeline, and the job log for one failing test showing the rendered report
- The `--list` output before and after scenario 1
- Local-run timings versus push-and-wait
- `failure-notes.md` covering all four scenarios

---

[← Previous Lab: Jenkins Pipeline](./lab-02-jenkins-pipeline.md) | [Back to Module README](../README.md) | [Next Lab: Azure Pipelines →](./lab-04-azure-pipelines.md)

---

# Lab 04: Azure Pipelines — Agents, Stages, and Approvals

## Objective

Run a multi-stage Azure Pipelines build on an agent you own, translating the GitHub Actions concepts from Lab 01 into Azure DevOps vocabulary: stages and jobs, a self-hosted agent pool, step templates, artefacts between stages, and an environment that stops a deployment until someone approves it.

The lab is built around the constraint every new Azure DevOps organisation hits: **you get zero Microsoft-hosted parallel jobs until Microsoft approves a grant request**, which takes a few business days. Rather than wait, you run a self-hosted agent in Docker — free, immediate, and closer to what most enterprises actually operate.

---

## Prerequisites

- Read [§8 Azure Pipelines — The Enterprise Sibling](../README.md#8-azure-pipelines--the-enterprise-sibling)
- Completed [Lab 01: GitHub Actions](./lab-01-github-actions.md) — this lab is a translation of it
- Docker and Docker Compose, ~2 GB free
- A **free** Azure DevOps organisation ([dev.azure.com](https://dev.azure.com) — free for up to 5 users, no card). Exercise 1 and 2 need no account at all.

```bash
docker --version && docker compose version
```

---

## Deliverables and Evidence

- The agent image built, and the agent binary running before any credential exists
- Your agent listed as **Online** in the organisation's Default pool
- A pipeline run showing both stages, with the Deploy stage's artefact download
- The same `./ci.sh` output, produced locally and by the agent
- A run blocked on an approval, and the approval record that released it
- A pull request build that runs Build but not Deploy, and the condition that caused it
- `pipelines-notes.md`

---

## Lab Files

Reference copies are in [`../code/lab-04/`](../code/lab-04/).

```bash
cp -r /path/to/the-devops-handbook/06-ci-cd/code/lab-04/. .
chmod +x ci.sh agent/start.sh
```

```text
azure-pipelines.yml        the pipeline: two stages, a template, an environment
templates/
  steps-python.yml         a reusable step template
agent/
  Dockerfile               a self-hosted agent
  start.sh                 register → run one job → deregister
ci.sh                       the build logic, called by both you and the pipeline
app/app.py                 the thing being built
docker-compose.yml         runs the agent
```

---

## Exercise 1: The Pipeline, Read as a Translation

No account needed yet. Open `azure-pipelines.yml` next to Lab 01's workflow and read the mapping:

| GitHub Actions | Azure Pipelines | Note |
|----------------|-----------------|------|
| `on: push` | `trigger:` | Separate `pr:` block for pull requests — they are different triggers here |
| `jobs:` | `stages:` → `jobs:` → `steps:` |  One more level. Stages are the deployment boundary |
| `runs-on: ubuntu-latest` | `pool: { vmImage: ubuntu-latest }` | Or `pool: { name: Default }` for self-hosted |
| `uses: actions/setup-python@v5` | `task: UsePythonVersion@0` | Tasks are versioned by a number, not a tag or SHA |
| `run: ./ci.sh` | `script: ./ci.sh` | `script:` is bash on Linux, cmd on Windows; `bash:` forces bash |
| `${{ secrets.TOKEN }}` | `$(TOKEN)` | From a variable group or a secret variable |
| `actions/upload-artifact` | `publish:` / `download:` | Automatic in a `deployment:` job |
| composite action | `template:` | Also a **security** boundary — see §8 |
| `environment: production` | `environment: production` | Same idea, and where approvals live |

**Two differences worth internalising now**, because they cause most of the confusion:

1. **Stages run on different agents.** Anything Build produced is gone unless it was published as an artefact. In GitHub Actions the same is true across jobs; here the extra `stages` level means people hit it sooner.
2. **A `deployment:` job is not a `job:`.** Only a deployment job binds to an environment, and only an environment carries approvals, checks, and deployment history. Writing `job:` and wondering where the approval prompt went is the classic first mistake.

Run the build logic yourself — the same entry point the pipeline calls:

```bash
./ci.sh all
```

```text
── lint
    syntax ok
── test
app self-check: ok
── package (version 0.0.0-local)
    dist/app-0.0.0-local.tar.gz
```

 **This is the habit the lab is really teaching.** The pipeline is a thin wrapper: provide an environment, call `./ci.sh`. Logic that lives only in YAML can only be tested by pushing a commit and waiting three minutes — which is how a one-line fix turns into eleven "fix pipeline" commits.

---

## Exercise 2: Build the Agent

Still no account needed. The agent is a normal container: fetch Microsoft's agent tarball, unpack it, register on start.

```bash
docker compose build agent
docker run --rm --entrypoint sh azp-agent-test -c './config.sh --help | head -5' \
  2>/dev/null || docker compose run --rm --entrypoint sh agent -c './config.sh --help | head -5'
```

```text
./config.sh [options]

For unconfigure help, see: ./config.sh remove --help
```

The binary runs before any credential exists — worth confirming, because it separates "my Dockerfile is wrong" from "my token is wrong" later. Now watch it refuse to start without configuration:

```bash
docker compose run --rm --no-deps -e AZP_URL= -e AZP_TOKEN= agent
```

```text
/azp/start.sh: line 14: AZP_URL: set AZP_URL to https://dev.azure.com/<org>
```

>**The download host matters.** The older `vstsagentpackage.azureedge.net` CDN is being retired and already fails from some networks; the Dockerfile uses `download.agent.dev.azure.com`. If a build of this image ever fails with a curl error and nothing else, that is why.

---

## Exercise 3: Connect It and Run the Pipeline

**This is where the free organisation is needed.** Five minutes:

1. Sign in at [dev.azure.com](https://dev.azure.com) and create an organisation and a project.
2. Push this lab directory to the project's repo (Repos → Files → clone URL).
3. Create a PAT: **User settings → Personal access tokens → New Token**, scope **Agent Pools (read, manage)**. Copy it — it is shown once.

```bash
export AZP_URL=https://dev.azure.com/<your-org>
export AZP_TOKEN=<the-pat>
docker compose up -d agent
docker compose logs -f agent
```

```text
Connecting to server ...
Successfully added the agent
Scanning for tool capabilities.
Listening for Jobs
```

Check **Project settings → Agent pools → Default → Agents**: yours is listed as **Online**.

Now create the pipeline: **Pipelines → New pipeline → Azure Repos Git → Existing Azure Pipelines YAML file → `/azure-pipelines.yml` → Run**.

You will see two stages, the second waiting on the first, and the `ci.sh` output identical to the run on your laptop.

>**Why the agent exits after one job.** `run.sh --once` takes a single job and stops; `restart: unless-stopped` brings a fresh container back. Every job therefore starts on a clean machine — the ephemeral agent pattern. The alternative, a long-lived agent, is faster but lets job N inherit whatever job N-1 left behind, which is the source of "it only fails on agent 3" bugs.

---

## Exercise 4: An Approval That Actually Blocks

Environments are where Azure Pipelines is genuinely stronger than a bare workflow file.

1. **Pipelines → Environments → New environment**, name it `staging`.
2. Open it → **⋮ → Approvals and checks → Approvals** → add yourself → Create.
3. Run the pipeline again.

The Deploy stage now sits at **Waiting**, and nothing in the deployment runs until you click Approve. The environment records who approved, when, and which build — the audit trail an auditor asks for and a chat message cannot provide.

```text
Build       succeeded
Deploy      waiting for approval  ← 0 minutes of agent time consumed
```

 **An approval is a *check on the environment*, not a step in the pipeline.** Every pipeline deploying to `staging` inherits it automatically, including one written next year by someone who never read this file. That is the difference between a control and a convention.

---

## Break It: Four Azure Pipelines Failures

### Scenario 1: No Agent, No Error

**Break it.** Stop the agent and queue a build:

```bash
docker compose stop agent
# then: Pipelines → your pipeline → Run pipeline
```

**Symptom.** The run neither fails nor starts.

```text
Job build:  Queued  —  waiting for an available agent in pool Default
```

It waits like this for hours. No failure, no notification, no timeout that anyone would notice.

**Root cause.** Two different conditions produce this identical screen, and telling them apart is the skill:

| Cause | How to confirm | Fix |
|-------|----------------|-----|
| **No agent online** | Project settings → Agent pools → Default → Agents shows none, or all offline | Start the agent |
| **No parallelism grant** | Organization settings → Parallel jobs shows `0` hosted jobs | Use self-hosted, or submit Microsoft's grant request and wait |
| **Demands not met** | The job's log shows unmatched demands | Fix the demand, or install the capability on the agent |

 **This is *the* Azure DevOps beginner experience**: a pipeline that looks correct and silently queues forever because a brand-new organisation has zero hosted parallelism. The pipeline is not broken — there is nowhere for it to run.

**Fix.**

```bash
docker compose start agent
```

### Scenario 2: The Artefact That Wasn't There

**Break it.** Remove the publish step — comment out the `publish:` block in the Build stage, commit, and run.

**Symptom.** Build is green. Deploy fails:

```text
##[error]No artifacts found for the deployment job
```

**Root cause.** Stages run on **different agents**, so `dist/` from Build simply does not exist in Deploy. It is not a permissions problem or a path problem; the file was never transported. A deployment job downloads artefacts automatically — but only artefacts that were published.

**Fix.** Restore the `publish:` step. And note the pairing: `publish:` in one stage, automatic download in a `deployment:` job, or an explicit `download:` in a plain job.

>**The same mistake with a worse ending**: a Deploy stage that *succeeds* because it deployed an empty directory. Check that your deploy step fails on a missing file rather than shipping nothing successfully.

### Scenario 3: The Variable That Didn't Cross

**Break it.** Set a variable in one job and read it in the next. Add to the Build job's steps:

```yaml
          - script: echo "##vso[task.setvariable variable=appVersion]1.2.3"
            displayName: Set a variable
          - script: echo "same job sees $(appVersion)"
            displayName: Read it here
```

…and in the Deploy stage's steps, `- script: echo "other stage sees '$(appVersion)'"`.

**Symptom.** The first prints `1.2.3`. The second prints an empty string, or the literal `$(appVersion)`, and does **not** fail.

**Root cause.** `setvariable` scopes to the job. Crossing a boundary requires saying so explicitly:

| Crossing | What you need |
|----------|---------------|
| Step → step, same job | `##vso[task.setvariable variable=x]` — works as-is |
| Job → job | `isOutput=true` on the set, and `dependsOn` plus an expression on the read |
| Stage → stage | The same, plus `stageDependencies` in the expression |

**Fix.**

```yaml
# in the producing job
- script: echo "##vso[task.setvariable variable=appVersion;isOutput=true]1.2.3"
  name: setVars                       #  the step needs a name to be referenced

# in a later job
variables:
  appVersion: $[ dependencies.build.outputs['setVars.appVersion'] ]
```

 **An undefined variable expands to nothing and the build stays green.** That is the dangerous part — a deployment that tags an image `myapp:` and pushes it. Fail deliberately: `if [ -z "$(appVersion)" ]; then echo "appVersion is empty"; exit 1; fi`.

### Scenario 4: The Pull Request That Deployed

**Break it.** Delete the `condition:` on the Deploy stage, then open a pull request against `main`.

**Symptom.** The PR build runs Build **and Deploy**. Code that nobody has reviewed has reached staging.

**Root cause.** `pr:` triggers a full pipeline run, not a reduced one. Without a condition, every stage runs — including the one that deploys.

**Fix.** Restore it:

```yaml
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
```

**And do not rely on that alone.** Layer the controls the way the platform intends:

| Control | Where it lives | Can a pipeline edit bypass it? |
|---------|----------------|-------------------------------|
| `condition:` on a stage | The YAML file |  Yes — the same PR can change it |
| Approval on the environment | Environment settings |  No |
| Branch policy requiring review | Repos → Branch policies |  No |
| `extends:` a template in a protected repo | Template repository |  No — the pipeline can only do what the template allows |

 **Anything enforced by the file being changed is not a control.** This is why Azure DevOps puts approvals on environments and checks on service connections rather than in the pipeline YAML — and why `extends:` templates exist. Secrets from a variable group are also withheld from fork PR builds for exactly this reason.

### Summary

| Failure | How you detect it | How you prevent it |
|---------|------------------|--------------------|
| Queued forever | Job stuck at "waiting for an available agent" | Alert on queue time; check pool and parallelism before blaming the YAML |
| Missing artefact | Deploy cannot find files Build made | `publish:` explicitly; make deploy steps fail on absent files |
| Variable didn't cross | An empty value and a green build | `isOutput=true` plus `dependencies`; assert the value is non-empty |
| PR deployed | A deployment triggered by a fork or PR build | Stage conditions **and** environment approvals **and** branch policies |

 **The theme of this lab**: Azure Pipelines splits the pipeline (a file, editable by anyone who can open a PR) from the controls (environments, service connections, protected templates — editable only by administrators). GitHub Actions has been converging on the same split with environments and OIDC. Knowing which half a given safeguard lives in tells you whether it is a guardrail or a suggestion.

**Write this up** in `pipelines-notes.md`.

---

## Cleanup

```bash
docker compose down
docker image rm lab-04-agent 2>/dev/null || true
```

The agent deregisters itself on exit (`config.sh remove` in the `trap`). Confirm the pool no longer lists it — a pool full of dead agents looks like capacity you do not have. Delete the organisation if you do not want to keep it; nothing here incurs a charge.

---

## Validation

- [ ] Map trigger, job, step, artefact, secret and environment between Actions and Pipelines
- [ ] Explain why a stage cannot see the previous stage's files
- [ ] Say what a `deployment:` job gives you that a `job:` does not
- [ ] Explain why a new organisation's pipeline queues forever, and two ways to fix it
- [ ] Pass a variable between jobs, and explain why the naive version fails silently
- [ ] Name which controls a pull request can bypass and which it cannot
- [ ] Explain the ephemeral agent pattern and the bug it prevents
- [ ] Justify keeping build logic in `ci.sh` rather than in the YAML

---

## What to Commit

- `azure-pipelines.yml`, `templates/steps-python.yml`, `ci.sh`, `agent/`
- A screenshot or log of your agent Online in the pool
- The two-stage run, and the Deploy stage's artefact download
- The approval record from the `staging` environment
- The PR run showing Build without Deploy
- `pipelines-notes.md` covering all four scenarios

>Never commit the PAT. It grants agent-pool management on your organisation — treat it as the credential it is, and revoke it when the lab is done.

---

[← Previous Lab: GitLab CI](./lab-03-gitlab-ci.md) | [Back to Module README](../README.md) | [Module 07: Observability →](../../07-observability/)
<!-- tab: Projects -->
# Project: Pull Request CI Pipeline

## Problem Statement

Create a CI pipeline that gives fast feedback on every pull request and blocks changes that fail linting, tests, or build checks.

## Deliverables

- GitHub Actions workflow or Jenkins pipeline
- At least one lint step
- At least one automated test step
- Build or packaging step
- Artifact upload or clear build output

## Validation

Capture evidence for one passing run and one failing run. The failing run should make the reason obvious from the pipeline logs.

## Failure Scenario

Intentionally break a test or lint rule. Document how the pipeline reports the failure and what command reproduces it locally.

## What to Commit

- Pipeline definition
- Minimal app or script under test
- Passing and failing run notes
- Local reproduction command

## Review Rubric

Use this rubric to self-assess your work or have a peer review it.

| Criteria | What to Look For | Score (1-5) |
|----------|-----------------|-------------|
| **Reproducibility** | Pipeline runs on a fresh fork without manual secret setup | |
| **Correctness** | Lint, test, and build stages pass on good code and fail on bad code | |
| **Debugging quality** | At least one intentional failure with clear diagnosis in the workflow log | |
| **Security basics** | Secrets use GitHub Secrets; workflow uses minimal permissions | |
| **Cleanup quality** | No leftover artifacts, containers, or cloud resources after pipeline runs | |
| **Explanation clarity** | Pipeline stages are documented with purpose and expected outcomes | |

**Scoring**: 1 = Not attempted, 2 = Partial, 3 = Meets expectations, 4 = Exceeds expectations, 5 = Production quality
<!-- tab: Resources -->
---

## Essential Reading

| Resource | Type | Difficulty | Notes |
|----------|------|------------|-------|
| [GitHub Actions Documentation](https://docs.github.com/en/actions) | Documentation | Beginner | Official reference — start with "Understanding GitHub Actions" |
| [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions) | Reference | Intermediate | **Bookmark this** — complete YAML syntax reference |
| [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/) | Documentation | Intermediate | Declarative vs Scripted pipeline reference |
| [Continuous Delivery (Jez Humble)](https://www.oreilly.com/library/view/continuous-delivery/9780321670250/) | Book | Advanced | The definitive CI/CD book — foundational reading |
| [The DevOps Handbook (Kim, Humble, et al.)](https://itrevolution.com/product/the-devops-handbook-second-edition/) | Book | Intermediate | Broader DevOps context for CI/CD practices |

---

## Videos & Courses

| Resource | Type | Duration | Notes |
|----------|------|----------|-------|
| [GitHub Actions Tutorial (TechWorld with Nana)](https://www.youtube.com/watch?v=R8_veQiYBjI) | Video | 1 hour | Best beginner GitHub Actions walkthrough |
| [GitHub Actions CI/CD (Fireship)](https://www.youtube.com/watch?v=eB0nUzAI7M8) | Video | 8 min | Quick, high-level overview |
| [Jenkins Full Course (TechWorld with Nana)](https://www.youtube.com/watch?v=7KCS70sCoK0) | Video | 3 hours | Comprehensive Jenkins deep dive |
| [CI/CD Explained (IBM Technology)](https://www.youtube.com/watch?v=scEDHsr3APg) | Video | 8 min | Great conceptual overview for interviews |
| [Deployment Strategies Explained](https://www.youtube.com/watch?v=AWVTKBUnoIg) | Video | 15 min | Rolling, blue-green, canary visually explained |

---

## Tools & References

| Resource | Type | Notes |
|----------|------|-------|
| [act](https://github.com/nektos/act) | Tool | Run GitHub Actions locally — essential for debugging |
| [GitHub Actions Marketplace](https://github.com/marketplace?type=actions) | Registry | Reusable actions (checkout, setup-python, docker, etc.) |
| [actionlint](https://github.com/rhysd/actionlint) | Linter | Static analysis for GitHub Actions workflow YAML |
| [Jenkins Blue Ocean](https://www.jenkins.io/projects/blueocean/) | Plugin | Modern Jenkins UI with pipeline visualization |
| [Jenkins Pipeline Linter](https://www.jenkins.io/doc/book/pipeline/development/#linter) | Tool | Validate Jenkinsfile syntax before pushing |
| [GitHub Actions Cheat Sheet](https://github.github.io/actions-cheat-sheet/actions-cheat-sheet.html) | Reference | Quick reference for common patterns |

---

## Recommended Practice Path

1. **Week 1**: Build a GitHub Actions CI pipeline for a real project (lint → test → build Docker image). Use `act` to test locally.
2. **Week 2**: Add CD with environment protection rules. Set up Jenkins in Docker and replicate the same pipeline in a Jenkinsfile.
3. **Tool**: Install `actionlint` and lint every workflow YAML before pushing.
<!-- /tabs -->
