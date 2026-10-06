---
title: "The Tool System"
order: 10
summary: "Growing from one tool to a tool system: a todo tool that keeps the agent on track, and a task system for longer work."
category: "Building Claude Code From Scratch"
level: Intermediate
---

# The Tool System

With the protocol in place, tools become a registry the agent can draw on. Planning tools like a todo list and a task system are what keep a long job on track.

**Course milestone:** Building Claude Code From Scratch

## Todo write

> **Source:** [Todo write](https://github.com/shareAI-lab/learn-claude-code/tree/HEAD/s05_todo_write) · [Learn Claude Code](https://github.com/shareAI-lab/learn-claude-code), MIT

s01 → s02 → s03 → s04 → `s05` → [s06](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s06_subagent) → s07 → ... → s16 → s17

> *"An agent without a plan goes wherever the wind blows"* — List the steps first, then execute. Complex tasks are less likely to miss steps.
>
> **Harness Layer**: Planning — Let the Agent think before it acts.

---

### The Problem

Give the Agent a complex task: "Rename all Python files to snake_case, run tests, and fix failures."

The Agent starts working, renames 3 files, runs a test, finds 2 failures, starts fixing. While fixing, it forgets the original goal was "rename to snake_case", the test failures have consumed all its attention.

The longer the conversation, the worse it gets: tool results keep filling the context, diluting the system prompt's influence. A 10-step refactoring: after steps 1-3, the Agent starts improvising because steps 4-10 have been pushed out of its attention.

---

### The Solution

![Todo Overview](https://raw.githubusercontent.com/shareAI-lab/learn-claude-code/HEAD/s05_todo_write/images/todo-overview.en.svg)

S05 keeps the tool dispatch, permissions, and hooks from S04, then adds `todo_write` and a reminder counter. `todo_write` only updates planning state; the existing tools still perform the work.

The new tool uses the same `TOOL_HANDLERS[block.name]` dispatch path. After three consecutive tool-use rounds without `todo_write`, the harness adds a reminder to that round's tool results.

---

### How It Works

**TodoManager** owns the in-memory list, validates updates, and renders the state returned to the model. `run_todo_write` also prints that state in the terminal:

```python
class TodoManager:
    def __init__(self):
        self.items = []

    def update(self, todos: list | str) -> str:
        # Parse and validate before replacing the current list.
        validated = []
        ...
        self.items = validated
        return self.render()

    def render(self) -> str:
        # [ ] pending, [>] in progress, [x] completed
        ...

TODO = TodoManager()

def run_todo_write(todos: list | str) -> str:
    output = TODO.update(todos)
    print(output)
    return output
```

An update may contain at most 20 items, each item needs non-empty `content`, and only one item may be `in_progress`. The string input path accepts JSON or a Python list representation without using `eval`.

The tool definition joins the other 5 in the dispatch map:

```python
TOOLS = [
    {"name": "bash",       ...},
    {"name": "read_file",  ...},
    {"name": "write_file", ...},
    {"name": "edit_file",  ...},
    {"name": "glob",       ...},
    # s05: new entry
    {"name": "todo_write", "description": "Create and manage a task list ...",
     "input_schema": {
         "type": "object",
         "properties": {
             "todos": {
                 "type": "array",
                 "items": {
                     "type": "object",
                     "properties": {
                         "content": {"type": "string"},
                         "status": {"type": "string", "enum": ["pending", "in_progress", "completed"]},
                     },
                 },
             },
         },
     },
    },
]

TOOL_HANDLERS["todo_write"] = run_todo_write
```

**Reminder**: after three tool-use rounds without `todo_write`, the reminder is appended to the third round's results and the counter resets:

```python
rounds_since_todo = 0 if used_todo else rounds_since_todo + 1
if rounds_since_todo >= 3:
    results.append({
        "type": "text",
        "text": "<reminder>Update your todos.</reminder>",
    })
    rounds_since_todo = 0
```

Typical flow when the Agent receives a task: first call `todo_write` to list all steps (all `pending`) → pick one step, set it to `in_progress` → complete it, set to `completed` → look at the next `pending` → continue.

**Key insight**: todo_write doesn't give the Agent any additional **execution capability**. What it adds is **planning capability**.

---

### Changes from s04

| Component | Before (s04) | After (s05) |
|-----------|-------------|-------------|
| Tool count | 5 (bash, read, write, edit, glob) | 6 (+todo_write) |
| Planning | None | Stateful TODO list + reminder |
| SYSTEM prompt | Generic prompt | Added "plan before executing" guidance |
| Loop | Tool dispatch and hooks | Same dispatch path, plus rounds_since_todo and reminder injection |

---

### Try It

```sh
cd learn-claude-code
python s05_todo_write/code.py
```

Try these prompts:

1. `Refactor s05_todo_write/example/hello.py: add type hints, docstrings, and a main guard` (should list 3 steps first, then execute)
2. `Create a Python package under s05_todo_write/example/demo_pkg with __init__.py, utils.py, and tests/test_utils.py`
3. `Review Python files under s05_todo_write/example and fix any style issues`

What to watch for: Was the first tool call `todo_write`? How many TODO steps were listed? Did statuses move from `pending` to `in_progress` / `completed` during execution?

---

### What's Next

The Agent can plan now. But if a task is too large, say "refactor the entire auth module", a TODO list alone isn't enough. That task is itself a collection of dozens of subtasks that would drown in a single conversation's context.

→ s06 Subagent: Break large tasks into subtasks, each handled by an independent Agent with its own clean context, no cross-contamination.

<!-- translation-sync: zh@v1, en@v1, ja@v1 -->

### Full code

The complete implementation is 368 lines: [`s05_todo_write/code.py`](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s05_todo_write/code.py).

## Task system

> **Source:** [Task system](https://github.com/shareAI-lab/learn-claude-code/tree/HEAD/s10_task_system) · [Learn Claude Code](https://github.com/shareAI-lab/learn-claude-code), MIT

s01 → ... → s08 → s09 → `s10` → [s11](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s11_background_tasks) → s12 → ... → s16 → s17

> *"Break big goals into small tasks, order them, persist"* — File-persisted task graph, the foundation for multi-agent collaboration.
>
> **Harness Layer**: Tasks — Persisted goals, recoverable progress.

---

### The Problem

s05's TodoWrite lets an agent record the steps of its current task. Each checklist item has content and a status, helping the agent keep track of what remains.

When a project is split into three tasks—creating database tables, writing an API, and adding tests—the Harness also needs to know how they relate: the API must wait for the database tables, and the tests must wait for a stable API. It also needs to record who is responsible for each task.

TodoWrite does not record these dependencies or assignments. It can show that "write the API" is unfinished, but the Harness cannot use that information to decide whether the task is ready to start.

This chapter adds a Task System. Each task has its own ID and status; `blockedBy` records prerequisites, and `owner` records the agent responsible for the task.

---

### The Solution

![Task System Overview](https://raw.githubusercontent.com/shareAI-lab/learn-claude-code/HEAD/s10_task_system/images/task-system-overview.en.svg)

The code keeps S04's five base tools, Permission, Hooks, and shared `execute_tool`, then adds 6 task tools, persistence in the `.tasks/` directory, and `blockedBy` dependency checks.

TodoWrite vs Task System:

| | TodoWrite (s05) | Task System (s10) |
|---|---|---|
| Role | Execution checklist for the current task | Recoverable task system |
| Storage | In-process / session state | `.tasks/{id}.json` |
| Dependencies | None | `blockedBy` dependency graph |
| Lifecycle | Current session / current task | Cross-session |
| Coordination | No task claiming | `owner` / claim |
| Status | pending / in_progress / completed | pending / in_progress / completed |
| Granularity | The agent's own steps | Tasks that can be claimed, tracked, and unblocked |
| Update contract | Replace the whole checklist | Create/get/update/list individual records |

---

### How It Works

![Task DAG](https://raw.githubusercontent.com/shareAI-lab/learn-claude-code/HEAD/s10_task_system/images/task-dag.en.svg)

#### Task: Data Structure

Each task is a JSON file, stored in the `.tasks/` directory:

```python
@dataclass
class Task:
    id: str
    subject: str
    description: str
    status: str          # pending | in_progress | completed
    owner: str | None    # Agent responsible for this task
    blockedBy: list[str] # List of dependency task IDs
```

IDs use the `task_` prefix followed by 8 random hexadecimal characters. Files are created exclusively; an existing ID is discarded and regenerated.

`TaskStore` validates task IDs and reads and writes the JSON files. `TASKS = TaskStore(TASKS_DIR)` is the store used by this chapter.

#### create_task: Create Tasks

```python
def create_task(subject: str, description: str = "") -> Task:
    return TASKS.create(subject, description)
```

`TaskStore.create` checks the subject, allocates a random ID, and writes `.tasks/{id}.json`. A new task always starts with an empty `blockedBy` list. The tool result returns the runtime-generated ID to the model.

#### update_task: Add Dependencies with Returned IDs

```python
def update_task(task_id: str, addBlockedBy: list[str]) -> Task:
    return TASKS.update_dependencies(task_id, addBlockedBy)
```

Task graph construction uses two phases: create every node first, then call `update_task` with the IDs returned by `create_task` to add edges. This matters when the model emits several tool calls in one response: sibling calls are formed before any tool result exists, so one `create_task` call cannot consume another call's newly generated ID.

`update_task` validates the entire change before saving it. The target and dependencies must exist, the target must still be pending and unowned, and the new edges must not introduce self-dependencies or cycles. Repeating an existing edge is safe and does not duplicate it.

#### can_start: Dependency Check

A task can only start after all its `blockedBy` dependencies are **completed**:

```python
def can_start(task_id: str) -> bool:
    return not incomplete_dependencies(load_task(task_id))
```

`incomplete_dependencies` loads each prerequisite. A task cannot be claimed if any prerequisite is not completed or its file no longer exists.

#### claim_task: Claim a Task

When the agent starts working on a task, it calls `claim_task`: sets `owner`, changes status from `pending` → `in_progress`. The `owner` field records who claimed the task:

```python
def claim_task(task_id: str, owner: str = "agent") -> str:
    task = load_task(task_id)
    if task.status != "pending":
        return f"Task {task_id} is {task.status}, cannot claim"
    dependencies = incomplete_dependencies(task)
    if dependencies:
        return f"Blocked by: {dependencies}"
    task.owner = owner
    task.status = "in_progress"
    TASKS.save(task)
    return f"Claimed {task_id} ({task.subject})"
```

The claim is rejected if the task is not pending or its dependencies are incomplete. S10 only updates task state sequentially.

#### complete_task: Complete and Unblock

When a task is done, set it to `completed`. Simultaneously scan all other tasks to find downstream tasks that were **just unblocked**:

```python
def complete_task(task_id: str, owner: str = "agent") -> str:
    task = load_task(task_id)
    if task.status != "in_progress":
        return f"Task {task_id} is {task.status}, cannot complete"
    if task.owner != owner:
        return f"Task {task_id} is owned by {task.owner}, not {owner}"
    ready_before = {t.id for t in list_tasks()
                    if t.status == "pending" and t.blockedBy
                    and can_start(t.id)}
    task.status = "completed"
    TASKS.save(task)
    unblocked = [t.subject for t in list_tasks()
                 if t.status == "pending" and t.blockedBy
                 and t.id not in ready_before
                 and can_start(t.id)]
    msg = f"Completed {task_id} ({task.subject})"
    if unblocked:
        msg += f"\nUnblocked: {', '.join(unblocked)}"
    return msg
```

After completing "schema", `can_start` returns True for "endpoints" and "docs"; they can begin.

#### get_task: View Full Details

`list_tasks` only shows a one-line summary. `get_task` returns the full task JSON, including description and dependency details. When recovering across sessions, the agent needs to read the full description to continue work:

```python
def get_task(task_id: str) -> str:
    task = load_task(task_id)
    return json.dumps(asdict(task), indent=2)
```

#### State Machine: Two Actions, Three States

```
pending ──claim──→ in_progress ──complete──→ completed
```

Here `claim` / `complete` are actions, while `pending` / `in_progress` / `completed` are states:

- **claim_task**: `pending` → `in_progress`. Sets owner, begins work.
- **complete_task**: `in_progress` → `completed`. Marks the task done and unblocks downstream.

#### Putting It Together

```python
# Phase 1: create every node and receive its runtime ID
schema = create_task("setup database schema")
endpoints = create_task("create API endpoints")
tests = create_task("write tests")
docs = create_task("write docs")

# Phase 2: add edges using those returned IDs
update_task(endpoints.id, addBlockedBy=[schema.id])
update_task(tests.id, addBlockedBy=[endpoints.id])
update_task(docs.id, addBlockedBy=[schema.id])

# Agent claims the first available task
claim_task(schema.id)       # ✓ Claimed (no dependencies)
complete_task(schema.id)    # ✓ Completed → unblocks endpoints, docs

claim_task(endpoints.id)    # ✓ Claimed (schema completed)
complete_task(endpoints.id) # ✓ Completed → unblocks tests

claim_task(docs.id)         # ✓ Claimed (schema completed)
complete_task(docs.id)      # ✓ Completed

claim_task(tests.id)        # ✓ Claimed (endpoints completed)
complete_task(tests.id)     # ✓ Completed
```

Each `create_task` writes a JSON file; `update_task`, `claim_task`, and `complete_task` update it. Across sessions, the `.tasks/` directory persists — the agent reads the files to recover progress.

---

### Try It

```sh
cd learn-claude-code
python s10_task_system/code.py
```

Try these prompts:

1. `Create tasks: setup database schema, create API endpoints (depends on schema), write tests (depends on endpoints), write docs (depends on schema)`
2. `List all tasks and their statuses`
3. `Claim the first unblocked task and complete it`
4. `List tasks again — which ones are now unblocked?`

What to observe: Are JSON files generated in the `.tasks/` directory? After completing a task, are the blocked tasks unblocked?

---

### What's Next

The task graph is in place, but full test suites, dependency installation, and deployment commands can take a long time. When these commands run synchronously, the Agent Loop remains blocked in the current tool call and cannot continue until the command finishes.

s11 Background Tasks → Slow operations run in the background. The Agent Loop can continue processing other tasks and receives a notification when the background work finishes.

<!-- translation-sync: zh@v5, en@v5, ja@v5 -->

### Full code

The complete implementation is 600 lines: [`s10_task_system/code.py`](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s10_task_system/code.py).
