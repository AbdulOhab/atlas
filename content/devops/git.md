---
title: "Git & GitHub"
order: 4
summary: "If your infrastructure isn't in Git, it doesn't exist."
category: "Fundamentals"
level: Intermediate
---

# Module 03: Git & GitHub

> *"If your infrastructure isn't in Git, it doesn't exist."*

---

>**Command reference**: [`cheatsheet.md`](./cheatsheet.md) — every command in this module, grouped by task, with the gotchas.
>
>**Cross-module lookup**: [Quick Reference](../QUICK-REFERENCE.md)

---

## Why This Module Matters

**Git is the single most important tool in DevOps.** Every piece of code, every configuration file, every pipeline definition, every infrastructure template — all of it lives in Git. Your ability to use Git fluently determines how effectively you collaborate, track changes, and recover from mistakes.

**In real-world DevOps work**, you will:

- Manage infrastructure code across multiple repositories
- Review pull requests for Terraform, Ansible, and Kubernetes changes
- Resolve merge conflicts in CI/CD pipeline configurations
- Use Git history to debug "what changed?" during incidents
- Enforce branching strategies across engineering teams

---

## Fundamentals

### The problem

In 2005 the Linux kernel lost free access to BitKeeper, the proprietary version control system it had used. The alternatives were centralized (CVS, Subversion): every commit, branch and history lookup went through one server, branching was expensive, and merging was painful. None of that worked for thousands of contributors spread around the world. Linus Torvalds wrote Git in about ten days to replace it.

### Goals

- **Distributed.** Every clone is a full repository with all its history. Work offline, and no single server is critical.
- **Fast:** commits, diffs, branches and logs are local operations.
- **Integrity.** Every object is addressed by a hash of its content, so corruption or tampering is detectable.
- **Cheap branching and good merging,** to support thousands of parallel lines of work.

### The ideas everything else rests on

- **Snapshots, not diffs.** A commit records the whole tree as it was, plus its parent commits, author and message. Unchanged files are shared, not copied.
- **Content-addressed objects.** Blobs (file contents), trees (directories), commits and tags are all stored by hash, so identical content is stored once.
- **History is a DAG.** Commits point to their parents. A merge commit has two parents.
- **Branches are just pointers.** A branch is a file holding one commit hash, and `HEAD` points to the current branch. That's why branching is instant.
- **Three areas:** the working directory, the staging area (index) and the repository. `add` stages, `commit` records.
- **Remotes are other copies.** `fetch`, `push` and `pull` sync objects and refs between repositories, and `origin/main` is your last known view of theirs.

### Trade-offs

The model is simple, but the command-line interface grew from it inconsistently, which is why Git feels hard. Rewriting history (`rebase`, `--force`) is powerful and dangerous on shared branches. Large binaries bloat every clone (Git LFS helps). Git tracks content, not intent, so conflicts still need a human.

## Table of Contents

