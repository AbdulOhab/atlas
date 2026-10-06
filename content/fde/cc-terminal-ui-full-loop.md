---
title: "Terminal UI and the Full Loop"
order: 14
summary: "Putting it together in the terminal: background tasks, scheduling, the integrated harness, and building terminal UIs."
category: "Building Claude Code From Scratch"
level: Intermediate
---

# Terminal UI and the Full Loop

The last pieces turn the parts into a usable tool: background work, scheduled jobs, one harness that runs everything, and a terminal interface (Claude Code's own UI is built with Ink).

**Course milestone:** Building Claude Code From Scratch

## Background tasks

> **Source:** [Background tasks](https://github.com/shareAI-lab/learn-claude-code/tree/HEAD/s11_background_tasks) · [Learn Claude Code](https://github.com/shareAI-lab/learn-claude-code), MIT

s01 → ... → s09 → s10 → `s11` → [s12](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s12_cron_scheduler) → s13 → ... → s16 → s17

> *"Slow operations go to the background, the Agent Loop continues"* — Background threads run commands, and later turns collect completed results.
>
> **Harness Layer**: Background — Async execution, doesn't block the main loop.

---

### The Problem

Reading a file or running `git status` usually returns quickly, so synchronous execution causes little noticeable delay. Installing dependencies, running a full test suite, or building a project can take several minutes. Until the command returns, the Harness cannot process the next tool call in the current response or start the next model turn.

If later work does not depend on that command, there is no need to block it. For example, after starting a full test suite, the Agent could inspect documentation or organize other files while the tests run.

S11 addresses this by running slow Bash commands in the background, allowing the Agent Loop to continue and collect completed results on a later turn.

---

### The Solution

![Background Tasks Overview](https://raw.githubusercontent.com/shareAI-lab/learn-claude-code/HEAD/s11_background_tasks/images/background-tasks-overview.en.svg)

This chapter sends slow operations to background threads. The current tool call first returns a placeholder `tool_result`, allowing the Agent Loop to continue. At the start of a later turn, completed results are collected and added to the conversation as notifications.

Sync vs Background:

| | Sync (s04) | Background (s11) |
|---|---|---|
| Slow operations | Current tool call blocks | Background thread executes |
| Agent Loop | Waits for the command to return | Continues after the placeholder result |
| Result | Returned after the command finishes | Returns `bg_id` first; collects the result on a later turn |
| Decision criteria | — | bash `run_in_background` parameter |

---

### How It Works

#### should_run_background: Explicit Request

The model requests background execution through the bash tool's `run_in_background` parameter. Only bash calls with the parameter explicitly set to `true` enter this path. Other calls still run synchronously.

```python
def should_run_background(tool_name: str, tool_input: dict) -> bool:
    return (
        tool_name == "bash"
        and tool_input.get("run_in_background") is True
    )
```

The Harness no longer guesses from keywords such as `install`, `build`, or `test`. The tool call chooses the execution mode explicitly.

#### BackgroundManager: Background Execution and Lifecycle

`BackgroundManager` owns task state and the completion queue. `start()` registers a task, starts a daemon thread, and returns `bg_id` immediately:

```python
class BackgroundManager:
    def __init__(self):
        self.tasks = {}
        self.results = {}
        self._ready = []
        self._lock = threading.Lock()

    def start(self, block) -> str:
        # Register task, then run _run() in a daemon thread.
        ...

    def _run(self, task_id: str, command: str):
        output, exit_code = _run_bash_process(command)
        status = "completed" if exit_code == 0 else "failed"
        with self._lock:
            self.tasks[task_id]["status"] = status
            self.results[task_id] = _format_bash_result(output, exit_code)
            self._ready.append(task_id)
```

A non-zero exit code or worker exception becomes `failed`. The shell starts in its own process group. When the command finishes, times out, or the Agent exits through the normal or `SIGTERM` path, the runtime stops that original group. This is lifecycle cleanup, not a sandbox: a process that creates another session can leave the group.

#### collect_background_results: Notification Collection

At the start of a later turn, `collect()` removes completed results from the queue and formats them as `<task_notification>` messages:

```python
def collect_background_results() -> list[str]:
    return BACKGROUND.collect()
```

Notifications don't reuse the original `tool_use_id`. The original tool call was already answered with a placeholder `tool_result`; when the completed result is collected, it is added as an independent event in `task_notification` format. One `tool_use` still gets exactly one `tool_result`.

#### Loop Integration

Before each LLM call, the Agent Loop collects completed background results. `execute_tool()` still runs `PreToolUse` on the main thread before choosing synchronous or background execution:

```python
while True:
    inject_background_results(messages)
    response = client.messages.create(...)

def execute_tool(block) -> str:
    blocked = trigger_hooks("PreToolUse", block)
    if blocked is not None:
        return str(blocked)
    if should_run_background(block.name, block.input):
        task_id = start_background_task(block)
        output = f"[Background task {task_id} started]"
    else:
        output = call_tool(block)
    trigger_hooks("PostToolUse", block, output)
    return output
```

Slow operations first return a placeholder tool_result with `bg_id`. A completed task does not wake the Agent by itself; `inject_background_results()` collects it the next time the Agent Loop runs.

#### Putting It Together

```
Turn 1:
  LLM → bash "npm install" (run_in_background=true)
  → start_background_task → bg_0001
  → tool_result: "[Background task bg_0001 started]..."
  → LLM: "OK, I'll check later. Let me also read the config."

Turn 2:
  LLM → read_file "package.json" (fast, sync)
  → tool_result: file content

Turn 3:
  → collect bg_0001 as <task_notification>
  → LLM sees: config file + install notification in one message
```

While npm install ran in the background, the Agent Loop continued with read_file.

---

### What s11 Adds

| Component | s04 Kernel | s11 |
|-----------|-------------|-------------|
| Execution model | All synchronous | Slow ops to background thread + notification injection |
| bash schema | `command` | `command` + `run_in_background` |
| New functions | — | `should_run_background`, `start_background_task`, `collect_background_results`, `inject_background_results` |
| New types | — | `BackgroundManager` |
| Notification format | — | `<task_notification>` (doesn't reuse tool_use_id) |
| Loop behavior | Tools execute synchronously | Explicit background execution, completed results collected on later turns |
| Tools | 5 | 5 (one parameter added to the bash schema) |

---

### Try It

```sh
cd learn-claude-code
python s11_background_tasks/code.py
```

Try these prompts:

1. `Run pip list in the background and find all Python files in this directory`
2. `Run npm install (use run_in_background) and while waiting, read package.json`
3. `Run a short sleep in the background, then list all Markdown files`

What to observe: After explicitly setting `run_in_background`, is the command dispatched to the background? Is a `bg_id` returned? Are completed results collected in `<task_notification>` format on a later turn?

---

### What's Next

Background tasks solved "slow operations don't block." But what if you want to do something on a schedule? Like "run tests every morning at 9am" or "check server status every 5 minutes."

s12 Cron Scheduler → Give the agent an alarm clock.

<!-- translation-sync: zh@v7, en@v7, ja@v7 -->

### Full code

The complete implementation is 542 lines: [`s11_background_tasks/code.py`](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s11_background_tasks/code.py).

## Cron scheduler

> **Source:** [Cron scheduler](https://github.com/shareAI-lab/learn-claude-code/tree/HEAD/s12_cron_scheduler) · [Learn Claude Code](https://github.com/shareAI-lab/learn-claude-code), MIT

s01 → ... → s10 → s11 → `s12` → [s13](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s13_agent_teams) → ... → s17

---

### The Problem

S11 changes how a command runs after it starts: a long Bash command can run in the background. It does not record when future work should start, and no component keeps checking the current time.

For requests such as "run tests every morning at 9am" or "check CI status every 30 minutes," the user would still have to submit the prompt again at each scheduled time. The Harness needs to store the schedule, put the corresponding prompt into a pending queue when it becomes due, and deliver it to the Agent Loop when the Agent is idle.

---

### The Solution

![Cron Scheduler Overview](https://raw.githubusercontent.com/shareAI-lab/learn-claude-code/HEAD/s12_cron_scheduler/images/cron-scheduler-overview.en.svg)

Suppose the Agent registers this job:

```text
cron:   0 9 * * *
prompt: run tests
```

At 09:00 local time, the scheduler thread matches the job and puts `[Scheduled] run tests` into `cron_queue`. The queue processor waits until the Agent is idle, then starts an Agent Loop turn. The model can then call Bash to run the tests.

The S12 code keeps the five base tools and Hooks from S04, then adds `schedule_cron`, `list_crons`, and `cancel_cron`. It does not include S11 background commands because this chapter delivers a prompt to start work, not the result of a command that is already running.

---

### How It Works

#### What CronJob stores

```python
@dataclass
class CronJob:
    id: str
    cron: str
    prompt: str
    recurring: bool
    durable: bool
    pending_delivery: bool = False
    last_fired: str | None = None
```

`cron` controls when the job becomes due. `prompt` is the task sent to the Agent. `pending_delivery` marks a due job that the model has not accepted, while `last_fired` prevents another enqueue in the same minute.

#### Five-field cron expressions

```text
minute hour day month weekday
   *     *    *    *      *    every minute
   0     9    *    *      *    every day at 09:00
  */5    *    *    *      *    every 5 minutes
   0     9    *    *     1-5   weekdays at 09:00
```

This chapter supports `*`, `*/N`, `N`, `N-M`, and `N,M,...`. Before saving a job, `schedule_job()` calls `validate_cron()` and rejects expressions with the wrong number of fields or out-of-range values.

#### Enqueue when due

The scheduler thread reads local time once per second. When an expression matches and the job has not fired in the current minute, `_enqueue_due_job()` saves `pending_delivery` and `last_fired` before adding the job to the in-memory queue:

```python
def poll_due_jobs(moment: datetime):
    minute_marker = moment.strftime("%Y-%m-%d %H:%M")
    with cron_lock:
        for job in list(scheduled_jobs.values()):
            if job.pending_delivery or job.last_fired == minute_marker:
                continue
            if cron_matches(job.cron, moment):
                _enqueue_due_job(job, minute_marker)
```

If persistence fails, `_enqueue_due_job()` restores the previous state and does not expose a memory-only delivery to the queue processor.

#### Deliver when the Agent is idle

`queue_processor_loop()` does not check the time. It checks the queue, and `agent_lock` prevents a scheduled turn from changing the session while a user turn is running:

```python
def queue_processor_loop(stop_event=RUNTIME_STOP):
    while not stop_event.wait(0.2):
        if not has_cron_queue() or not agent_lock.acquire(blocking=False):
            continue
        try:
            if has_cron_queue():
                run_agent_turn_locked()
        finally:
            agent_lock.release()
```

The Agent Loop takes due jobs from the queue and appends each one as a new user message:

```python
fired = consume_cron_queue()
for job in fired:
    messages.append({"role": "user", "content": f"[Scheduled] {job.prompt}"})
```

If the model call fails, those messages are removed from the current session and the jobs return to the queue. Once the model accepts the call, one-shot jobs are removed and recurring jobs clear `pending_delivery` until the next match.

#### Persistence boundary

| Mode | Stored in | After a process restart |
|---|---|---|
| `durable=True` | `.scheduled_tasks.json` | Loaded again |
| `durable=False` | Memory | Gone |

The code updates `.scheduled_tasks.json` through a temporary file and `os.replace()`. If the file is corrupt, startup reports the error instead of ignoring it.

Delivery is at least once. If the process exits after the model accepts a prompt but before the acknowledgement reaches disk, the same job may be delivered again after restart.

#### Runtime boundary

- The scheduler uses the Agent process's local time.
- The scheduler stops when the Agent process exits. `durable` preserves the job definition only.
- Restart loads saved jobs but does not replay schedule times missed while the process was down.
- Scheduled turns run in the queue processor thread. A tool call that needs interactive approval is denied instead of competing with the main terminal for input.
- Scheduler and queue processor threads start only in the CLI. Importing `code.py` starts no background thread.

Use crontab, a systemd timer, or an external scheduler when jobs must run while the Agent is closed.

---

### Try It

```sh
cd learn-claude-code
python s12_cron_scheduler/code.py
```

Enter these prompts in order:

1. `Schedule "run date" every 2 minutes and keep it after restart.`
2. `List all cron jobs.`
3. `Cancel the cron job you just created.`

You can inspect `.scheduled_tasks.json` and watch for the `[Scheduled] run date` message when the job becomes due. Keep the Agent process running while testing a minute-level schedule.

---

### What's Next

The scheduler can start an Agent Loop turn at a specified time, but one Agent still handles that turn. When a task requires parallel investigation, changes across multiple modules, and a combined result, the Harness also needs to assign work to multiple Agents and collect what each one produces.

s13 Agent Teams → A Lead assigns tasks, teammates run independently, and results return through inboxes.

<!-- translation-sync: zh@v9, en@v9, ja@v9 -->

### Full code

The complete implementation is 790 lines: [`s12_cron_scheduler/code.py`](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s12_cron_scheduler/code.py).

## The integrated harness

> **Source:** [The integrated harness](https://github.com/shareAI-lab/learn-claude-code/tree/HEAD/s15_integrated_harness) · [Learn Claude Code](https://github.com/shareAI-lab/learn-claude-code), MIT

s01 → ... → s13 → [s14](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s14_mcp_plugin) → `s15` → [s16](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s16_workflow_runtime) → s17

> *"Many mechanisms, one loop"* — tools, permissions, memory, tasks, teams, and plugins all hang off the same `while True`.
>
> **Harness layer**: Integration — put the mechanisms used by this example into one runnable system.

---

### Problem

The earlier chapters keep separate mechanisms in separate runnable examples. This chapter connects the mechanisms needed by the integrated runtime.

A long-running coding agent needs all of these at once:

- tool dispatch and permission boundaries
- hook extension points
- todo planning and task graphs
- skills, memory, and runtime system prompt assembly
- compaction and error recovery
- background tasks and cron scheduling
- teams, protocols, and IDLE task claiming
- task-bound worktrees
- MCP external tool integration

S15 does not introduce another isolated mechanism. It shows where the existing mechanisms enter the model loop and how their events return to the same conversation.

---

### Solution

![System Architecture](https://raw.githubusercontent.com/shareAI-lab/learn-claude-code/HEAD/s15_integrated_harness/images/system-architecture.en.svg)

S15 does not introduce a new mechanism. It connects the components from the earlier chapters in one integrated harness:

```text
user input
  → UserPromptSubmit hooks
  → cron/background notification injection
  → context compact
  → memory + skills + MCP state assemble the system prompt
  → LLM
  → has tool_use block?
      no  → Stop hooks → return
      yes → PreToolUse hooks + permission
          → TOOL_HANDLERS / MCP handlers / background dispatch
          → PostToolUse hooks
          → tool_result / task_notification back to messages
          → next round
```

The loop keeps the same structure: call the model, check whether the response contains a `tool_use` block, execute tools, and append results to `messages`. The presence of a `tool_use` block decides whether tool execution continues.

---

### Where Each Component Sits

| Position | Component | Role |
|----------|-----------|------|
| Around user input | `UserPromptSubmit` hooks | Log, inject, or audit user input |
| Before LLM | cron queue | Inject scheduled prompts into `messages` |
| Before LLM | background notifications | Inject completed background work as `<task_notification>` |
| Before LLM | compaction pipeline | Budget large outputs, trim history, compact old tool results, summarize when needed |
| Before LLM | memory / skills / MCP state | Assemble the system prompt so the model sees current capabilities and long-term context |
| LLM call | error recovery | Retry 429/529, escalate `max_tokens`, compact on prompt-too-long |
| Before tool execution | `PreToolUse` hooks + permission | Block dangerous commands, out-of-bounds writes, destructive MCP tools |
| Tool dispatch | `assemble_tool_pool` | Assemble built-in tools and dynamic MCP tools |
| During tool execution | background dispatch | Move explicitly marked bash work into a daemon thread and return a placeholder result |
| After tool execution | `PostToolUse` hooks | Large-output warnings, logs, post-processing |
| Back to loop | tool_result | One `tool_result` per `tool_use`, then the next model round |
| No tool_use this round / on stop | `Stop` hooks | Stats, cleanup, audit |

---

### What code.py Contains

#### Tools and Dispatch

The built-in tool pool contains 26 tools:

```text
bash, read_file, write_file, edit_file, glob
todo_write, task, load_skill, compact
create_task, update_task, list_tasks, get_task, claim_task, complete_task
schedule_cron, list_crons, cancel_cron
spawn_teammate, list_teammates, send_message
request_shutdown, request_plan, review_plan
create_worktree
connect_mcp
```

`assemble_tool_pool()` assembles these every round:

```text
BUILTIN_TOOLS + connected MCP tools
BUILTIN_HANDLERS + mcp__server__tool handlers
```

After `connect_mcp("docs")`, the next round exposes tools like `mcp__docs__search`.

#### Permissions and Hooks

Permission is not hardcoded into the tool execution line. It is a `PreToolUse` hook:

```python
blocked = trigger_hooks("PreToolUse", block)
if blocked:
    results.append(tool_result(block.id, blocked))
    continue
```

That means permission, logging, and audit logic all attach to the same hook point. Lead tools, one-shot subagent tools, and teammate tools all pass through `PreToolUse`; an allowed call then runs `PostToolUse` after its handler.

The policy does not trust an MCP server's own description as authorization. The host owns a small exact allowlist for known read-only calls; every other MCP tool asks the user. File tools are denied outside `WORKDIR`, and every bash command asks before execution. Only the foreground user turn may open an interactive approval prompt; asynchronous turns fail closed instead of competing with the main CLI for stdin.

#### Planning and Tasks

S15 keeps two planning layers:

- `todo_write`: lightweight plan for the current session, kept in memory
- task graph: cross-session, dependency-aware, claimable task files under `.tasks/task_*.json`

The first keeps a single agent from drifting. The second supports team coordination.

They share an intent, not an implementation: `todo_write` replaces one session checklist, while task records have stable IDs and individual lifecycle updates. The separate `task` tool below means "dispatch one isolated subagent"; it is not the Task System.

Task graph construction remains two-phase in the integrated host: the Lead creates all task nodes first, then calls `update_task` with the runtime IDs returned by `create_task`. Teammates receive only list, claim, and complete operations, so dependency structure is fixed by the Lead before work is distributed.

#### Subagents and Teams

S15 has two kinds of delegation:

- `task`: one-shot subagent. It uses an isolated `messages[]`, discards intermediate context, and returns only a final summary.
- `spawn_teammate`: persistent teammate thread. When given a ready `task_id`, the runtime claims it before the thread starts; without one, the teammate can wait in IDLE for later work. A teammate without an assignment cannot use file or Shell tools. It follows `WORK → result → IDLE` without a fixed tool-round cap; model or dispatch failures emit an `error`, and thread cleanup releases an unfinished assignment back to the task board. It drains its inbox before every model call, so direct messages and shutdown requests cannot wait behind an unbroken tool-use sequence. While idle it waits for `MessageBus` delivery first, then scans ready tasks only after the wait times out and atomically claims at most one.

After spawning a teammate, Lead ends the current turn instead of repeatedly querying its status inside the model loop. A team event in Lead's mailbox makes the runtime start the next turn.

One-shot subagents solve context isolation. Persistent teammates solve long-running parallel collaboration.

#### Memory, Skills, and Prompt

S15 reuses the s09 memory runtime directly. Before each model call, it reads the `.memory/MEMORY.md` catalog, selects records relevant to the current request, and passes their contents to `assemble_system_prompt(context)`. At the end of the turn, `extract_memories()` keeps information that can help in later sessions; when new records are stored, `consolidate_memories()` runs next.

The same system prompt also includes identity, tool guidance, the workspace, the skills catalog, and connected MCP servers. Skills contribute only their catalog; `load_skill(name)` loads full content on demand.

#### Compaction and Recovery

Before the LLM call, S15 runs the compaction pipeline:

```text
tool_result_budget → snip_compact → micro_compact → compact_history
```

`snip_compact` archives the complete history before trimming its middle. `micro_compact` runs only above the context limit: it saves older consumed results before replacing them with recovery paths, keeps the latest 3 complete, and stops near 80% of the limit. If a new unseen result is itself too large, S15 keeps a preview and the full-output path before considering history summarization.

The model call is wrapped with recovery:

- 429: exponential backoff retry
- 529: exponential backoff, optionally switch to fallback model after repeated failures
- `max_tokens`: raise max tokens, then request continuation
- prompt too long: reactive compact and retry

#### Background and Cron

When a bash call sets `run_in_background=true`, the main loop returns a placeholder without waiting for the command:

```text
should_run_background → start_background_task → placeholder tool_result
background done → task_notification → next round injects messages
```

Only explicitly marked bash calls enter the background path. A non-zero exit or worker exception produces a `failed` notification. Each shell runs in its own process group, which the runtime stops when the command or Agent process ends through the normal or `SIGTERM` path. A process that creates another session can leave that group.

The cron scheduler runs as a daemon thread and checks once per second. A durable one-shot job is persisted as `pending_delivery` before entering the queue and remains there until the model call containing its prompt succeeds; a failed call restores it to the queue, and a restart queues it again. Delivery is therefore at-least-once. The CLI watches `cron_queue`, Lead's inbox, and terminal background work; any of them can wake one automatic agent turn.

#### Worktree and MCP

The task-scoped worktree behavior inherited from s13 manages working directories:

- a pending, unowned task may remain in the main workspace or be bound by `create_worktree(name, task_id)` to a separate branch and directory
- creation prevalidates the task, name, path, branch, and Git registry; a failed Git command is reconciled against the registry and branch state, and any partial checkout remains unbound and preserved for manual recovery
- an idle teammate atomically claims one ready task; the assignment records both `task_id` and its effective `cwd`
- Lead can also pass a ready `task_id` to `spawn_teammate`; the thread starts only after the claim succeeds
- all teammate file tools use that `cwd`; only the owning teammate can complete the task, and the assignment stays selected until that model turn ends
- removal stays in the host-side `remove_worktree()` helper. The model cannot call it. The user or host first checks task ownership, assignment leases, background work, and Git state; destructive removal requires separate user confirmation

The worktree changes tool default directories. It separates working copies; it is not a sandbox, and process-group cleanup does not contain a process that starts another session. This is why deletion remains host-owned.

Claiming or releasing a Task changes the assignment version and invalidates an old plan approval. An ordinary `send_message` only delivers text; it changes neither the Task identity nor the plan state.

MCP owns external capability:

- `connect_mcp(name)` connects a mock server
- `assemble_tool_pool()` assembles MCP tools and rejects normalized name collisions
- tool names use `mcp__server__tool`

---

### Changes from s14

| Scope | s14 MCP | s15 Integrated Harness |
|-------|---------|-------------------------|
| built-in tools | 6 | 25 |
| external tools | connected MCP tools | the same dynamic MCP path and host policy |
| local mechanisms | S04 tools, hooks, permission, MCP | todo, subagent, skills, compaction, memory, task graph, background bash, cron, teams, and worktrees |
| event sources | user input and tool results | user input, tool results, cron prompts, background notifications, and team events |

---

### Try It

```sh
cd learn-claude-code
python s15_integrated_harness/code.py
```

Try:

1. `Inspect this repository and tell me which Python files matter most.`
2. `Search the connected documentation for agent loop guidance.`
3. `Refactor the authentication module and login page in parallel in separate worktrees. Show me each plan before editing.`
4. `Remind me about the meeting in 3 minutes.`
5. `Install the dependencies in the background while you read README.md.`

Watch for:

- whether each tool call passes through hooks/permission
- whether MCP tools appear on the next round after `connect_mcp`
- whether a bash call with `run_in_background=true` returns a background placeholder
- whether cron automatically reminds you when the time arrives
- whether teammates submit plans and pause before approval
- whether an idle teammate atomically claims only one ready task
- whether every teammate file tool switches to the claimed task's `cwd`
- whether completion keeps the task `cwd` through the rest of the turn and releases it at IDLE

---

### Next

[s16 Workflow Runtime](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s16_workflow_runtime) adds a `Workflow` tool to this host. A workflow keeps a fixed orchestration path in code and records progress so the same run can resume.

<!-- translation-sync: zh@v14, en@v14, ja@v14 -->

### Full code

The complete implementation is 3326 lines: [`s15_integrated_harness/code.py`](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s15_integrated_harness/code.py).

## Terminal UIs with Ink

> **Source:** [Terminal UIs with Ink](https://github.com/vadimdemedes/ink#readme) · [Ink](https://github.com/vadimdemedes/ink), MIT

[![](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg)](https://github.com/vshymanskyy/StandWithUkraine/blob/main/docs/README.md)

---

> React for CLIs. Build and test your CLI output using components.

[![Build Status](https://github.com/vadimdemedes/ink/workflows/test/badge.svg)](https://github.com/vadimdemedes/ink/actions)

Ink provides the same component-based UI building experience that React offers in the browser, but for command-line apps.
It uses [Yoga](https://github.com/facebook/yoga) to build Flexbox layouts in the terminal, so most CSS-like properties are available in Ink as well.
If you are already familiar with React, you already know Ink.

Since Ink is a React renderer, all features of React are supported.
Head over to the [React](https://reactjs.org) website for documentation on how to use it.
Only Ink's methods are documented in this readme.

**Fully AI-generated pull requests are not accepted. You can use AI, but should be verified and cleaned up by a human. Only Opus 4.6+ (high-effort) and Codex 5.4+ (extra high) are accepted models. Preferably created with Opus and verified by Codex.**

---

			<sup>
				<a href="https://opencollective.com/vadimdemedes">My open source work is supported by the community ❤️</a>
			</sup>

### Usage

```jsx
import React, {useState, useEffect} from 'react';
import {render, Text} from 'ink';

const Counter = () => {
	const [counter, setCounter] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setCounter(previousCounter => previousCounter + 1);
		}, 100);

		return () => {
			clearInterval(timer);
		};
	}, []);

	return <Text color="green">{counter} tests passed</Text>;
};

render(<Counter />);
```

### Getting Started

Use [create-ink-app](https://github.com/vadimdemedes/create-ink-app) to quickly scaffold a new Ink-based CLI.

```sh
npx create-ink-app my-ink-cli
```

Alternatively, create a TypeScript project:

```sh
npx create-ink-app --typescript my-ink-cli
```

<details><summary>Manual JavaScript setup</summary>

Ink requires the same Babel setup as you would do for regular React-based apps in the browser.

Set up Babel with a React preset to ensure all examples in this readme work as expected.
After [installing Babel](https://babeljs.io/docs/en/usage), install `@babel/preset-react` and insert the following configuration in `babel.config.json`:

```sh
npm install --save-dev @babel/preset-react
```

```json
{
	"presets": ["@babel/preset-react"]
}
```

Next, create a file `source.js`, where you'll type code that uses Ink:

```jsx
import React from 'react';
import {render, Text} from 'ink';

const Demo = () => <Text>Hello World</Text>;

render(<Demo />);
```

Then, transpile this file with Babel:

```sh
npx babel source.js -o cli.js
```

Now you can run `cli.js` with Node.js:

```sh
node cli
```

If you don't like transpiling files during development, you can use [import-jsx](https://github.com/vadimdemedes/import-jsx) or [@esbuild-kit/esm-loader](https://github.com/esbuild-kit/esm-loader) to `import` a JSX file and transpile it on the fly.

</details>

Ink uses [Yoga](https://github.com/facebook/yoga), a Flexbox layout engine, to build great user interfaces for your CLIs using familiar CSS-like properties you've used when building apps for the browser.
It's important to remember that each element is a Flexbox container.
Think of it as if every `` in the browser had `display: flex`.
See [`<Box>`](#box) built-in component below for documentation on how to use Flexbox layouts in Ink.
Note that all text must be wrapped in a [`<Text>`](#text) component.

### App Lifecycle

An Ink app is a Node.js process, so it stays alive only while there is active work in the event loop (timers, pending promises, [`useInput`](#useinputinputhandler-options) listening on `stdin`, etc.). If your component tree has no async work, the app will render once and exit immediately.

To exit the app, press **Ctrl+C** (enabled by default via [`exitOnCtrlC`](#exitonctrlc)), call [`exit()`](#exiterrororresult) from [`useApp`](#useapp) inside a component, or call [`unmount()`](#unmount) on the object returned by [`render()`](#rendertree-options).

Use [`waitUntilExit()`](#waituntilexit) to run code after the app is unmounted:

```jsx
const {waitUntilExit} = render(<MyApp />);

await waitUntilExit();

console.log('App exited');
```
