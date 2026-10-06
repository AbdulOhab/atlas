---
title: "Guardrails with Hooks & MCP Servers"
order: 5
summary: "Keeping agents safe and extensible: permission checks before tools run, hooks around the loop, and MCP for plugging in tools."
category: "Agentic Software Engineering"
level: Intermediate
---

# Guardrails with Hooks & MCP Servers

An agent that can run commands needs limits. Permissions and hooks put checks around every tool call, and the Model Context Protocol (MCP) is the standard way to add tools without changing the agent.

**Course milestone:** Agentic Software Engineering

## Permissions

> **Source:** [Permissions](https://github.com/shareAI-lab/learn-claude-code/tree/HEAD/s03_permission) · [Learn Claude Code](https://github.com/shareAI-lab/learn-claude-code), MIT

s01 → s02 → `s03` → [s04](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s04_hooks) → s05 → ... → s16 → s17
> *"Check permissions before executing"* — The permission pipeline decides which operations need approval.
>
> **Harness Layer**: Permission — a gate before tool execution.

---

### The Problem

s02's Agent has 5 tools. File tools are protected by `safe_path`, but bash is unrestricted. Ask it to "clean up the project," and it might run `rm -rf /`.

Safety can't rely on trusting the model — it needs code: a check before every tool execution.

---

### The Solution

![Permission Overview](https://raw.githubusercontent.com/shareAI-lab/learn-claude-code/HEAD/s03_permission/images/permission-overview.en.svg)

s02's loop is fully preserved. The only change is inserting `check_permission()` before tool execution — each tool call passes through three gates in a fixed order: hard deny first, then soft ask, and if neither matches, allow.

The three gates correspond to three decisions:

| Gate | Purpose | On Match |
|------|---------|----------|
| 1. Deny List | Permanently forbidden operations (`rm -rf /`, `sudo`) | Denied immediately, not executed |
| 2. Rule Matching | Context-dependent operations (reading/writing outside workspace, `rm` files) | Passed to Gate 3 |
| 3. User Approval | After Gate 2 matches, pauses for user confirmation | User decides allow or deny |

None of the three gates match → execute directly. Most routine operations take this path.

---

### How It Works

![Permission Pipeline](https://raw.githubusercontent.com/shareAI-lab/learn-claude-code/HEAD/s03_permission/images/permission-pipeline.en.svg)

**Gate 1**: A hard deny list. Check first; if matched, return a block message. This list uses simple string matching to show where the permission gate sits; it is not a complete security boundary.

```python
DENY_LIST = [
    "rm -rf /", "sudo", "shutdown", "reboot",
    "mkfs", "dd if=", "> /dev/sda",
]

def check_deny_list(command: str) -> str | None:
    for pattern in DENY_LIST:
        if pattern in command:
            return f"Blocked: '{pattern}' is on the deny list"
    return None
```

**Gate 2**: Rule matching — describes "when to ask the user." Each rule specifies a tool and a check condition.

```python
import re

DESTRUCTIVE_COMMAND_WORD = re.compile(
    r"(?i)(?:^|[;&|()\n])\s*(?:rm|del)(?=\s|$|[;&|()])"
)

def contains_destructive_command(command: str) -> bool:
    return bool(DESTRUCTIVE_COMMAND_WORD.search(command))

PERMISSION_RULES = [
    {
        "tools": ["read_file", "write_file", "edit_file"],
        "check": lambda args: not (WORKDIR / args.get("path", "")).resolve().is_relative_to(WORKDIR),
        "message": "Access outside workspace",
    },
    {
        "tools": ["bash"],
        "check": lambda args: contains_destructive_command(args.get("command", "")) or any(
            kw in args.get("command", "") for kw in ["rm ", "> /etc/", "chmod 777"]
        ),
        "message": "Potentially destructive command",
    },
]

def check_rules(tool_name: str, args: dict) -> str | None:
    for rule in PERMISSION_RULES:
        if tool_name in rule["tools"] and rule["check"](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s03_permission/args):
            return rule["message"]
    return None
```

**Gate 3**: After a rule matches, pause for user input.

```python
def ask_user(tool_name: str, args: dict, reason: str) -> str:
    print(f"\n⚠  {reason}")
    print(f"   Tool: {tool_name}({args})")
    choice = input("   Allow? [y/N] ").strip().lower()
    return "allow" if choice in ("y", "yes") else "deny"
```

**All three gates chained together**, inserted before tool execution:

```python
def check_permission(block) -> bool:
    # Gate 1: Hard deny
    if block.name == "bash":
        reason = check_deny_list(block.input.get("command", ""))
        if reason:
            print(f"\n⛔ {reason}")
            return False

    # Gate 2 + 3: Rule matching → User approval
    reason = check_rules(block.name, block.input)
    if reason:
        decision = ask_user(block.name, block.input, reason)
        if decision == "deny":
            return False

    return True

# In agent_loop — s02's loop with just one line added:
for block in tool_calls:
    if not check_permission(block):           # ← NEW
        results.append({... "content": "Permission denied."})
        continue
    output = TOOL_HANDLERS[block.name](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s03_permission/**block.input)  # s02 original
    results.append(...)
```

---

### Changes from s02

| Component | Before (s02) | After (s03) |
|-----------|-------------|-------------|
| Security model | None (trust the model) | Three-gate permission pipeline |
| New functions | — | check_deny_list, check_rules, ask_user, check_permission |
| Loop | Executes all tools directly | Inserts check_permission() before execution |

---

### Try It

```sh
cd learn-claude-code
python s03_permission/code.py
```

Try these prompts:

1. `Create a file called test.txt in the current directory` (should pass through)
2. `Delete the file test.txt` (bash + rm triggers Gate 2)
3. `What files are in the current directory?` (read-only, all pass)
4. `Try to write a file to /etc/something` (writing outside workspace triggers Gate 2)
5. On Windows, `del test.txt` and `DEL test.txt` trigger Gate 2, while `model`, `delimiter`, and `echo del test.txt` do not.

What to watch for: Which operations pass through? Which need your confirmation? Which are denied outright?

---

### What's Next

Permission checks are in place — but every check is hardcoded as `check_permission()` inside the loop. What if you want to add logging before and after each tool execution? What if you want to auto-trigger a git commit after certain operations? Scattering this extension logic throughout the loop makes it bloat.

→ s04 Hooks: Add hooks to the loop. Extension logic hangs on hooks; the loop stays clean.

<!-- translation-sync: zh@v1, en@v1, ja@v1 -->

### Full code

From [`s03_permission/code.py`](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s03_permission/code.py):

```python
#!/usr/bin/env python3
"""
s03_permission.py - Permission System

Three gates inserted before tool execution:

    Gate 1: Hard deny list (rm -rf /, sudo, ...)
    Gate 2: Rule matching (write outside workspace? destructive cmd?)
    Gate 3: User approval (pause and wait for confirmation)

    +----------+      +-------+      +--------------+      +---------------+
    |   User   | ---> |  LLM  | ---> | Permission   | ---> | Tool Dispatch |
    |  prompt  |      |       |      | 1. deny list |      | execute       |
    +----------+      +---+---+      | 2. rules     |      +-------+-------+
                          ^          | 3. approval  |              |
                          |          +------+-------+              |
                          |                 | deny                 |
                          |                 v                      v
                          |          +-------------------------------+
                          +----------+ tool_result: denied or output |
                                     +-------------------------------+

Only one line added to the agent loop:

    if not check_permission(block):
        continue

Builds on s02 (multi-tool). Usage:

    python s03_permission/code.py
    Needs: pip install anthropic python-dotenv + ANTHROPIC_API_KEY in .env
"""

import os
import re
import subprocess
from pathlib import Path

try:
    import readline
    readline.parse_and_bind('set bind-tty-special-chars off')
    readline.parse_and_bind('set input-meta on')
    readline.parse_and_bind('set output-meta on')
    readline.parse_and_bind('set convert-meta off')
except ImportError:
    pass

from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv(override=True)
if os.getenv("ANTHROPIC_BASE_URL"):
    os.environ.pop("ANTHROPIC_AUTH_TOKEN", None)

WORKDIR = Path.cwd()
client = Anthropic(base_url=os.getenv("ANTHROPIC_BASE_URL"))
MODEL = os.environ["MODEL_ID"]

ENVIRONMENT_PROMPT = (
    "Windows: the bash tool runs through cmd.exe; use cmd.exe syntax, not Unix "
    "Bash or PowerShell syntax, and prefer dedicated file tools for file operations"
    if os.name == "nt"
    else "Unix-like: the bash tool runs the system shell"
)

SYSTEM = (
    f"You are a coding agent at {WORKDIR}. Environment: {ENVIRONMENT_PROMPT}. "
    "All destructive operations require user approval."
)

# -- From s02: tool implementations --

def run_bash(command: str) -> str:
    try:
        r = subprocess.run(command, shell=True, cwd=WORKDIR,
                           capture_output=True, text=True, errors="replace", timeout=120)
        out = (r.stdout + r.stderr).strip()
        return out[:50000] if out else "(no output)"
    except subprocess.TimeoutExpired:
        return "Error: Timeout (120s)"

def run_read(path: str, limit: int | None = None) -> str:
    try:
        lines = (WORKDIR / path).resolve().read_text(encoding="utf-8").splitlines()
        if limit and limit < len(lines):
            lines = lines[:limit] + [f"... ({len(lines) - limit} more lines)"]
        return "\n".join(lines)
    except Exception as e:
        return f"Error: {e}"

def run_write(path: str, content: str) -> str:
    try:
        file_path = (WORKDIR / path).resolve()
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(content, encoding="utf-8")
        return f"Wrote {len(content)} bytes to {path}"
    except Exception as e:
        return f"Error: {e}"

def run_edit(path: str, old_text: str, new_text: str) -> str:
    try:
        file_path = (WORKDIR / path).resolve()
        text = file_path.read_text(encoding="utf-8")
        if old_text not in text:
            return f"Error: text not found in {path}"
        file_path.write_text(text.replace(old_text, new_text, 1), encoding="utf-8")
        return f"Edited {path}"
    except Exception as e:
        return f"Error: {e}"

def run_glob(pattern: str) -> str:
    import glob as g
    try:
        matches = sorted({
            match for match in g.glob(
                pattern, root_dir=WORKDIR, recursive=True)
            if (WORKDIR / match).resolve().is_relative_to(WORKDIR)
        })
        shown = matches[:200]
        if len(matches) > 200:
            shown.append("... (more matches omitted; narrow the pattern)")
        return "\n".join(shown) if shown else "(no matches)"
    except Exception as e:
        return f"Error: {e}"

# -- From s02 (unchanged): tool definitions and dispatch --

TOOLS = [
    {"name": "bash", "description": "Run a shell command.",
     "input_schema": {"type": "object", "properties": {"command": {"type": "string"}}, "required": ["command"]}},
    {"name": "read_file", "description": "Read file contents.",
     "input_schema": {"type": "object", "properties": {"path": {"type": "string"}, "limit": {"type": "integer"}}, "required": ["path"]}},
    {"name": "write_file", "description": "Write content to a file.",
     "input_schema": {"type": "object", "properties": {"path": {"type": "string"}, "content": {"type": "string"}}, "required": ["path", "content"]}},
    {"name": "edit_file", "description": "Replace exact text in a file once.",
     "input_schema": {"type": "object", "properties": {"path": {"type": "string"}, "old_text": {"type": "string"}, "new_text": {"type": "string"}}, "required": ["path", "old_text", "new_text"]}},
    {"name": "glob", "description": "Find files matching a glob pattern; ** matches recursively.",
     "input_schema": {"type": "object", "properties": {"pattern": {"type": "string"}}, "required": ["pattern"]}},
]

TOOL_HANDLERS = {
    "bash": run_bash, "read_file": run_read, "write_file": run_write,
    "edit_file": run_edit, "glob": run_glob,
}

# -- New in s03: three-gate permission pipeline --

# Gate 1: Hard deny list - always forbidden
DENY_LIST = ["rm -rf /", "sudo", "shutdown", "reboot", "mkfs", "dd if=", "> /dev/sda"]

def check_deny_list(command: str) -> str | None:
    for pattern in DENY_LIST:
        if pattern in command:
            return f"Blocked: '{pattern}' is on the deny list"
    return None

# Gate 2: Rule matching - context-dependent checks
DESTRUCTIVE_COMMAND_WORD = re.compile(
    r"(?i)(?:^|[;&|()\n])\s*(?:rm|del)(?=\s|$|[;&|()])"
)

def contains_destructive_command(command: str) -> bool:
    return bool(DESTRUCTIVE_COMMAND_WORD.search(command))

PERMISSION_RULES = [
    {"tools": ["read_file", "write_file", "edit_file"],
     "check": lambda args: not (WORKDIR / args.get("path", "")).resolve().is_relative_to(WORKDIR),
     "message": "Writing outside workspace"},
    {"tools": ["bash"],
     "check": lambda args: contains_destructive_command(args.get("command", "")) or
     any(kw in args.get("command", "") for kw in ["rm ", "> /etc/", "chmod 777"]),
     "message": "Potentially destructive command"},
]

def check_rules(tool_name: str, args: dict) -> str | None:
    for rule in PERMISSION_RULES:
        if tool_name in rule["tools"] and rule["check"](args):
            return rule["message"]
    return None

# Gate 3: User approval - wait for confirmation after rule match
def ask_user(tool_name: str, args: dict, reason: str) -> str:
    print(f"\n\033[33m[permission] {reason}\033[0m")
    print(f"   Tool: {tool_name}({args})")
    choice = input("   Allow? [y/N] ").strip().lower()
    return "allow" if choice in ("y", "yes") else "deny"

# Pipeline: all three gates chained
def check_permission(block) -> bool:
    if block.name == "bash":
        reason = check_deny_list(block.input.get("command", ""))
        if reason:
            print(f"\n\033[31m[blocked] {reason}\033[0m")
            return False
    reason = check_rules(block.name, block.input)
    if reason:
        decision = ask_user(block.name, block.input, reason)
        if decision == "deny":
            return False
    return True

# -- Agent loop: same as s02, with check_permission() inserted --

def agent_loop(messages: list):
    while True:
        response = client.messages.create(
            model=MODEL, system=SYSTEM, messages=messages,
            tools=TOOLS, max_tokens=8000,
        )
        messages.append({"role": "assistant", "content": response.content})

        tool_calls = [
            block for block in response.content if block.type == "tool_use"
        ]
        if not tool_calls:
            return

        results = []
        for block in tool_calls:
            print(f"\033[36m> {block.name}\033[0m")

            # s03 change: run through permission pipeline before executing
            if not check_permission(block):
                results.append({"type": "tool_result", "tool_use_id": block.id,
                                "content": "Permission denied."})
                continue

            handler = TOOL_HANDLERS.get(block.name)
            output = handler(**block.input) if handler else f"Unknown: {block.name}"
            print(str(output)[:200])
            results.append({"type": "tool_result", "tool_use_id": block.id, "content": output})

        messages.append({"role": "user", "content": results})

if __name__ == "__main__":
    print("s03: Permission")
    print("Enter a question, press Enter to send. Type q to quit.\n")

    history = []
    while True:
        try:
            # \001/\002 tell Readline the ANSI escapes have zero display width.
            query = input("\001\033[36m\002s03 >> \001\033[0m\002")
        except (EOFError, KeyboardInterrupt):
            break
        if query.strip().lower() in ("q", "exit", ""):
            break
        history.append({"role": "user", "content": query})
        agent_loop(history)
        for block in history[-1]["content"]:
            if getattr(block, "type", None) == "text":
                print(block.text)
        print()
```

## Hooks

> **Source:** [Hooks](https://github.com/shareAI-lab/learn-claude-code/tree/HEAD/s04_hooks) · [Learn Claude Code](https://github.com/shareAI-lab/learn-claude-code), MIT

s01 → s02 → s03 → `s04` → [s05](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s05_todo_write) → s06 → ... → s16 → s17

> *"Hang on the loop, don't write into it"* — Hooks inject extension logic before and after tool execution.
>
> **Harness Layer**: Hooks — Extension points that don't invade the loop.

---

### The Problem

The s03 Agent has permission checks. But every new check, "log every bash call", "auto git add after writes", requires modifying the `agent_loop` function.

The loop quickly becomes this:

```python
def agent_loop(messages):
    while True:
        # ... LLM call ...
        for block in response.content:
            if block.type != "tool_use":
                continue
            log_to_file(block)          # added a line
            check_permission(block)     # added a line
            notify_slack(block)         # added another line
            output = execute(block)
            auto_git_add(block)         # yet another line
            # ... the loop is unrecognizable
```

What you want to extend is the Agent's behavior, but what you're modifying is the loop itself. The loop should be a stable core; extensions should hang on the outside.

---

### The Solution

![Hooks Overview](https://raw.githubusercontent.com/shareAI-lab/learn-claude-code/HEAD/s04_hooks/images/hooks-overview.en.svg)

The s03 loop and permission logic are fully preserved. The only change is moving `check_permission()` from inside the loop body onto a hook. The loop no longer directly calls any check function. Instead it calls `trigger_hooks("PreToolUse", block)`, and the registry decides what to run.

Four events, covering a complete agent cycle:

| Event | Trigger Timing | Typical Use |
|-------|---------------|-------------|
| UserPromptSubmit | After user input, before entering LLM | Input validation, context injection |
| PreToolUse | Before tool execution | Permission checks, logging |
| PostToolUse | After tool execution | Side effects (auto git add etc.), output checking |
| Stop | When the loop is about to exit | Cleanup, decide whether the loop continues |

Extensions are added via `register_hook()`. The loop only calls `trigger_hooks()`.

---

### How It Works

**Hook registry**: a dict mapping event names to callback lists.

```python
HOOKS = {
    "UserPromptSubmit": [],
    "PreToolUse": [],
    "PostToolUse": [],
    "Stop": [],
}

def register_hook(event: str, callback):
    HOOKS[event].append(callback)

def trigger_hooks(event: str, *args):
    for callback in HOOKS[event]:
        result = callback(*args)
        if result is not None:   # return value ≠ None → hook says "stop"
            return result
    return None
```

When `PreToolUse` returns non-None, the current tool execution is blocked. When `Stop` returns non-None, the loop continues. Return values from `UserPromptSubmit` and `PostToolUse` do not affect control flow.

**UserPromptSubmit** triggers after user input and before entering the LLM. The following hook records the current working directory:

```python
def context_inject_hook(query: str) -> str | None:
    """Inject current working directory info into every prompt."""
    print(f"\033[90m[HOOK] UserPromptSubmit: working in {WORKDIR}\033[0m")
    return None   # return None = no modification, let prompt through

register_hook("UserPromptSubmit", context_inject_hook)
```

In the main loop, triggered right after user input:

```python
query = input("s04 >> ")
trigger_hooks("UserPromptSubmit", query)   # ← before entering LLM
history.append({"role": "user", "content": query})
agent_loop(history)
```

**PreToolUse / PostToolUse**, hooks before and after tool execution. s03's permission check logic is now wrapped as a PreToolUse hook, plus a logging hook and a large-output reminder:

```python
# PreToolUse: permission check (s03 logic, moved from loop to hook)
def permission_hook(block):
    if block.name == "bash":
        for pattern in DENY_LIST:
            if pattern in block.input.get("command", ""):
                return "Permission denied by deny list"
    if block.name in ("read_file", "write_file", "edit_file"):
        path = block.input.get("path", "")
        if not (WORKDIR / path).resolve().is_relative_to(WORKDIR):
            choice = input("   Allow? [y/N] ").strip().lower()
            if choice not in ("y", "yes"):
                return "Permission denied by user"
    return None

# PreToolUse: logging
def log_hook(block):
    print(f"[HOOK] {block.name}(...)")

# PostToolUse: large output reminder
def large_output_hook(block, output):
    if len(str(output)) > 100000:
        print(f"[HOOK] ⚠ Large output from {block.name}")

register_hook("PreToolUse", permission_hook)
register_hook("PreToolUse", log_hook)
register_hook("PostToolUse", large_output_hook)
```

**Stop** triggers when the loop is about to exit. The following hook prints a cleanup summary:

```python
def summary_hook(messages: list) -> str | None:
    """Print a summary when the loop is about to stop."""
    tool_count = sum(1 for m in messages
                     for b in (m.get("content") if isinstance(m.get("content"), list) else [])
                     if isinstance(b, dict) and b.get("type") == "tool_result")
    print(f"\033[90m[HOOK] Stop: session used {tool_count} tool calls\033[0m")
    return None   # return None = allow stop, return string = force continuation

register_hook("Stop", summary_hook)
```

In agent_loop, triggered before exit:

```python
tool_calls = [
    block for block in response.content if block.type == "tool_use"
]
if not tool_calls:
    force = trigger_hooks("Stop", messages)   # ← before exiting
    if force:
        # hook returned a message → inject it and continue
        messages.append({"role": "user", "content": force})
        continue
    return
```

**Only one change in the loop**: s03 directly called `check_permission(block)`, s04 replaces it with `trigger_hooks("PreToolUse", block)`:

```python
for block in tool_calls:
    # s03: if not check_permission(block): ...
    # s04: hooks replace hardcoding
    blocked = trigger_hooks("PreToolUse", block)
    if blocked:
        results.append({"type": "tool_result", "tool_use_id": block.id,
                        "content": str(blocked)})
        continue

    handler = TOOL_HANDLERS.get(block.name)
    output = handler(**block.input) if handler else f"Unknown: {block.name}"

    trigger_hooks("PostToolUse", block, output)

    results.append({"type": "tool_result", "tool_use_id": block.id,
                    "content": output})
```

Four hooks cover the critical nodes of the agent cycle: input → before execution → after execution → exit. The loop only calls trigger_hooks(); all logic lives in hook callbacks.

---

### Changes from s03

| Component | Before (s03) | After (s04) |
|-----------|-------------|-------------|
| Extension method | check_permission() hardcoded in the loop | HOOKS registry + trigger_hooks() |
| New functions | — | register_hook, trigger_hooks |
| Hook callbacks | — | context_inject_hook, permission_hook, log_hook, large_output_hook, summary_hook |
| Loop | Directly calls check_permission() | Calls trigger_hooks("PreToolUse", ...) |
| Exit control | None | trigger_hooks("Stop", ...) can prevent exit |
| Input interception | None | trigger_hooks("UserPromptSubmit", ...) can inject context |

---

### Try It

```sh
cd learn-claude-code
python s04_hooks/code.py
```

Try these prompts:

1. `Read the file README.md` (should pass directly, observe hook logs)
2. `Create a file called test.txt` (after creation, observe if PostToolUse fires)
3. `Delete all temporary files in /tmp` (bash + rm triggers permission hook)

What to watch for: Before each tool execution, does the `[HOOK]` log appear? When permission is denied, was it intercepted by a hook or hardcoded in the loop?

---

### What's Next

The Agent can now safely execute operations. But does it ever stop to think "what should I do first, and what next?" Given a complex task, does it jump straight in, or plan first?

→ s05 TodoWrite: Give the Agent a planning tool. Make a list first, then execute.

<!-- translation-sync: zh@v1, en@v1, ja@v1 -->

### Full code

From [`s04_hooks/code.py`](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s04_hooks/code.py):

```python
#!/usr/bin/env python3
"""
s04_hooks.py - Hooks

Hooks run callbacks at fixed points in the agent loop:

    User prompt
         |
         v
    UserPromptSubmit
         |
         v
    +----------+      +-------+      +------------+      +-------+
    | messages | ---> |  LLM  | ---> | PreToolUse | ---> | Tool  |
    +----------+      +---+---+      | permission |      +---+---+
         ^                | stop     | log        |          |
         |                v          +------------+          v
         |            Stop hook                         PostToolUse
         |                                               |
         +---------------- tool_result ------------------+
"""

import os
import re
import subprocess
from pathlib import Path

try:
    import readline
    readline.parse_and_bind('set bind-tty-special-chars off')
    readline.parse_and_bind('set input-meta on')
    readline.parse_and_bind('set output-meta on')
    readline.parse_and_bind('set convert-meta off')
except ImportError:
    pass

from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv(override=True)
if os.getenv("ANTHROPIC_BASE_URL"):
    os.environ.pop("ANTHROPIC_AUTH_TOKEN", None)

WORKDIR = Path.cwd()
client = Anthropic(base_url=os.getenv("ANTHROPIC_BASE_URL"))
MODEL = os.environ["MODEL_ID"]

ENVIRONMENT_PROMPT = (
    "Windows: the bash tool runs through cmd.exe; use cmd.exe syntax, not Unix "
    "Bash or PowerShell syntax, and prefer dedicated file tools for file operations"
    if os.name == "nt"
    else "Unix-like: the bash tool runs the system shell"
)
SYSTEM = (
    f"You are a coding agent at {WORKDIR}. Environment: {ENVIRONMENT_PROMPT}. "
    "Use tools to solve tasks. Act, don't explain."
)

# -- From s02-s03: tool implementations --

def run_bash(command: str) -> str:
    try:
        r = subprocess.run(command, shell=True, cwd=WORKDIR,
                           capture_output=True, text=True, errors="replace", timeout=120)
        out = (r.stdout + r.stderr).strip()
        return out[:50000] if out else "(no output)"
    except subprocess.TimeoutExpired:
        return "Error: Timeout (120s)"

def run_read(path: str, limit: int | None = None) -> str:
    try:
        file_path = (WORKDIR / path).resolve()
        lines = file_path.read_text(encoding="utf-8").splitlines()
        if limit and limit < len(lines):
            lines = lines[:limit] + [f"... ({len(lines) - limit} more lines)"]
        return "\n".join(lines)
    except Exception as e:
        return f"Error: {e}"

def run_write(path: str, content: str) -> str:
    try:
        file_path = (WORKDIR / path).resolve()
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(content, encoding="utf-8")
        return f"Wrote {len(content)} bytes to {path}"
    except Exception as e:
        return f"Error: {e}"

def run_edit(path: str, old_text: str, new_text: str) -> str:
    try:
        file_path = (WORKDIR / path).resolve()
        text = file_path.read_text(encoding="utf-8")
        if old_text not in text:
            return f"Error: text not found in {path}"
        file_path.write_text(text.replace(old_text, new_text, 1), encoding="utf-8")
        return f"Edited {path}"
    except Exception as e:
        return f"Error: {e}"

def run_glob(pattern: str) -> str:
    import glob as g
    try:
        matches = sorted({
            match for match in g.glob(
                pattern, root_dir=WORKDIR, recursive=True)
            if (WORKDIR / match).resolve().is_relative_to(WORKDIR)
        })
        shown = matches[:200]
        if len(matches) > 200:
            shown.append("... (more matches omitted; narrow the pattern)")
        return "\n".join(shown) if shown else "(no matches)"
    except Exception as e:
        return f"Error: {e}"

TOOLS = [
    {"name": "bash", "description": "Run a shell command.",
     "input_schema": {"type": "object", "properties": {"command": {"type": "string"}}, "required": ["command"]}},
    {"name": "read_file", "description": "Read file contents.",
     "input_schema": {"type": "object", "properties": {"path": {"type": "string"}, "limit": {"type": "integer"}}, "required": ["path"]}},
    {"name": "write_file", "description": "Write content to a file.",
     "input_schema": {"type": "object", "properties": {"path": {"type": "string"}, "content": {"type": "string"}}, "required": ["path", "content"]}},
    {"name": "edit_file", "description": "Replace exact text in a file once.",
     "input_schema": {"type": "object", "properties": {"path": {"type": "string"}, "old_text": {"type": "string"}, "new_text": {"type": "string"}}, "required": ["path", "old_text", "new_text"]}},
    {"name": "glob", "description": "Find files matching a glob pattern; ** matches recursively.",
     "input_schema": {"type": "object", "properties": {"pattern": {"type": "string"}}, "required": ["pattern"]}},
]

TOOL_HANDLERS = {
    "bash": run_bash, "read_file": run_read, "write_file": run_write,
    "edit_file": run_edit, "glob": run_glob,
}

# -- New in s04: hook system (s03 permission logic now uses hooks) --

HOOKS = {"UserPromptSubmit": [], "PreToolUse": [], "PostToolUse": [], "Stop": []}

def register_hook(event: str, callback):
    HOOKS[event].append(callback)

def trigger_hooks(event: str, *args):
    for callback in HOOKS[event]:
        result = callback(*args)
        if result is not None:  # A hook result blocks this tool call.
            return result
    return None

# s03 permission check logic, now wrapped as a hook
DENY_LIST = ["rm -rf /", "sudo", "shutdown", "reboot", "mkfs", "dd if="]
DESTRUCTIVE_COMMAND_WORD = re.compile(
    r"(?i)(?:^|[;&|()\n])\s*(?:rm|del)(?=\s|$|[;&|()])"
)
DESTRUCTIVE = ["rm ", "> /etc/", "chmod 777"]

def contains_destructive_command(command: str) -> bool:
    return bool(DESTRUCTIVE_COMMAND_WORD.search(command))

def permission_hook(block):
    """PreToolUse: s03 check_permission() logic moved here."""
    if block.name == "bash":
        command = block.input.get("command", "")
        for pattern in DENY_LIST:
            if pattern in command:
                print(f"\n\033[31m[blocked] '{pattern}'\033[0m")
                return "Permission denied by deny list"
        if contains_destructive_command(command) or any(
            kw in command for kw in DESTRUCTIVE
        ):
            print(f"\n\033[33m[permission] Potentially destructive command\033[0m")
            print(f"   Tool: {block.name}({block.input})")
            choice = input("   Allow? [y/N] ").strip().lower()
            if choice not in ("y", "yes"):
                return "Permission denied by user"
    if block.name in ("read_file", "write_file", "edit_file"):
        path = block.input.get("path", "")
        if not (WORKDIR / path).resolve().is_relative_to(WORKDIR):
            print(f"\n\033[33m[permission] Access outside workspace\033[0m")
            print(f"   Tool: {block.name}({block.input})")
            choice = input("   Allow? [y/N] ").strip().lower()
            if choice not in ("y", "yes"):
                return "Permission denied by user"
    return None

def log_hook(block):
    """PreToolUse: log every tool call."""
    args_preview = str(list(block.input.values())[:2])[:60]
    print(f"\033[90m[HOOK] {block.name}({args_preview})\033[0m")
    return None

def large_output_hook(block, output):
    """PostToolUse: warn on large output."""
    if len(str(output)) > 100000:
        print(f"\033[33m[HOOK] Large output from {block.name}: {len(str(output))} chars\033[0m")
    return None

# UserPromptSubmit hook: log user input before it reaches the LLM
def context_inject_hook(query: str):
    print(f"\033[90m[HOOK] UserPromptSubmit: working in {WORKDIR}\033[0m")
    return None

# Stop hook: print summary when loop is about to exit
def summary_hook(messages: list):
    tool_count = sum(1 for m in messages
                     for b in (m.get("content") if isinstance(m.get("content"), list) else [])
                     if isinstance(b, dict) and b.get("type") == "tool_result")
    print(f"\033[90m[HOOK] Stop: session used {tool_count} tool calls\033[0m")
    return None

register_hook("UserPromptSubmit", context_inject_hook)
register_hook("PreToolUse", permission_hook)
register_hook("PreToolUse", log_hook)
register_hook("PostToolUse", large_output_hook)
register_hook("Stop", summary_hook)

# -- Agent loop: same structure as s03, but no hard-coded check --
# s03: if not check_permission(block): ...
# s04: if trigger_hooks("PreToolUse", block): ...

def agent_loop(messages: list):
    while True:
        response = client.messages.create(
            model=MODEL, system=SYSTEM, messages=messages,
            tools=TOOLS, max_tokens=8000,
        )
        messages.append({"role": "assistant", "content": response.content})

        tool_calls = [
            block for block in response.content if block.type == "tool_use"
        ]
        if not tool_calls:
            force = trigger_hooks("Stop", messages)
            if force:
                messages.append({"role": "user", "content": force})
                continue
            return

        results = []
        for block in tool_calls:
            # s04 change: hook replaces hard-coded check_permission()
            blocked = trigger_hooks("PreToolUse", block)
            if blocked:
                results.append({"type": "tool_result", "tool_use_id": block.id,
                                "content": str(blocked)})
                continue

            handler = TOOL_HANDLERS.get(block.name)
            output = handler(**block.input) if handler else f"Unknown: {block.name}"

            trigger_hooks("PostToolUse", block, output)  # s04: post hook

            results.append({"type": "tool_result", "tool_use_id": block.id, "content": output})

        messages.append({"role": "user", "content": results})

if __name__ == "__main__":
    print("s04: Hooks - extension logic on hooks, loop stays clean")
    print("Enter a question, press Enter to send. Type q to quit.\n")

    history = []
    while True:
        try:
            # \001/\002 tell Readline the ANSI escapes have zero display width.
            query = input("\001\033[36m\002s04 >> \001\033[0m\002")
        except (EOFError, KeyboardInterrupt):
            break
        if query.strip().lower() in ("q", "exit", ""):
            break
        trigger_hooks("UserPromptSubmit", query)
        history.append({"role": "user", "content": query})
        agent_loop(history)
        for block in history[-1]["content"]:
            if getattr(block, "type", None) == "text":
                print(block.text)
        print()
```

## Agentic protocols: MCP, A2A and NLWeb

> **Source:** [Agentic protocols: MCP, A2A and NLWeb](https://github.com/microsoft/ai-agents-for-beginners/tree/HEAD/11-agentic-protocols) · [AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners), MIT

As the use of AI agents grows, so does the need for protocols that ensure standardization, security, and support open innovation. In this lesson, we will cover 3 protocols looking to meet this need - Model Context Protocol (MCP), Agent to Agent (A2A) and Natural Language Web (NLWeb).

### Introduction

In this lesson, we will cover:

• How **MCP** allows AI Agents to access external tools and data to complete user tasks.

•  How **A2A** enables communication and collaboration between different AI agents.

• How **NLWeb** brings natural language interfaces to any website enabling AI Agents to discover and interact with the content.

### Learning Goals

• **Identify** the core purpose and benefits of MCP, A2A, and NLWeb in the context of AI agents.

• **Explain** how each protocol facilitates communication and interaction between LLMs, tools, and other agents.

• **Recognize** the distinct roles each protocol plays in building complex agentic systems.

### Model Context Protocol

The **Model Context Protocol (MCP)** is an open standard that provides standardized way for applications to provide context and tools to LLMs. This enables a "universal adaptor" to different data sources and tools that AI Agents can connect to in a consistent way.

Let’s look at the components of MCP, the benefits compared to direct API usage, and an example of how AI agents might use an MCP server.

#### MCP Core Components

MCP operates on a **client-server architecture** and the core components are:

• **Hosts** are LLM applications (for example a code editor like VSCode) that start the connections to an MCP Server.

• **Clients** are components within the host application that maintain one-to-one connections with servers.

• **Servers** are lightweight programs that expose specific capabilities.

Included in the protocol are three core primitives which are the capabilities of an MCP Server:

• **Tools**: These are discrete actions or functions an AI agent can call to perform an action. For example, a weather service might expose a "get weather" tool, or an e-commerce server might expose a "purchase product" tool. MCP servers advertise each tool's name, description, and input/output schema in their capabilities listing.

• **Resources**: These are read-only data items or documents that an MCP server can provide, and clients can retrieve them on demand. Examples include file contents, database records, or log files. Resources can be text (like code or JSON) or binary (like images or PDFs).

• **Prompts**: These are predefined templates that provide suggested prompts, allowing for more complex workflows.

#### Benefits of MCP

MCP offers significant advantages for AI Agents:

• **Dynamic Tool Discovery**: Agents can dynamically receive a list of available tools from a server along with descriptions of what they do. This contrasts with traditional APIs, which often require static coding for integrations, meaning any API change necessitates code updates. MCP offers an "integrate once" approach, leading to greater adaptability.

• **Interoperability Across LLMs**: MCP works across different LLMs, providing flexibility to switch core models to evaluate for better performance.

• **Standardized Security**: MCP includes a standard authentication method, improving scalability when adding access to additional MCP servers. This is simpler than managing different keys and authentication types for various traditional APIs.

#### MCP Example

![MCP Diagram](https://raw.githubusercontent.com/microsoft/ai-agents-for-beginners/HEAD/11-agentic-protocols/images/mcp-diagram.png)

Imagine a user wants to book a flight using an AI assistant powered by MCP.

1. **Connection**: The AI assistant (the MCP client) connects to an MCP server provided by an airline.

2. **Tool Discovery**: The client asks the airline's MCP server, "What tools do you have available?" The server responds with tools like "search flights" and "book flights".

3. **Tool Invocation**: You then ask the AI assistant, "Please search for a flight from Portland to Honolulu." The AI assistant, using its LLM, identifies that it needs to call the "search flights" tool and passes the relevant parameters (origin, destination) to the MCP server.

4. **Execution and Response**: The MCP server, acting as a wrapper, makes the actual call to the airline's internal booking API. It then receives the flight information (e.g., JSON data) and sends it back to the AI assistant.

5. **Further Interaction**: The AI assistant presents the flight options. Once you select a flight, the assistant might invoke the "book flight" tool on the same MCP server, completing the booking.

### Agent-to-Agent Protocol (A2A)

While MCP focuses on connecting LLMs to tools, the **Agent-to-Agent (A2A) protocol** takes it a step further by enabling communication and collaboration between different AI agents.  A2A connects AI agents across different organizations, environments and tech stacks to complete a shared task.

We’ll examine the components and benefits of A2A, along with an example of how it could be applied in our travel application.

#### A2A Core Components

A2A focuses on enabling communication between agents and having them work together to complete a subtask of user. Each component of the protocol contributes to this:

##### Agent Card

Similar to how an MCP server shares a list of tools, an Agent Card has:
- The Name of the Agent .
- A **description of the general tasks** it completes.
- A **list of specific skills** with descriptions to help other agents (or even human users) understand when and why they would want to call that agent.
- The **current Endpoint URL** of the agent
- The **version** and **capabilities** of the agent such as streaming responses and push notifications.

##### Agent Executor

The Agent Executor is responsible for **passing the context of the user chat to the remote agent**, the remote agent needs this to understand the task that needs to be completed. In an A2A server, an agent uses its own Large Language Model (LLM) to parse incoming requests and execute tasks using its own internal tools.

##### Artifact

Once a remote agent has completed the requested task, its work product is created as an artifact.  An artifact **contains the result of the agent's work**, a **description of what was completed**, and the **text context** that is sent through the protocol. After the artifact is sent, the connection with the remote agent is closed until it is needed again.

##### Event Queue

This component is used for **handling updates and passing messages**. It is particularly important in production for agentic systems to prevent the connection between agents from being closed before a task is completed, especially when task completion times can take a longer time.

#### Benefits of A2A

• **Enhanced Collaboration**: It enables agents from different vendors and platforms to interact, share context, and work together, facilitating seamless automation across traditionally disconnected systems.

• **Model Selection Flexibility**: Each A2A agent can decide which LLM it uses to service its requests, allowing for optimized or fine-tuned models per agent, unlike a single LLM connection in some MCP scenarios.

• **Built-in Authentication**: Authentication is integrated directly into the A2A protocol, providing a robust security framework for agent interactions.

#### A2A Example

![A2A Diagram](https://raw.githubusercontent.com/microsoft/ai-agents-for-beginners/HEAD/11-agentic-protocols/images/A2A-Diagram.png)

Let's expand on our travel booking scenario, but this time using A2A.

1. **User Request to Multi-Agent**: A user interacts with a "Travel Agent" A2A client/agent, perhaps by saying, "Please book an entire trip to Honolulu for next week, including flights, a hotel, and a rental car".

2. **Orchestration by Travel Agent**: The Travel Agent receives this complex request. It uses its LLM to reason about the task and determine that it needs to interact with other specialized agents.

3. **Inter-Agent Communication**: The Travel Agent then uses the A2A protocol to connect to downstream agents, such as an "Airline Agent," a "Hotel Agent," and a "Car Rental Agent" that are created by different companies.

4. **Delegated Task Execution**: The Travel Agent sends specific tasks to these specialized agents (e.g., "Find flights to Honolulu," "Book a hotel," "Rent a car"). Each of these specialized agents, running their own LLMs and utilizing their own tools (which could be MCP servers themselves), performs its specific part of the booking.

5. **Consolidated Response**: Once all downstream agents complete their tasks, the Travel Agent compiles the results (flight details, hotel confirmation, car rental booking) and sends a comprehensive, chat-style response back to the user.

### Natural Language Web (NLWeb)

Websites have long been the primary way for users to access information and data across the internet.

Let us look at the different components of NLWeb, the benefits of NLWeb and an example how our NLWeb works by looking at our travel application.

#### Components of NLWeb

- **NLWeb Application (Core Service Code)**: The system that processes natural language questions. It connects the different parts of the platform to create responses. You can think of it as the **engine that powers the natural language features** of a website.

- **NLWeb Protocol**: This is a **basic set of rules for natural language interaction** with a website. It sends back responses in JSON format (often using Schema.org). Its purpose is to create a simple foundation for the “AI Web,” in the same way that HTML made it possible to share documents online.

- **MCP Server (Model Context Protocol Endpoint)**: Each NLWeb setup also works as an **MCP server**. This means it can **share tools (like an “ask” method) and data** with other AI systems. In practice, this makes the website’s content and abilities usable by AI agents, allowing the site to become part of the wider “agent ecosystem.”

- **Embedding Models**: These models are used to **convert website content into numerical representations called vectors** (embeddings). These vectors capture meaning in a way computers can compare and search. They are stored in a special database, and users can choose which embedding model they want to use.

- **Vector Database (Retrieval Mechanism)**: This database **stores the embeddings of the website content**. When someone asks a question, NLWeb checks the vector database to quickly find the most relevant information. It gives a fast list of possible answers, ranked by similarity. NLWeb works with different vector storage systems such as Qdrant, Snowflake, Milvus, Azure AI Search, and Elasticsearch.

#### NLWeb by Example

![NLWeb](https://raw.githubusercontent.com/microsoft/ai-agents-for-beginners/HEAD/11-agentic-protocols/images/nlweb-diagram.png)

Consider our travel booking website again, but this time, it's powered by NLWeb.

1. **Data Ingestion**: The travel website's existing product catalogs (e.g., flight listings, hotel descriptions, tour packages) are formatted using Schema.org or loaded via RSS feeds. NLWeb's tools ingest this structured data, create embeddings, and store them in a local or remote vector database.

2. **Natural Language Query (Human)**: A user visits the website and, instead of navigating menus, types into a chat interface: "Find me a family-friendly hotel in Honolulu with a pool for next week".

3. **NLWeb Processing**: The NLWeb application receives this query. It sends the query to an LLM for understanding and simultaneously searches its vector database for relevant hotel listings.

4. **Accurate Results**: The LLM helps to interpret the search results from the database, identify the best matches based on "family-friendly," "pool," and "Honolulu" criteria, and then formats a natural language response. Crucially, the response refers to actual hotels from the website's catalog, avoiding made-up information.

5. **AI Agent Interaction**: Because NLWeb serves as an MCP server, an external AI travel agent could also connect to this website's NLWeb instance. The AI agent could then use the `ask` MCP method to query the website directly: `ask("Are there any vegan-friendly restaurants in the Honolulu area recommended by the hotel?")`. The NLWeb instance would process this, leveraging its database of restaurant information (if loaded), and return a structured JSON response.

### Resources

- [MCP for Beginners](https://aka.ms/mcp-for-beginners)
- [MCP Documentation](https://learn.microsoft.com/python/api/overview/azure/ai-projects-readme)
- [NLWeb Repo](https://github.com/nlweb-ai/NLWeb)
- [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/overview/?wt.mc_id=youtube_26688_organicsocial_reactor&pivots=programming-language-python)