1. [Git Fundamentals](#1-git-fundamentals)
2. [Core Git Workflow](#2-core-git-workflow)
3. [Branching and Merging](#3-branching-and-merging)
4. [Remote Repositories and GitHub](#4-remote-repositories-and-github)
5. [Pull Requests and Code Review](#5-pull-requests-and-code-review)
6. [Git Workflows for Teams](#6-git-workflows-for-teams)
7. [Advanced Git Operations](#7-advanced-git-operations)
8. [.gitignore and Secrets Prevention](#8-gitignore-and-secrets-prevention)
9. [Git Hooks](#9-git-hooks)
10. [Common Mistakes and Anti-Patterns](#10-common-mistakes-and-anti-patterns)
11. [Debugging Mindset](#11-debugging-mindset)
12. [Security Considerations](#12-security-considerations)
13. [Interview Insights](#13-interview-insights)

---

## 1. Git Fundamentals

### What Is Git?

Git is a **distributed version control system** — every developer has a complete copy of the repository, including its full history. This means you can work offline, branch freely, and recover from almost any mistake.

### The Three Areas of Git (Plus the Remote)

Almost every confusing Git moment comes from not knowing **which of these four places** your change currently lives in. Learn this map and half of Git stops being mysterious.

```mermaid
flowchart LR
    WD["<b>Working Directory</b><br/>Your files on disk<br/><i>modified</i>"]
    IDX["<b>Staging Area</b><br/>Index<br/><i>staged</i>"]
    REPO["<b>Local Repository</b><br/>.git<br/><i>committed</i>"]
    REM["<b>Remote</b><br/>GitHub / origin<br/><i>pushed</i>"]

    WD -->|"git add"| IDX
    IDX -->|"git commit"| REPO
    REPO -->|"git push"| REM

    IDX -.->|"git restore --staged<br/>(unstage, keep changes)"| WD
    REPO -.->|"git restore &lt;file&gt;<br/>(discard local changes)"| WD
    REM -.->|"git fetch"| REPO
    REM -.->|"git pull = fetch + merge"| WD

    style WD fill:#fff4e0,stroke:#cc8800
    style IDX fill:#e8f0ff,stroke:#3366cc
    style REPO fill:#e8ffe8,stroke:#22aa22
    style REM fill:#f0e8ff,stroke:#8844cc
```

> ** The mental check**: before you run any recovery command, ask *"where is my work right now?"* If it's only in the working directory, `git checkout`/`git restore` will destroy it permanently. If it reached a commit — even on a deleted branch — `git reflog` can get it back. **Committing is what makes work recoverable.** Commit early, tidy up later.

### Key Concepts

| Concept | What It Is | Analogy |
|---------|-----------|---------|
| **Repository** | A project tracked by Git | A filing cabinet with history |
| **Commit** | A snapshot of all tracked files | A save point in a game |
| **Branch** | An independent line of development | A parallel universe |
| **Merge** | Combining branches together | Merging parallel universes |
| **Remote** | A copy of the repo on a server (GitHub) | Cloud backup |
| **HEAD** | Pointer to your current position | "You are here" marker |

### Initial Setup

```bash
# Configure your identity (required — every commit records this)
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Set default branch name
git config --global init.defaultBranch main

# Set default editor
git config --global core.editor "vim"    # or nano, code

# Enable useful colors
git config --global color.ui auto

# Set up credential caching (HTTPS)
git config --global credential.helper cache

# Verify your config
git config --list
```

---

## 2. Core Git Workflow

### Creating a Repository

```bash
# Option 1: Initialize a new repository
mkdir my-project && cd my-project
git init

# Option 2: Clone an existing repository
git clone https://github.com/user/repo.git
cd repo
```

### The Daily Workflow

```bash
# 1. Check what's changed
git status

# 2. See the actual changes
git diff                    # Changes not yet staged
git diff --staged           # Changes staged for commit

# 3. Stage changes
git add filename.txt        # Stage a specific file
git add .                   # Stage everything (be careful!)
git add -p                  # Stage interactively (pick specific hunks)

# 4. Commit with a meaningful message
git commit -m "Fix nginx config: increase proxy timeout to 30s"

# 5. Push to remote
git push origin main
```

### Writing Good Commit Messages

```bash
# BAD commit messages:
git commit -m "fix"
git commit -m "update"
git commit -m "WIP"
git commit -m "asdfgh"

# GOOD commit messages:
git commit -m "fix: resolve 502 errors by increasing proxy timeout"
git commit -m "feat: add health check endpoint to user service"
git commit -m "docs: update deployment runbook for v2.3"
git commit -m "chore: upgrade terraform provider to 5.0"

# Conventional commits format (widely adopted):
# type(scope): description
#
# Types: feat, fix, docs, style, refactor, test, chore, ci
```

### Viewing History

```bash
# View commit log
git log                         # Full log
git log --oneline               # Compact (one line per commit)
git log --oneline -10           # Last 10 commits
git log --graph --oneline       # Visual branch graph
git log --author="John"        # Commits by author
git log --since="2 weeks ago"  # Recent commits
git log -- path/to/file        # History of a specific file

# Show details of a specific commit
git show abc1234

# Who changed each line? (ESSENTIAL for debugging)
git blame filename.txt
```

---

## 3. Branching and Merging

### Why Branches Matter

Branches let you work on features, fixes, or experiments **without affecting the main codebase**. In DevOps, you'll use branches for:

- Infrastructure changes (new Terraform modules)
- Pipeline updates (CI/CD config changes)
- Config modifications (Kubernetes manifests)

A branch is not a copy of your files — it is just a **movable pointer to a commit**. That is why creating one is instant and free.

```mermaid
gitGraph
    commit id: "init"
    commit id: "add nginx config"
    branch feature/add-monitoring
    checkout feature/add-monitoring
    commit id: "add prometheus.yml"
    commit id: "add grafana dashboard"
    checkout main
    commit id: "hotfix: TLS cert path"
    checkout feature/add-monitoring
    commit id: "add alert rules"
    checkout main
    merge feature/add-monitoring id: "merge monitoring"
    commit id: "bump version"
```

Notice that `main` kept moving while the feature branch was in progress — that's the normal case, and it's exactly why merges and rebases exist.

### Branch Operations

```bash
# List branches
git branch                  # Local branches
git branch -r               # Remote branches
git branch -a               # All branches

# Create and switch to a new branch
git checkout -b feature/add-monitoring
# Or (newer syntax):
git switch -c feature/add-monitoring

# Switch between branches
git checkout main
git switch main

# Delete a branch (after merging)
git branch -d feature/add-monitoring     # Safe delete (refuses if not merged)
git branch -D feature/add-monitoring     # Force delete

# Rename current branch
git branch -m new-name
```

### Merging

```bash
# Merge a feature branch into main
git checkout main
git merge feature/add-monitoring

# Three types of merges:
# 1. Fast-forward: Linear history, no merge commit
# 2. Recursive: Creates a merge commit (default when histories diverge)
# 3. Squash: Combines all commits into one

# Squash merge (clean history)
git merge --squash feature/add-monitoring
git commit -m "feat: add Prometheus monitoring stack"
```

#### The three merge shapes, side by side

**1. Fast-forward** — `main` hasn't moved since you branched, so Git just slides the pointer forward. No merge commit, perfectly linear history.

```mermaid
gitGraph
    commit id: "A"
    commit id: "B"
    branch feature
    checkout feature
    commit id: "C"
    commit id: "D"
    checkout main
    merge feature id: "fast-forward"
```

**2. Merge commit (recursive)** — both branches moved, so Git creates a new commit with **two parents**. History is truthful but shows the branch topology.

```mermaid
gitGraph
    commit id: "A"
    commit id: "B"
    branch feature
    checkout feature
    commit id: "C"
    commit id: "D"
    checkout main
    commit id: "E (someone else)"
    merge feature id: "M: merge commit"
```

**3. Squash merge** — all feature commits are flattened into **one new commit** on `main`. The feature branch's individual commits never enter `main`'s history.

```mermaid
gitGraph
    commit id: "A"
    commit id: "B"
    commit id: "E (someone else)"
    commit id: "S: squashed C+D" type: HIGHLIGHT
```

| Strategy | History | Use when |
|----------|---------|----------|
| **Fast-forward** | Linear, no extra commit | Solo work, trivial changes, `main` hasn't moved |
| **Merge commit** | Preserves branch shape | You want to see *when* and *what* was integrated; release branches |
| **Squash** | One commit per PR | Trunk-based development — the default for most teams, keeps `main` readable and easy to revert |

> ** DevOps Impact**: Squash merges make `git revert` on `main` a single-commit operation. When a bad deploy needs rolling back at 2 AM, reverting one commit beats untangling nine. This is why most teams enable "Squash and merge" as the only allowed option in GitHub branch protection.

### Handling Merge Conflicts

```bash
# When a merge has conflicts:
git merge feature/add-monitoring
# CONFLICT (content): Merge conflict in nginx.conf
# Automatic merge failed; fix conflicts and commit the result.

# 1. See which files have conflicts
git status

# 2. Open the conflicted file — you'll see:
# <<<<<<< HEAD
# proxy_timeout 30s;
# =======
# proxy_timeout 60s;
# >>>>>>> feature/add-monitoring

# 3. Choose the correct version (or combine), remove markers

# 4. Mark as resolved
git add nginx.conf

# 5. Complete the merge
git commit -m "merge: resolve proxy timeout conflict, using 60s"
```

---

## 4. Remote Repositories and GitHub

### Working with Remotes

```bash
# View remotes
git remote -v
# origin  git@github.com:user/repo.git (fetch)
# origin  git@github.com:user/repo.git (push)

# Add a remote
git remote add upstream https://github.com/original/repo.git

# Fetch changes (download but don't merge)
git fetch origin

# Pull changes (fetch + merge)
git pull origin main

# Push changes
git push origin main
git push origin feature/add-monitoring

# Push a new branch
git push -u origin feature/add-monitoring
# -u sets up tracking (so you can just 'git push' next time)
```

### Syncing a Fork

```bash
# Add the original repo as upstream
git remote add upstream https://github.com/original/repo.git

# Fetch upstream changes
git fetch upstream

# Merge upstream into your main
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

---

## 5. Pull Requests and Code Review

### The PR Workflow (Industry Standard)

```mermaid
flowchart TD
    A["1. Create a branch<br/><code>git switch -c fix/database-timeout</code>"] --> B["2. Make changes<br/>edit, <code>git add</code>, <code>git commit</code>"]
    B --> C["3. Push the branch<br/><code>git push -u origin fix/database-timeout</code>"]
    C --> D["4. Open a Pull Request<br/>GitHub UI or <code>gh pr create</code>"]

    D --> CI["6. CI checks run<br/>tests · lint · build · security scan"]
    D --> RV["5. Code review<br/>teammates comment"]

    CI -->|" red"| FIX["Push a fix commit<br/>— CI re-runs automatically"]
    RV -->|"changes requested"| FIX
    FIX --> CI
    FIX --> RV

    CI -->|" green"| GATE
    RV -->|"approved"| GATE

    GATE{"Branch protection:<br/>all required checks green<br/>+ required approvals?"}
    GATE -->|"no"| BLOCK[" Merge button disabled"]
    BLOCK --> FIX
    GATE -->|"yes"| M["7. Squash merge into main"]
    M --> DEL["8. Delete the branch"]
    DEL --> DEPLOY["main is deployable —<br/>CD picks it up (Module 06)"]

    style GATE fill:#fff4e0,stroke:#cc8800
    style DEPLOY fill:#e0ffe0,stroke:#0a0
```

The two paths — **review** and **CI** — run in parallel and both must go green. Branch protection is what makes that a rule instead of a suggestion; without it, the whole diagram is optional.

### GitHub CLI (gh)

```bash
# Install GitHub CLI
sudo apt install -y gh
sudo dnf install -y gh

# Authenticate
gh auth login

# Create a PR
gh pr create --title "Fix: database connection timeout" \
  --body "Increased connection pool timeout from 5s to 30s to handle peak load"

# List PRs
gh pr list

# Review a PR
gh pr checkout 42    # Check out PR #42 locally
gh pr review 42 --approve
gh pr merge 42 --squash
```

### Code Review Best Practices (DevOps Perspective)

When reviewing infrastructure PRs, check:

- [ ] **Does it include a rollback plan?**
- [ ] **Are secrets properly handled?** (Not hardcoded)
- [ ] **Does the CI pipeline pass?**
- [ ] **Is there documentation** for the change?
- [ ] **Has it been tested** in a non-production environment?
- [ ] **Does it follow naming conventions?**

---

## 6. Git Workflows for Teams

### Trunk-Based Development (Recommended for DevOps)

One long-lived branch. Everything else is measured in hours.

```mermaid
gitGraph
    commit id: "main"
    branch fix/timeout
    checkout fix/timeout
    commit id: "fix timeout"
    checkout main
    merge fix/timeout
    branch feat/metrics
    checkout feat/metrics
    commit id: "add metrics"
    checkout main
    merge feat/metrics
    branch fix/logging
    checkout fix/logging
    commit id: "fix log level"
    checkout main
    merge fix/logging
    commit id: "deploy → prod"
```

**Rules:**

- Branches live for **hours or days, not weeks**
- Everyone merges to `main` frequently (at least daily)
- Feature flags for incomplete work — ship the code dark, enable it later
- CI runs on every push; `main` is always deployable

### GitFlow (More Structured)

Two long-lived branches (`main` + `develop`) plus three supporting branch types. More ceremony, slower flow — but it fits scheduled releases and versioned software.

```mermaid
gitGraph
    commit id: "v1.0" tag: "v1.0"
    branch develop
    checkout develop
    commit id: "dev base"
    branch feature/A
    checkout feature/A
    commit id: "feature A"
    checkout develop
    merge feature/A
    branch feature/B
    checkout feature/B
    commit id: "feature B"
    checkout develop
    merge feature/B
    branch release/1.1
    checkout release/1.1
    commit id: "bugfix in RC"
    checkout main
    merge release/1.1 tag: "v1.1"
    checkout develop
    merge release/1.1
    checkout main
    branch hotfix/1.1.1
    checkout hotfix/1.1.1
    commit id: "prod hotfix"
    checkout main
    merge hotfix/1.1.1 tag: "v1.1.1"
    checkout develop
    merge hotfix/1.1.1
```

**Branches:**

| Branch | Lifetime | Purpose |
|--------|----------|---------|
| `main` | Permanent | Production-ready code only; every commit is a release |
| `develop` | Permanent | Integration branch — where features land first |
| `feature/*` | Days–weeks | New features, branched from and merged to `develop` |
| `release/*` | Days | Release stabilisation; merges to **both** `main` and `develop` |
| `hotfix/*` | Hours | Emergency production fixes, branched from `main`, merged to **both** |

> ** The tradeoff**: notice that every `release/*` and `hotfix/*` in GitFlow has to be merged back into **two** places. Forgetting the second merge is the classic GitFlow bug — the hotfix ships to production and then silently regresses on the next release. Trunk-based has no such trap, which is why continuous-delivery teams prefer it.

### Which Workflow to Use?

| Team Size | Deployment Frequency | Recommended |
|-----------|---------------------|-------------|
| 1-5 developers | Multiple times/day | Trunk-based |
| 5-20 developers | Daily/weekly | Trunk-based or simplified GitFlow |
| 20+ developers | Weekly/monthly | GitFlow or custom |

---

## 7. Advanced Git Operations

### Stashing (Save Work Temporarily)

```bash
# Save uncommitted changes temporarily
git stash
git stash push -m "WIP: prometheus config changes"

# List stashes
git stash list

# Apply last stash (keep in stash list)
git stash apply

# Apply and remove from stash list
git stash pop

# Apply a specific stash
git stash apply stash@{2}
```

### Reverting and Resetting

```bash
# Undo the last commit (keep changes staged)
git reset --soft HEAD~1

# Undo the last commit (keep changes unstaged)
git reset HEAD~1

# Undo the last commit (DISCARD changes — DANGEROUS)
git reset --hard HEAD~1

# Revert a specific commit (creates a NEW commit that undoes it — SAFE)
git revert abc1234
# This is preferred in shared repos because it preserves history

# Discard all local changes
git checkout -- .
# Or:
git restore .
```

### Cherry-Pick (Apply Specific Commits)

```bash
# Apply a specific commit from another branch
git cherry-pick abc1234

# Use case: A bugfix was committed to the wrong branch
# Cherry-pick it to the correct branch
git checkout main
git cherry-pick fix-commit-hash
```

### Rebasing

```bash
# Rebase your branch on top of main (linear history)
git checkout feature/monitoring
git rebase main

# Interactive rebase (squash commits, reword messages)
git rebase -i HEAD~5
# Opens editor — you can:
# pick   = keep commit
# squash = combine with previous
# reword = change commit message
# drop   = remove commit

# When to rebase vs merge:
# Rebase: Before PR (clean up your commits)
# Merge: When merging PRs into main
# NEVER rebase public/shared branches
```

#### What rebase actually does

Rebase does **not** move your commits. It *replays* them as brand-new commits with new hashes on top of a new base, then abandons the originals.

**Before** — `feature` branched from `B`, and `main` has moved on to `E`:

```mermaid
gitGraph
    commit id: "A"
    commit id: "B"
    branch feature
    checkout feature
    commit id: "C"
    commit id: "D"
    checkout main
    commit id: "E"
```

**After `git rebase main`** — `C` and `D` are re-created as `C'` and `D'` on top of `E`. Same changes, **different commit hashes**, and the branch point is gone:

```mermaid
gitGraph
    commit id: "A"
    commit id: "B"
    commit id: "E"
    branch feature
    checkout feature
    commit id: "C'"
    commit id: "D'"
```

> ** Why "never rebase a shared branch"**: `C'` is a *different commit* from `C`. Anyone who already pulled `C` now has history that no longer exists upstream. Their next `git pull` produces duplicated commits and conflicts they didn't cause. Rebase is a tool for **your own unpushed work** — or a branch only you are on, where you then `git push --force-with-lease` (never bare `--force`).

| | Rebase | Merge |
|---|---|---|
| **History** | Linear, rewritten | Truthful, branched |
| **Commit hashes** | Changed | Preserved |
| **Safe on shared branches** |  No |  Yes |
| **Use for** | Tidying your branch before opening a PR; pulling in `main` updates | Integrating a finished PR |

---

## 8. .gitignore and Secrets Prevention

### Essential .gitignore

```bash
# .gitignore for DevOps projects

# Environment and secrets
.env
.env.*
*.pem
*.key
*secret*
credentials.json
terraform.tfvars

# Terraform
.terraform/
*.tfstate
*.tfstate.backup
.terraform.lock.hcl

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Dependencies
node_modules/
vendor/
__pycache__/
*.pyc

# Build artifacts
dist/
build/
*.tar.gz
*.zip

# Logs
*.log
logs/
```

### Preventing Secrets from Entering Git

```bash
# Check if secrets are already in history
git log -p | grep -i "password\|secret\|api_key\|token" | head -20

# If you accidentally committed a secret:
# 1. Remove it from the current code
# 2. Use git-filter-repo to purge from history
pip install git-filter-repo
git filter-repo --path-glob '*.env' --invert-paths

# 3. Force push (requires team coordination)
git push --force-with-lease

# Better: Use pre-commit hooks to prevent secrets
# (Covered in Git Hooks section)
```

---

## 9. Git Hooks

### Pre-Commit Hooks (Catch Problems Before They're Committed)

```bash
# Install pre-commit framework
pip install pre-commit

# Create .pre-commit-config.yaml
cat > .pre-commit-config.yaml << 'HOOKS'
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: detect-private-key
      - id: check-merge-conflict

  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.1
    hooks:
      - id: gitleaks    # Detects secrets in code
HOOKS

# Install the hooks
pre-commit install

# Now every commit will be checked automatically
# Test it:
pre-commit run --all-files
```

---

## 10. Common Mistakes and Anti-Patterns

### Committing Secrets

```bash
# BAD: Committing credentials
echo "DB_PASSWORD=prod_password_123" >> config.env
git add . && git commit -m "add config"
# This secret is now in Git history FOREVER (even if you delete the file later)

# GOOD: Use .gitignore + environment variables
echo "config.env" >> .gitignore
# Store secrets in vault (HashiCorp Vault, AWS Secrets Manager, etc.)
```

### Force Pushing to Shared Branches

```bash
# BAD: Force pushing to main (destroys others' work)
git push --force origin main

# GOOD: Use --force-with-lease (fails if remote has new commits)
git push --force-with-lease origin feature-branch
# And NEVER force-push to main/develop
```

### Giant Commits

```bash
# BAD: One commit with 50 files changed
git add . && git commit -m "stuff"

# GOOD: Atomic commits (one logical change per commit)
git add terraform/modules/vpc/
git commit -m "feat(infra): add VPC module with public/private subnets"

git add terraform/modules/rds/
git commit -m "feat(infra): add RDS module for PostgreSQL"
```

---

## 11. Debugging Mindset

### Using Git to Debug Production Issues

```bash
# "When did this config change?"
git log --oneline -- path/to/config.yml

# "Who changed this line and why?"
git blame path/to/config.yml

# "What changed between two points in time?"
git diff v2.1.0..v2.2.0

# "Which commit introduced this bug?"
git bisect start
git bisect bad HEAD          # Current version has the bug
git bisect good v2.0.0       # This version was fine
# Git will checkout commits for you to test
# Mark each as: git bisect good / git bisect bad
# Git finds the exact commit that introduced the bug!
git bisect reset             # When done
```

---

## 12. Security Considerations

>Git security directly impacts your entire infrastructure.

- **Never commit secrets** — use `.gitignore`, pre-commit hooks, secret scanning
- **Sign commits** — `git config --global commit.gpgsign true`
- **Use SSH keys** for authentication, not passwords
- **Enable branch protection** — require PR reviews, CI checks before merge
- **Audit access** — regularly review who has repo access
- **Use CODEOWNERS** — require specific reviewers for critical files

---

## 13. Interview Insights

### Frequently Asked Questions

**Q: What's the difference between `git merge` and `git rebase`?**
> Merge creates a merge commit preserving both branch histories. Rebase replays your commits on top of the target branch, creating a linear history. Use rebase to clean up local branches before PR; use merge for integrating PRs into main.

**Q: How do you undo a pushed commit?**
> Use `git revert <commit-hash>` which creates a new commit that undoes the changes. Never use `git reset --hard` + force push on shared branches as it rewrites history and breaks collaborators' repos.

**Q: What is `git stash` used for?**
> Stash temporarily saves uncommitted changes so you can switch branches cleanly. Common scenario: you're working on a feature but need to switch to main for a hotfix.

**Q: How do you handle secrets in Git?**
> Never commit secrets. Use `.gitignore` for env files, pre-commit hooks with tools like gitleaks for detection, and external secret managers (Vault, AWS Secrets Manager) for storage. If a secret is accidentally committed, use git-filter-repo to purge history and rotate the credential immediately.

**Q: Explain trunk-based development.**
> Developers merge small changes to the main branch frequently (multiple times daily). Feature branches live for hours, not weeks. Incomplete features use feature flags. This reduces merge conflicts and enables continuous delivery.

---

## Labs and Projects

Read the sections above first, then work through these **in order**. Every lab ends with a  **Break It** section — those are not optional; they are where the debugging skill actually comes from.

| # | Lab | What you'll do |
|---|-----|----------------|
| 1 | **[Git Core Workflow Mastery](./labs/lab-01-git-core-workflow.md)** | Build complete fluency with Git's daily workflow — init, add, commit, branch, merge, and conflict resolution. |
| 2 | **[GitHub Workflows & Pull Requests](./labs/lab-02-github-workflows.md)** | Practice the complete GitHub collaboration workflow — forking, branching, PRs, code review, and branch protection. |

**Portfolio project:**

- [Project: Branching Workflow with Conflict Resolution](./projects/project-01-branching-conflict-workflow.md) — Build a small repository that demonstrates a realistic Git workflow: feature branches, pull request review, merge conflict, conflict resolution, and…

---

## Self-Check

Answer these from memory before you expand them. If more than two give you trouble, re-read the sections they come from — the labs assume this material is solid.

<details>
<summary><strong>1. Name the three local areas Git moves changes through, plus the fourth place they end up.</strong></summary>

Working directory, staging area (the index), and local repository — then the remote. `add` stages, `commit` writes local history, `push` publishes. Most confusing Git messages become obvious once you can say which of the four a file is currently in.

</details>

<details>
<summary><strong>2. `git reset` or `git revert` — which one on a branch other people have pulled?</strong></summary>

`revert`. It creates a new commit that undoes the change, so history stays intact and everyone's clone stays consistent. `reset` rewrites history and belongs only on your own unpushed work.

</details>

<details>
<summary><strong>3. Rebase or merge, and what is the one rule you never break?</strong></summary>

Rebase replays your commits on top of the target for linear history; merge records the join and preserves what actually happened. The rule: never rebase a branch other people have already pulled — you rewrite commits they have, and their next push resurrects the old ones.

</details>

<details>
<summary><strong>4. You committed a secret and pushed it. What is the first action?</strong></summary>

Rotate or revoke the credential. It was compromised the moment it left your machine, and everything else is cleanup. Then purge it from history with `git-filter-repo` and coordinate the force push with the team. Deleting the file in a new commit changes nothing — the old blob is still reachable.

</details>

<details>
<summary><strong>5. Why `--force-with-lease` instead of `--force`?</strong></summary>

`--force-with-lease` refuses the push if the remote branch moved since your last fetch, so you cannot silently overwrite a teammate's commit. Plain `--force` will happily destroy work you never saw.

</details>

<details>
<summary><strong>6. What is `git bisect` for?</strong></summary>

Binary-searching history for the commit that introduced a bug. You mark a known-good and known-bad commit, Git checks out the midpoint, you test and mark it — about ten steps for a thousand commits. It is the fastest tool in Git for "this used to work."

</details>

---

## Practical Checkpoint

Before moving on, you should be able to:

- Create branches, make commits, resolve conflicts, and explain the history with `git log`.
- Use pull requests as a review and collaboration workflow.
- Recover from common mistakes such as committing to the wrong branch or needing to inspect an older version.

Portfolio evidence to keep:

- A sample repository with a clean commit history.
- Conflict-resolution notes.
- A short PR workflow explanation with screenshots or copied command output where useful.

Suggested project: [Branching Workflow with Conflict Resolution](./projects/project-01-branching-conflict-workflow.md)

---

## What's Next?

With Git mastered, you're ready to automate tasks with scripting — the bridge between manual operations and full automation.

**[Module 04: Scripting →](../04-scripting/)**

---

<div align="center">

**Module 03 Complete** 

[← Back to Networking](../02-networking/) | [ Cheat Sheet](./cheatsheet.md) | [Next: Scripting →](../04-scripting/)

</div>


## Reference
<!-- tab: Cheatsheet -->
> Command reference including the **"oh no" recovery section** you'll actually need. Concepts live in the [module README](./README.md).
> Cross-module daily commands: **[QUICK-REFERENCE.md](../QUICK-REFERENCE.md)**

**Jump to:** [Setup](#setup) · [Daily loop](#the-daily-loop) · [Branching](#branching) · [Remotes](#remotes--syncing) · [Inspecting](#inspecting-history) · [Undoing](#undoing-things--the-oh-no-section) · [Stash](#stashing) · [Rebase](#rebase--history-rewriting) · [Debugging](#using-git-to-debug) · [Secrets](#secrets--gitignore) · [Hooks](#hooks) · [gh CLI](#github-cli-gh) · [Conventions](#commit-message-conventions)

---

## Setup

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase true          # rebase instead of merge on pull
git config --global push.autoSetupRemote true # no more "--set-upstream" 
git config --global core.editor "vim"
git config --global diff.colorMoved zebra     # highlight moved code differently
git config --global rerere.enabled true       #  remember conflict resolutions
git config --global fetch.prune true          # drop deleted remote branches on fetch

git config --list --show-origin               # every setting and which file set it
git config user.email                         # what's active in this repo

# Commit signing (many orgs require it)
git config --global commit.gpgsign true
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
```

**Useful aliases:**

```bash
git config --global alias.st  "status -sb"
git config --global alias.lg  "log --oneline --graph --decorate --all"
git config --global alias.last "log -1 HEAD --stat"
git config --global alias.unstage "restore --staged"
git config --global alias.amend "commit --amend --no-edit"
```

---

## The Daily Loop

```bash
git status                    # what's changed  (git status -sb for compact)
git diff                      # unstaged changes
git diff --staged             # staged changes   review before committing
git diff main...HEAD          # everything your branch adds vs main
git diff --stat               # summary of files changed

git add file.txt
git add -A                    # everything, including deletions
git add .                     # everything under the current directory
git add -p                    #  interactively stage HUNKS — makes clean commits easy
git add -u                    # only already-tracked files

git commit -m "feat: add health endpoint"
git commit -am "fix: typo"    # add tracked files + commit (skips untracked)
git commit --amend            # rewrite the last commit (message and/or content)
git commit --amend --no-edit  # add staged changes to the last commit, keep message

git push
git push -u origin feature/x  # first push of a new branch
git pull                      # fetch + integrate
git fetch --all --prune       # update remote refs without touching your working tree
```

---

## Branching

```bash
git branch                              # local branches
git branch -a                           # + remote-tracking branches
git branch -vv                          # + upstream and ahead/behind counts  
git branch --merged main                # branches safe to delete
git branch --no-merged main             # branches with unmerged work

git switch -c feature/add-metrics       # create and switch (modern)
git checkout -b feature/add-metrics     # same thing (classic)
git switch main
git switch -                            #  back to the previous branch
git switch --detach abc1234             # inspect an old commit

git branch -m old-name new-name         # rename
git branch -d feature/done              # safe delete (refuses if unmerged)
git branch -D feature/abandoned         # force delete
git push origin --delete feature/done   # delete the remote branch

git merge feature/x
git merge --no-ff feature/x             # always create a merge commit
git merge --squash feature/x            # stage everything as one change
git merge --abort                       # bail out of a conflicted merge
```

### Conflict resolution

```bash
git status                              # lists "both modified" files
# Edit each file; remove <<<<<<< ======= >>>>>>> markers
git add resolved-file.txt
git commit                              # (merge) or: git rebase --continue

git checkout --ours  file               #  during MERGE: keep the current branch's version
git checkout --theirs file              #  during MERGE: keep the incoming version
                                        #    During REBASE these are SWAPPED
git diff --name-only --diff-filter=U    # list unresolved files
git merge --abort  /  git rebase --abort # start over
git mergetool                           # open a configured 3-way merge tool
```

>Enable `rerere` once (`git config --global rerere.enabled true`) and Git remembers how you resolved a conflict. On a long-running rebase where the same conflict reappears, it replays your resolution automatically.

---

## Remotes & Syncing

```bash
git remote -v
git remote add upstream https://github.com/original/repo.git
git remote set-url origin git@github.com:me/repo.git    # switch HTTPS → SSH
git remote rename origin old-origin
git remote show origin                  #  branch tracking + stale branch report

git fetch origin                        # download refs, change nothing locally
git fetch --all --prune                 # + delete refs to branches deleted upstream
git pull --rebase                       # replay your commits on top of upstream
git pull --ff-only                      #  refuse to create a surprise merge commit

git push
git push --force-with-lease             #  safe force: fails if someone else pushed
git push --force                        #  never on a shared branch
git push origin --tags
git push origin HEAD:main               # push current branch to a differently-named remote branch

# Sync a fork
git remote add upstream https://github.com/original/repo.git
git fetch upstream
git switch main
git merge upstream/main        # or: git rebase upstream/main
git push origin main
```

---

## Inspecting History

```bash
git log --oneline -20
git log --oneline --graph --decorate --all      #  the whole topology
git log -p file.txt                             # commits + diffs for one file
git log --follow file.txt                       # ...across renames
git log --stat                                  # files changed per commit
git log --since="2 weeks ago" --until=yesterday
git log --author="alice"
git log --grep="fix.*timeout"                   # search commit MESSAGES
git log -S "getUserById"                        #  commits that ADDED/REMOVED this string
git log -G "regex"                              # commits whose diff matches a regex
git log main..feature                           # commits in feature but not main
git log --merges / --no-merges
git log --format='%h %an %ar %s'                # custom output

git show abc1234                                # a commit's message + diff
git show abc1234:path/to/file                   # a FILE as it was at that commit
git show HEAD~3                                 # three commits back

git blame file.txt                              # who last touched each line
git blame -L 40,60 file.txt                     # only lines 40-60
git blame -w -C file.txt                        # ignore whitespace and moved code  

git shortlog -sn                                # commit counts per author
git diff abc1234..def5678                       # between two commits
git diff main --stat                            # summary vs main
git tag -l --sort=-v:refname | head             # newest tags
git describe --tags                             # human-readable version of HEAD
```

**Ref shorthands:** `HEAD` current commit · `HEAD~3` three first-parents back · `HEAD^2` second parent of a merge · `main@{yesterday}` · `@{-1}` previous branch · `abc1234^{tree}`

---

## Undoing Things — The "Oh No" Section

**Work out where the change is first** (working directory → index → commit → pushed), then pick the row:

| Situation | Command |
|-----------|---------|
| Discard unstaged changes in one file | `git restore file.txt` |
| Discard **all** unstaged changes | `git restore .`  unrecoverable |
| Unstage a file (keep the edits) | `git restore --staged file.txt` |
| Fix the last commit **message** | `git commit --amend` |
| Add a forgotten file to the last commit | `git add f && git commit --amend --no-edit` |
| Undo the last commit, keep changes **staged** | `git reset --soft HEAD~1` |
| Undo the last commit, keep changes **unstaged** | `git reset HEAD~1` (mixed, the default) |
| Undo the last commit and **throw the work away** | `git reset --hard HEAD~1`  |
| Undo a commit that's **already pushed** | `git revert abc1234`  makes a new inverse commit — safe |
| Revert a merge commit | `git revert -m 1 <merge-sha>` |
| Restore a file from another commit | `git restore --source=abc1234 file.txt` |
| Restore a deleted file | `git restore --source=HEAD~1 path/to/file` |
| Recover a deleted branch | `git reflog` → find the SHA → `git switch -c name <sha>` |
| Recover from a bad `reset --hard` | `git reflog` → `git reset --hard HEAD@{2}` |
| Abandon a rebase midway | `git rebase --abort` |
| Undo a `git pull` | `git reset --hard ORIG_HEAD` |
| Clean untracked files | `git clean -n` (dry run) then `git clean -fd`  |

### `git reflog` — your safety net

```bash
git reflog                       # every position HEAD has held, ~90 days
git reflog show feature/x        # for one branch
git reset --hard HEAD@{5}        # jump back to a previous state
git switch -c rescue abc1234     # rescue a commit from a deleted branch
```

>**Anything that was ever committed is recoverable via reflog**, including work on branches you deleted and commits you `reset --hard`'d away. Work that was *never committed* is not. That asymmetry is the entire argument for committing early and often — you can always tidy history later.

### The three resets

| | Commit history | Index (staged) | Working directory |
|---|---|---|---|
| `--soft` | moved back | **kept** | kept |
| `--mixed` (default) | moved back | reset | kept |
| `--hard` | moved back | reset | **wiped**  |

---

## Stashing

```bash
git stash                                # shelve tracked modifications
git stash -u                             #  include untracked files
git stash push -m "wip: prometheus config" -- path/to/file
git stash list
git stash show -p stash@{0}              # view the diff
git stash pop                            # apply the newest and delete it
git stash apply stash@{1}                # apply but KEEP it in the list
git stash drop stash@{0}
git stash clear                          #  delete all stashes
git stash branch fix/thing stash@{0}     # create a branch from a stash
```

---

## Rebase & History Rewriting

```bash
git rebase main                          # replay this branch on top of main
git rebase -i HEAD~5                     #  interactive: squash/reword/reorder/drop
git rebase --continue / --skip / --abort
git rebase --onto main old-base feature  # move a branch to a different base

git cherry-pick abc1234                  # apply one commit here
git cherry-pick abc1234^..def5678        # a range
git cherry-pick -n abc1234               # apply without committing
git cherry-pick --abort
```

**Interactive rebase verbs:**

| Verb | Effect |
|------|--------|
| `pick` | Keep the commit as-is |
| `reword` | Keep the change, edit the message |
| `edit` | Pause here so you can amend the content |
| `squash` | Merge into the previous commit, combine messages |
| `fixup` | Merge into the previous commit, **discard** this message |
| `drop` | Remove the commit entirely |
| `exec` | Run a shell command (e.g. tests) at this point |

```bash
# Autosquash workflow — clean up without an interactive editor
git commit --fixup=abc1234               # mark a commit as a fixup for abc1234
git rebase -i --autosquash HEAD~10       # Git orders and marks them for you  
```

>**The golden rule**: never rewrite history that other people have pulled. Rebase and amend are for your own unpushed work, or a branch only you are on — then push with `--force-with-lease`, never bare `--force`.

---

## Using Git to Debug

```bash
# Which commit introduced the bug? Binary search through history.
git bisect start
git bisect bad                      # current commit is broken
git bisect good v1.2.0              # this tag was fine
# Git checks out a midpoint; test it, then:
git bisect good      # or: git bisect bad
# ...repeat (log2 n steps) until Git names the culprit
git bisect reset

# Fully automated — Git runs your test script at each step
git bisect start HEAD v1.2.0
git bisect run ./scripts/reproduce-bug.sh    #  exit 0 = good, non-zero = bad
```

```bash
git log -S "problematicFunction" --oneline   # when was this code introduced/removed?
git log --all --oneline -- path/to/deleted-file   # history of a file that no longer exists
git diff v1.2.0..v1.3.0 -- config/           # what changed in config between releases
git blame -L 40,60 -w -C file.js             # who wrote these lines, ignoring reformatting
```

---

## Secrets & .gitignore

```bash
git check-ignore -v path/to/file        #  WHICH rule is ignoring this file?
git status --ignored
git rm --cached secrets.env             # stop tracking, keep the local file
git rm -r --cached .                    # re-apply .gitignore to everything
git add . && git commit -m "chore: apply gitignore"
```

**Essential `.gitignore` for DevOps repos:**

```gitignore
# Secrets and environment
.env
.env.*
!.env.example
*.pem
*.key
*_rsa
*.p12
credentials
.aws/
.kube/config

# Terraform
*.tfstate
*.tfstate.*
.terraform/
*.tfvars
!*.tfvars.example
crash.log

# Ansible
*.retry
vault-password*

# Build and dependencies
node_modules/
__pycache__/
*.pyc
venv/
dist/
build/
target/

# Editors and OS
.DS_Store
.idea/
.vscode/
*.swp
```

**Prevention beats cleanup:**

```bash
# Scan the working tree and history
gitleaks detect --source . --verbose
trufflehog git file://. --only-verified

# Pre-commit hook
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
      - id: check-merge-conflict
      - id: end-of-file-fixer
      - id: trailing-whitespace
YAML
pre-commit install
```

**If a secret is already committed:**

```bash
# 1. ROTATE THE SECRET FIRST. Assume it is compromised the moment it is pushed.
# 2. Then purge it from history:
pip install git-filter-repo
git filter-repo --path secrets.env --invert-paths
# or replace the string everywhere:
printf 'AKIAIOSFODNN7EXAMPLE==>REDACTED\n' > replacements.txt
git filter-repo --replace-text replacements.txt
# 3. Force-push and tell every collaborator to re-clone.
```

>Rewriting history does **not** remove a secret from GitHub's cached views, forks, or anyone's local clone. Rotation is the fix; history rewriting is cleanup.

---

## Hooks

Local hooks live in `.git/hooks/` (not version-controlled). Share them via `pre-commit` or a tracked directory + `git config core.hooksPath`.

| Hook | Fires | Typical use |
|------|-------|-------------|
| `pre-commit` | Before the commit is created | Lint, format, secret scan, fast tests |
| `commit-msg` | After the message is written | Enforce Conventional Commits |
| `pre-push` | Before pushing | Run the test suite |
| `post-merge` | After a merge/pull | Reinstall dependencies |
| `pre-receive` | Server-side | Reject non-compliant pushes org-wide |

```bash
cat > .git/hooks/pre-commit <<'SH'
#!/usr/bin/env bash
set -e
if git diff --cached --name-only | grep -qE '\.(tf)$'; then
  terraform fmt -check -recursive || { echo "Run: terraform fmt -recursive"; exit 1; }
fi
git diff --cached -U0 | grep -nE '(AKIA[0-9A-Z]{16}|-----BEGIN .* PRIVATE KEY-----)' \
  && { echo " Possible secret in staged changes"; exit 1; }
exit 0
SH
chmod +x .git/hooks/pre-commit

git commit --no-verify        #  bypass hooks (use sparingly)
git config core.hooksPath .githooks     # share hooks via a tracked directory
```

---

## GitHub CLI (`gh`)

```bash
gh auth login
gh repo clone owner/repo
gh repo create my-project --public --clone

gh pr create --fill                          # title/body from your commits
gh pr create --title "feat: x" --body "..." --base main --draft
gh pr list / gh pr list --author @me
gh pr status                                 #  your PRs and what's blocking them
gh pr view 42 --web
gh pr checkout 42                            # check out someone's PR locally
gh pr diff 42
gh pr checks 42                              # CI status
gh pr review 42 --approve / --request-changes -b "..."
gh pr merge 42 --squash --delete-branch

gh issue create --title "Bug: ..." --label bug
gh issue list --assignee @me

gh run list                                  # recent Actions runs
gh run view 12345 --log-failed               #  only the failing step's logs
gh run watch                                 # live-follow the current run
gh run rerun 12345 --failed
gh workflow run deploy.yml -f environment=staging

gh secret set AWS_ACCESS_KEY_ID              # reads from stdin
gh secret list
gh release create v1.2.0 --generate-notes
gh api repos/:owner/:repo/branches/main/protection    # raw API access
```

---

## Commit Message Conventions

```
<type>(<optional scope>): <subject in imperative mood, ≤50 chars>

<body: WHY this change, not what — wrap at 72 chars>

<footer: BREAKING CHANGE: ... / Refs: #123>
```

| Type | Use for |
|------|---------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no behaviour change |
| `refactor` | Restructuring without behaviour change |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `build` | Build system or dependencies |
| `ci` | Pipeline configuration |
| `chore` | Maintenance, tooling |
| `revert` | Reverting a previous commit |

```
feat(monitoring): add Prometheus alert for disk pressure

Nodes were filling up silently — the only signal was a failed
deploy hours later. Alerts at 85% (warning) and 95% (critical)
with a 10m `for:` so short bursts don't page anyone.

Refs: #482
```

**Good subjects** finish the sentence *"If applied, this commit will..."*: `add health endpoint`, `fix race in worker pool`. Not `added stuff`, `fixes`, `wip`.

---

<div align="center">

[← Module 03 README](./README.md) · [Resources](./resources.md) · [Labs](./labs/) · [Handbook Quick Reference](../QUICK-REFERENCE.md)

</div>
<!-- tab: Labs -->
# Lab 01: Git Core Workflow Mastery

## Objective

Build complete fluency with Git's daily workflow — init, add, commit, branch, merge, and conflict resolution. By the end, these commands should be muscle memory.

---

## Prerequisites

- Git installed and configured (`git config --global user.name/email`)
- Terminal access

---

## Deliverables and Evidence

By the end of this lab, keep the following evidence in your notes or portfolio repo:

- Commands you ran and the important output you used for validation
- Any files, scripts, configs, manifests, or workflows you created
- A short failure note describing one thing that broke, how you diagnosed it, and how you fixed it
- Cleanup commands or confirmation that no long-running resources remain

Treat the validation section as the minimum proof that the lab worked.

---

## Exercise 1: Repository Lifecycle

### Step 1: Create and Initialize

```bash
mkdir -p ~/devops-labs/module-03/git-practice
cd ~/devops-labs/module-03/git-practice
git init

# Verify
ls -la .git/
# The .git/ directory IS your repository — everything Git tracks lives here

git status
# On branch main (or master)
# No commits yet
```

### Step 2: First Commits

```bash
# Create an application structure
mkdir -p src config

cat > src/app.py << 'APP'
#!/usr/bin/env python3
"""Simple web application"""

def get_status():
    return {"status": "healthy", "version": "1.0.0"}

def get_config():
    return {"port": 8080, "debug": False}

if __name__ == "__main__":
    print(get_status())
APP

cat > config/settings.yaml << 'CONFIG'
app:
  name: devops-demo
  port: 8080
  environment: development
  
database:
  host: localhost
  port: 5432
  name: myapp
CONFIG

cat > README.md << 'README'
# DevOps Demo App

A simple application for practicing Git workflows.

## Quick Start
```bash
python3 src/app.py
```

README

# Check status — all files are "untracked"

git status

# Stage files individually (understand what you're committing)

git add README.md
git status

# README.md is now in "Changes to be committed" (staged)

git add src/app.py
git add config/settings.yaml

# Commit

git commit -m "feat: initial project structure with app and config"

# View the commit

git log --oneline

```

### Step 3: Making Changes and Seeing Diffs

```bash
# Modify the app
cat >> src/app.py << 'UPDATE'

def get_metrics():
    """Return application metrics"""
    return {
        "requests_total": 0,
        "errors_total": 0,
        "uptime_seconds": 0
    }
UPDATE

# See what changed
git diff
# Shows exact lines added (green +) and removed (red -)

# Stage and commit
git add src/app.py
git diff --staged    # See what's about to be committed
git commit -m "feat: add metrics endpoint"

# View history
git log --oneline
# abc1234 feat: add metrics endpoint
# def5678 feat: initial project structure with app and config
```

---

## Exercise 2: Branching and Merging

### Step 1: Feature Branch Workflow

```bash
# Create a feature branch
git checkout -b feature/add-logging

# Make changes on the branch
cat > src/logger.py << 'LOGGER'
#!/usr/bin/env python3
"""Logging configuration"""
import logging

def setup_logging(level="INFO"):
    logging.basicConfig(
        level=getattr(logging, level),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    return logging.getLogger("app")
LOGGER

# Update app.py to use logging
cat >> src/app.py << 'LOG_UPDATE'

# Logging setup
from logger import setup_logging
logger = setup_logging()
logger.info("Application initialized")
LOG_UPDATE

git add -A
git commit -m "feat: add structured logging module"

# Check what branches exist
git branch
# * feature/add-logging
#   main

# See the divergence
git log --oneline --graph --all
```

### Step 2: Merge the Feature Branch

```bash
# Switch back to main
git checkout main

# Verify the logging files DON'T exist on main
ls src/
# Only app.py — logger.py is only on the feature branch

# Merge the feature branch
git merge feature/add-logging
# Fast-forward merge (no conflicts, linear history)

# Verify
ls src/
# app.py  logger.py — now both files exist on main

git log --oneline

# Delete the merged branch (clean up)
git branch -d feature/add-logging
```

---

## Exercise 3: Merge Conflict Resolution

### Step 1: Create a Conflict

```bash
# Create two branches that modify the same file
git checkout -b branch-a
# Modify settings on branch-a
sed -i 's/port: 8080/port: 9090/' config/settings.yaml
git add config/settings.yaml
git commit -m "config: change port to 9090"

# Switch to main and create branch-b
git checkout main
git checkout -b branch-b
# Modify the SAME line differently
sed -i 's/port: 8080/port: 3000/' config/settings.yaml
git add config/settings.yaml
git commit -m "config: change port to 3000"

# Now merge branch-a into main
git checkout main
git merge branch-a    # This works fine (fast-forward)

# Now try to merge branch-b
git merge branch-b
# CONFLICT (content): Merge conflict in config/settings.yaml
# Automatic merge failed!
```

### Step 2: Resolve the Conflict

```bash
# See the conflict
git status
# both modified: config/settings.yaml

# Look at the conflict markers
cat config/settings.yaml
# You'll see:
# <<<<<<< HEAD
#   port: 9090
# =======
#   port: 3000
# >>>>>>> branch-b

# Edit the file — choose the correct value (or combine)
# Let's say we want port 3000
cat > config/settings.yaml << 'RESOLVED'
app:
  name: devops-demo
  port: 3000
  environment: development
  
database:
  host: localhost
  port: 5432
  name: myapp
RESOLVED

# Mark as resolved
git add config/settings.yaml
git commit -m "merge: resolve port conflict, using 3000 for new service"

# Clean up branches
git branch -d branch-a branch-b

# View the merge in history
git log --oneline --graph
```

---

## Exercise 4: Undoing Mistakes

### Scenario 1: Uncommit the Last Commit (Keep Changes)

```bash
# Make a commit you want to undo
echo "temporary debug line" >> src/app.py
git add src/app.py
git commit -m "debug: add temp logging"

# Undo the commit but keep changes staged
git reset --soft HEAD~1
git status
# Changes are still staged — you can modify and recommit

# Or undo and unstage
git reset HEAD~1
git status
# Changes are in working directory, not staged

# Clean up
git checkout -- src/app.py
```

### Scenario 2: Revert a Pushed Commit (Safe for Shared Repos)

```bash
# Make a "bad" commit
echo "bad_config=true" >> config/settings.yaml
git add -A && git commit -m "config: add experimental setting"

# Revert it (creates a NEW commit that undoes the change)
git revert HEAD --no-edit

# View history — both commits are visible
git log --oneline -5
# The revert commit shows: Revert "config: add experimental setting"
```

### Scenario 3: Recover a Deleted Branch

```bash
# Create a branch with work
git checkout -b important-work
echo "critical code" > src/critical.py
git add -A && git commit -m "feat: add critical module"

# Switch to main and "accidentally" delete it
git checkout main
git branch -D important-work

# Oh no! But Git remembers — use reflog
git reflog | head -10
# Find the commit hash for "feat: add critical module"

# Recover it
git checkout -b important-work <commit-hash-from-reflog>
# Branch is back with all its work!

# Clean up
git checkout main
git branch -D important-work
```

---

## Break It: Git Debugging

### Challenge: "What Changed?"

```bash
# Simulate a deployment investigation
echo "timeout: 5" >> config/settings.yaml
git add -A && git commit -m "v1.0 release"

echo "timeout: 30" >> config/settings.yaml
git add -A && git commit -m "v1.1: increase timeout"

echo "timeout: 1" >> config/settings.yaml
git add -A && git commit -m "v1.2: optimize timeout"

# Production issue: timeouts are too aggressive
# Find what changed:

# Method 1: git log for the file
git log --oneline -- config/settings.yaml

# Method 2: git blame (see who changed each line)
git blame config/settings.yaml

# Method 3: diff between versions
git diff HEAD~2..HEAD -- config/settings.yaml
```

---

## Validation

- [ ] Create a repo, make commits with proper messages
- [ ] Create and merge feature branches
- [ ] Resolve a merge conflict manually
- [ ] Use `git revert` to undo a commit safely
- [ ] Use `git reflog` to recover lost work
- [ ] Use `git blame` and `git log` to investigate changes
- [ ] Explain when to use merge vs rebase

## What to Commit

Add these to your portfolio repo as evidence of completed work:

- Git command cheat sheet with your own annotations
- Merge conflict resolution example with before/after
- Break It debugging log showing recovery commands used

---

[← Back to Module README](../README.md) | [Next Lab: GitHub Workflows & PRs →](./lab-02-github-workflows.md)

---

# Lab 02: GitHub Workflows & Pull Requests

## Objective

Practice the complete GitHub collaboration workflow — forking, branching, PRs, code review, and branch protection. This is how every DevOps team works.

---

## Prerequisites

- GitHub account
- Git configured with SSH keys
- GitHub CLI (`gh`) installed: `sudo apt install -y gh` on Debian/Ubuntu or `sudo dnf install -y gh` on RHEL-compatible systems, then `gh auth login`

---

## Deliverables and Evidence

By the end of this lab, keep the following evidence in your notes or portfolio repo:

- Commands you ran and the important output you used for validation
- Any files, scripts, configs, manifests, or workflows you created
- A short failure note describing one thing that broke, how you diagnosed it, and how you fixed it
- Cleanup commands or confirmation that no long-running resources remain

Treat the validation section as the minimum proof that the lab worked.

---

## Exercise 1: The Complete PR Workflow

### Step 1: Create a Repository on GitHub

```bash
cd ~/devops-labs/module-03
mkdir github-workflow && cd github-workflow
git init

# Create initial content
cat > README.md << 'README'
# Infrastructure Config

Terraform and Ansible configurations for our production environment.

## Structure
- `terraform/` — Infrastructure as Code
- `ansible/` — Configuration Management
- `scripts/` — Utility scripts
README

mkdir -p terraform ansible scripts

cat > terraform/main.tf << 'TF'
# Main Terraform configuration
provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "web-server"
    Environment = "production"
  }
}
TF

cat > .gitignore << 'IGNORE'
.terraform/
*.tfstate
*.tfstate.backup
.env
*.pem
IGNORE

git add -A
git commit -m "feat: initial infrastructure setup"

# Create the repo on GitHub and push
gh repo create github-workflow --public --source=. --push
```

### Step 2: Create a Feature Branch and PR

```bash
# Create a branch for a new feature
git checkout -b feature/add-monitoring-instance

# Add monitoring server config
cat > terraform/monitoring.tf << 'TF'
# Monitoring infrastructure
resource "aws_instance" "monitoring" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.medium"

  tags = {
    Name        = "monitoring-server"
    Environment = "production"
    Role        = "prometheus-grafana"
  }
}

resource "aws_security_group" "monitoring" {
  name        = "monitoring-sg"
  description = "Security group for monitoring stack"

  ingress {
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
    description = "Prometheus"
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
    description = "Grafana"
  }
}
TF

git add -A
git commit -m "feat(infra): add monitoring server with Prometheus and Grafana"

# Push the branch
git push -u origin feature/add-monitoring-instance

# Create a PR using GitHub CLI
gh pr create \
  --title "feat(infra): Add monitoring server" \
  --body "## Changes
- Add Prometheus + Grafana monitoring server (t2.medium)
- Configure security group for ports 9090 (Prometheus) and 3000 (Grafana)
- Restrict access to internal network (10.0.0.0/8)

## Testing
- [ ] terraform plan shows expected resources
- [ ] Security group rules are correct
- [ ] No public access to monitoring ports"
```

### Step 3: Review and Merge

```bash
# List open PRs
gh pr list

# View PR details
gh pr view 1

# Check out PR locally for testing (as a reviewer would)
gh pr checkout 1

# After review, merge with squash
gh pr merge 1 --squash --delete-branch

# Pull the merged changes
git checkout main
git pull
```

---

## Exercise 2: .gitignore Audit

### Step 1: Check For Accidentally Committed Files

```bash
# Common problem: secrets or state files committed

# Create some files that should be ignored
echo "AWS_SECRET_KEY=AKIAIOSFODNN7EXAMPLE" > .env
echo '{"state": "data"}' > terraform/terraform.tfstate

# Check if .gitignore catches them
git status
# .env and terraform.tfstate should NOT appear (ignored!)

# Verify what's being ignored
git status --ignored

# What if a file was committed BEFORE .gitignore was set up?
# .gitignore doesn't remove already-tracked files!

# Simulate: track a file, then try to ignore it
echo "oops" > tracked-secret.txt
git add tracked-secret.txt
git commit -m "oops: committed a secret"

echo "tracked-secret.txt" >> .gitignore
git add .gitignore
git commit -m "chore: update gitignore"

git status
# tracked-secret.txt is STILL tracked!

# Fix: Remove from tracking (but keep the file locally)
git rm --cached tracked-secret.txt
git commit -m "fix: remove tracked secret from version control"

# Now it's properly ignored
git status
# Nothing to commit
```

---

## Break It: Recovery Scenarios

### Scenario: Someone Force Pushed to Main

```bash
# Simulate: You're working and someone rewrites main
git checkout -b your-work
echo "your important changes" > scripts/deploy.sh
git add -A && git commit -m "feat: add deploy script"

# Come back to main and see it's been rewritten
git checkout main

# Use reflog to find the state before the force push
git reflog
# Find the commit hash you want to recover to

# Recovery options:
# 1. Reset to the known good state
# 2. Cherry-pick your commits onto the new main
```

---

## Validation

- [ ] Create a GitHub repo from the command line
- [ ] Create a PR with a descriptive body
- [ ] Review, approve, and merge a PR
- [ ] Properly configure .gitignore for a DevOps project
- [ ] Remove an accidentally tracked file from Git
- [ ] Use `gh` CLI for common GitHub operations

---

## Key Takeaways

1. **PRs are the gate to production** — every change should go through review
2. **`.gitignore` must be set up BEFORE first commit** — retroactive ignoring requires extra steps
3. **Never commit secrets** — even removing them later leaves traces in history
4. The GitHub CLI (`gh`) makes PR workflows much faster than the web UI

---

[← Previous Lab](./lab-01-git-core-workflow.md) | [Back to Module README](../README.md)

## What to Commit

Add these to your portfolio repo as evidence of completed work:

- Example PR with description, review comments, and merge
- Your .gitignore audit results and fixes
- Recovery scenario notes from the Break It section

---
<!-- tab: Projects -->
# Project: Branching Workflow with Conflict Resolution

## Problem Statement

Build a small repository that demonstrates a realistic Git workflow: feature branches, pull request review, merge conflict, conflict resolution, and clean history inspection.

## Deliverables

- Repository with at least two feature branches
- One intentional merge conflict
- Conflict-resolution notes explaining the competing changes
- Final merged history that can be explained with `git log --oneline --graph --all`

## Validation

Capture command output showing:

- Branches before merge
- Conflict status from `git status`
- Resolved file diff
- Final commit graph

## Failure Scenario

Simulate committing to the wrong branch. Document how you detect it and recover using a new branch, cherry-pick, or reset strategy appropriate for local work.

## What to Commit

- Sample repo files
- `conflict-resolution.md`
- `recovery-notes.md`

## Review Rubric

Use this rubric to self-assess your work or have a peer review it.

| Criteria | What to Look For | Score (1-5) |
|----------|-----------------|-------------|
| **Reproducibility** | Workflow can be replayed from the documented commands | |
| **Correctness** | Branch strategy is sound; merge conflicts are resolved correctly | |
| **Debugging quality** | At least one realistic conflict scenario with resolution explanation | |
| **Security basics** | .gitignore prevents secrets and build artifacts from being committed | |
| **Cleanup quality** | Feature branches are deleted after merge; repo is in a clean state | |
| **Explanation clarity** | Branching diagram or description shows the workflow clearly | |

**Scoring**: 1 = Not attempted, 2 = Partial, 3 = Meets expectations, 4 = Exceeds expectations, 5 = Production quality
<!-- tab: Resources -->
Curated resources for mastering Git and GitHub.

---

## Essential Reading

| Resource | Type | Difficulty | Notes |
|----------|------|------------|-------|
| [Pro Git Book (free)](https://git-scm.com/book/en/v2) | Book | All levels | **THE** definitive Git reference |
| [GitHub Docs](https://docs.github.com/) | Documentation | All levels | Official GitHub documentation |
| [Conventional Commits](https://www.conventionalcommits.org/) | Spec | Beginner | Standardized commit messages |
| [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials) | Tutorials | Beginner-Intermediate | Excellent visual explanations |

---

## Videos & Courses

| Resource | Type | Duration | Notes |
|----------|------|----------|-------|
| [Git for Professionals (fireship)](https://www.youtube.com/watch?v=Uszj_k0DGsg) | Video | 13 min | Quick advanced tips |
| [Git & GitHub Crash Course (freeCodeCamp)](https://www.youtube.com/watch?v=RGOj5yH7evk) | Course | 1 hour | Comprehensive beginner course |
| [Advanced Git (Atlassian)](https://www.youtube.com/watch?v=qsTthZi23VE) | Video | 30 min | Rebase, cherry-pick, bisect |
| [GitHub Actions CI/CD (TechWorld with Nana)](https://www.youtube.com/watch?v=R8_veQiYBjI) | Video | 30 min | GitHub Actions intro |

---

## Interactive Practice

| Resource | Type | Notes |
|----------|------|-------|
| [Learn Git Branching](https://learngitbranching.js.org/) | Interactive | **BEST** visual Git practice — do this! |
| [Oh My Git!](https://ohmygit.org/) | Game | Learn Git through a game |
| [GitHub Skills](https://skills.github.com/) | Interactive courses | Official GitHub learning paths |
| [gitignore.io](https://www.toptal.com/developers/gitignore) | Generator | Generate .gitignore for any tech stack |

---

## References

| Resource | Type | Notes |
|----------|------|-------|
| [Git Cheat Sheet (GitHub)](https://education.github.com/git-cheat-sheet-education.pdf) | PDF | Quick reference |
| [Oh Shit, Git!?!](https://ohshitgit.com/) | Web | Fixing common Git mistakes |
| [Flight Rules for Git](https://github.com/k88hudson/git-flight-rules) | GitHub | Comprehensive "what to do when..." guide |

---

## Recommended Practice Path

1. **Day 1**: Complete [Learn Git Branching](https://learngitbranching.js.org/) — intro + remote sections
2. **Day 2-3**: Read Pro Git chapters 1-3, practice with a real repo
3. **Day 4-5**: Practice branching, merging, resolving conflicts
4. **Ongoing**: Bookmark "Oh Shit, Git" for when you mess up (everyone does)
<!-- /tabs -->
