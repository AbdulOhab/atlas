---
title: "Capstone: The Simplified Claude Code"
order: 15
summary: "The finished agent: a workflow runtime and a goal loop that keeps working until the job is done."
category: "Building Claude Code From Scratch"
level: Intermediate
---

# Capstone: The Simplified Claude Code

The capstone combines everything into one agent that takes a goal and works through it on its own.

**Course milestone:** Building Claude Code From Scratch

## Workflow runtime

> **Source:** [Workflow runtime](https://github.com/shareAI-lab/learn-claude-code/tree/HEAD/s16_workflow_runtime) · [Learn Claude Code](https://github.com/shareAI-lab/learn-claude-code), MIT

s01 → ... → s14 → [s15](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s15_integrated_harness) → `s16` → [s17](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s17_goal_loop)

> *"One tool_use runs an entire orchestration"* — The `Workflow` tool starts a recoverable script runtime that coordinates many agent calls.
>
> **Harness layer**: Orchestration — run saved multi-agent scripts above the single-agent loop.

---

From s01 through s15, the model decides which tools to call in each round. Their results enter `messages[]`, and the model decides the next step from the updated context. This works well when the path depends on what the previous step discovers.

Some tasks repeat a fixed sequence. A code review may inspect several dimensions concurrently, verify each finding, combine duplicates, and sort the result. The sequence and dependencies are known before execution. Here the host needs three things:

- **Parallelism**, rather than waiting for one item at a time;
- **A stable result structure**, even when individual agent answers vary;
- **Recoverability**, so an interruption does not rerun work that is already complete.

If this orchestration exists only in conversation history, its ordering and checkpoints also exist only in that history. A saved workflow puts the fixed sequence in code and records completed calls in a journal.

### Put the Plan in Code, Not in a Sequence of Chat Turns

Add a `Workflow` tool to the harness tool pool. The host registers trusted scripts built from `agent()`, `parallel()`, `pipeline()`, and `phase()`. The model supplies only a saved workflow name, arguments, and an optional run ID to resume; it does not send executable code or metadata.

The workflow enters the main loop as one `tool_use`. As the script runs, the runtime emits lifecycle and progress events and records every step in a journal on disk. When the script finishes, the call returns the launch envelope, result, and task state. Intermediate script results live in variables instead of taking space in conversation history. When restarted with `resume_from_run_id`, unchanged `agent()` calls hit the journal cache and reuse previous results.

![Workflow Runtime Overview](https://raw.githubusercontent.com/shareAI-lab/learn-claude-code/HEAD/s16_workflow_runtime/images/workflow-runtime-overview.svg)

```python
SAMPLE_META = {"name": "review-changes", "description": "Review code changes", "phases": ["Review", "Verify"]}

async def sample_workflow(ctx, args):
    ctx.phase("Review")
    results = await ctx.pipeline(DIMENSIONS, audit, verify)   # Each dimension independently runs audit → verify
    confirmed = [f for r in results if r for f in r["confirmed"]]
    ctx.log(f"Confirmed {len(confirmed)} real issues")
    return {"confirmed": confirmed}
```

### The Workflow Tool: One Call, One Complete Run

`Workflow` is added to the s15 host's existing tool pool. The user can request a saved workflow, or the model can select it when a task matches a known orchestration. The adapter resolves the name through the host-owned `WORKFLOWS` registry, then passes its trusted metadata and function to the runtime. The other s15 tools remain available in the same loop.

The model-facing schema accepts `name`, `args`, and `resume_from_run_id`. Unknown names and malformed arguments become an error tool result instead of ending the host loop. The runtime then validates the registered metadata, checks permissions, registers a local workflow task, and emits `async_launched` before running the script. Progress events follow, then the final `task_notification`; the call returns JSON-safe launch information, result, and task state.

```python
WORKFLOW_TOOL = {
    "name": "Workflow",
    "input_schema": {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "args": {"type": "object"},
            "resume_from_run_id": {"type": "string"},
        },
        "required": ["name"],
        "additionalProperties": False,
    },
}

async def run_workflow(name, args=None, resume_from_run_id=None):
    meta, script_fn = WORKFLOWS[name]
    out = await WorkflowTool().call(
        meta, script_fn,
        args=args,
        resume_from_run_id=resume_from_run_id,
    )
    return {"launched": out["launched"], "result": out["result"],
            "task": serialize_task(out["task"])}
```

### Workflow Metadata: Validate Before Launch

Each saved workflow registers trusted metadata with `name`, `description`, and optional `phases`. The runtime validates it before executing workflow code. `name` and `description` identify the task in the UI, while `phases` names groups in the progress display. These fields belong to the host registry, not to model input.

Invalid registration raises `WorkflowInputError` before launch. This is the same idea as validating cron expressions in s12: do not wait until execution to discover a bad saved workflow.

Because the runtime uses `meta.name` in local artifact filenames, it also requires a 1-64 character safe slug containing letters, numbers, `.`, `_`, or `-`.

```python
def validate_meta(meta):
    if not isinstance(meta, dict):
        raise WorkflowInputError("meta must be an object literal")
    if not meta.get("name") or not meta.get("description"):
        raise WorkflowInputError("meta requires name and description")
    if not isinstance(meta["name"], str) or not WORKFLOW_NAME_RE.fullmatch(meta["name"]):
        raise WorkflowInputError("meta.name must be a safe 1-64 character slug")
    if "phases" in meta and (
        not isinstance(meta["phases"], list)
        or not all(isinstance(p, str) and p for p in meta["phases"])
    ):
        raise WorkflowInputError("meta.phases must contain non-empty strings")
    return meta
```

### Orchestration Primitives

A script receives an `ExecutionState` exposing a small set of orchestration primitives. It does not read files or run shell commands directly. The default interactive mode connects `agent()` to the same real API client as the host, and each workflow agent reads only the content supplied through workflow arguments. `demo` and unit tests use `MockAgentRunner` so events and journal replay are repeatable.

| Primitive | Purpose |
|------|------|
| `agent(prompt, {schema, label, phase})` | Dispatch one subagent |
| `parallel(thunks)` | **Barrier**: run every task concurrently and wait until all results return |
| `pipeline(items, *stages)` | Run each item through stages **without a barrier**; finished items proceed immediately |
| `phase(title)` | Mark the current progress phase and update the progress display |
| `log(message)` | Emit a progress log line |
| `workflow(name, args)` | Run a nested sub-workflow, one level only |

Use `pipeline` when each item independently crosses the same stages. Item A may reach stage three while item B is still in stage one. Use `parallel` when the next step needs every result from the preceding group.

```python
async def pipeline(self, items, *stages):
    async def run_item(item, idx):
        value = item
        for stage in stages:                       # Each item independently completes every stage
            value = await stage(value, item, idx)
        return value
    return await asyncio.gather(*[run_item(it, i) for i, it in enumerate(items)])
```

### Structured Output: Do Not Let Subagents Return Essays

`agent({schema})` asks a workflow agent to return only a JSON object matching the schema. The runtime parses and validates the result, then retries once if it does not match. Downstream code receives an object instead of extracting fields from prose.

s05 warned that tool arguments cannot be trusted completely. This is the same lesson in reverse: subagent output cannot be trusted completely either. Validate at the orchestration boundary, give one retry, and keep uncertainty out of the rest of the flow.

```python
run = await asyncio.to_thread(self.runner.run, prompt, schema, label)
result = run.value
if schema is not None:
    ok, err = SimpleJsonSchema(schema).validate(result)
    if not ok:                                       # Retry once with a reminder, then fail
        retry = await asyncio.to_thread(
            self.runner.run, prompt + "\n\nReturn valid JSON.", schema, label
        )
        result = retry.value
        ok, err = SimpleJsonSchema(schema).validate(result)
        if not ok:
            raise WorkflowInputError(f"agent({{schema}}) returned invalid output: {err}")
```

### Task State and Progress Events

`LocalWorkflowTask` maintains status and token usage and emits an SDK-style event stream: `task_started` → a sequence of `task_progress` events containing phase changes, subagent starts, and log batches → one final `task_notification` reporting completion or failure, plus the output file and agent and token counts.

The demo prints these events in order and returns the task state after the final notification.

```python
class LocalWorkflowTask:
    def progress_event(self, ptype, **data):         # Phase/subagent/log
        self.progress.append({"type": ptype, **data})
        print(f"  progress   {ptype} ...")
```

### Storage: Snapshot + Journal for Resuming after Interruptions

The runtime stores each run under `s16_workflow_runtime/.runtime/`: a `<runId>.json` snapshot, `<runId>.output.json` output, `<runId>.journal.jsonl` journal, and `<runId>.lock` coordination file. Every fresh run reserves a new `runId` with exclusive file creation before opening its journal. The run lock stays held through execution and final persistence, so another process cannot resume the same run at the same time. Its snapshot records the workflow name, arguments, and task state; resume validates the saved snapshot and journal before changing either successful artifact.

The journal is the core of checkpointed resume. It records every `agent()` result one line at a time:

```python
class WorkflowJournal:
    def record(self, key, value):
        self._f.write(json.dumps({"key": key, "value": value}) + "\n")
        self._f.flush()
        self.cache[key] = value
```

### Resume: Continue by runId and Reuse Everything Unchanged

Calling the workflow again with `resume_from_run_id` reruns the script, but every `agent()` computes a deterministic semantic key. If that key is present in the journal, it returns the cached result without executing again. Every unchanged call hits the cache; only a changed call and the downstream steps that depend on it actually rerun.

The key detail is that keys cannot depend on concurrency order. Agents in `parallel` and `pipeline` finish in nondeterministic order. If "the nth completion" became the key, cache entries would map to the wrong calls on the next run. A key therefore uses a stable hash of call content, including type, label, prompt, and schema, rather than a shared counter:

```python
def key(self, kind, label, prompt, schema):
    basis = f"{kind}|{label}|{prompt}|{json.dumps(schema, sort_keys=True)}"
    return f"{kind}-{_stable_hash(basis) % 10**10:010d}"

# Inside agent():
cached = self.journal.cached(key)
if cached is not MISS:
    self.task.progress_event("workflow_agent", label=label, status="cached")
    return cached
```

### Stable Call Keys

On resume, the runtime must match each current `agent()` call with its earlier journal record. A stable hash gives unchanged workflow code and arguments the same call key. Real model output may vary; when the call content has not changed, resume uses the result already saved in the journal.

### See It Run

The sample `review-changes` workflow uses `pipeline` to send each review dimension independently through audit → verify. Interactive mode uses the real API and reads the material to review from `args.changes`. `demo` uses fixed runner data to show pipeline, validation, journal, and resume behavior.

```python
async def sample_workflow(ctx, args):
    ctx.phase("Review")
    changes = args.get("changes", "")

    async def audit(_v, dimension, _i):
        out = await ctx.agent(f"Inspect this change for {dimension} issues:\n{changes}",
                              schema=FINDINGS_SCHEMA, label=f"audit:{dimension}", phase="Review")
        return {"dimension": dimension, "findings": out["findings"]}

    async def verify(audited, dimension, _i):
        ctx.phase("Verify")
        verdicts = await ctx.parallel([                       # Verify every finding independently
            (lambda f=f: ctx.agent(f"Verify this finding against the change:\n{changes}\n\n{f}",
                                   schema=VERDICT_SCHEMA, label=f"verify:{dimension}:{f['title']}"))
            for f in audited["findings"]])
        return {"dimension": dimension,
                "confirmed": [f for f, v in zip(audited["findings"], verdicts) if v and v["isReal"]]}

    results = await ctx.pipeline(DIMENSIONS, audit, verify)
    ...
```

### Changes from s15

| | s15 Integrated Harness | s16 Workflow Runtime |
|--|-----------|---------------------|
| Loop | One model-driven loop | Main loop unchanged; a tool runs scripted orchestration |
| Who decides the next step | Model decides each round | Script declares the orchestration in advance |
| Multiple agents | One-shot s06 subagents | Scripted, resumable calls through an agent-runner boundary |
| New mechanisms | — | Script primitives, host registry and tool adapter, task lifecycle, progress events, journal/resume, structured output |

s16 does not replace the main loop. It exposes `Workflow` at the tool layer and starts a local workflow runtime behind it: one saved script coordinates N calls through an agent-runner boundary. An s06 subagent is dispatched once at the model's discretion; s16 turns the orchestration into resumable host code.

### Try It

```bash
python s16_workflow_runtime/code.py          # Both the main model and Workflow agents use the real API
python s16_workflow_runtime/code.py demo     # Deterministic review-changes fixture and event stream
python s16_workflow_runtime/code.py resume   # Resume by the last runId; every agent() hits the journal cache
```

In the default command, ask the model to read the changes, place that text in `args.changes`, and run the saved `review-changes` workflow. Both the main model and workflow agents use the real API. The `demo` command uses fixed runner data so lifecycle and resume behavior can be observed repeatedly. A resumed demo reports `agents=0 tokens=0` when every call hits the cache.

### Next

[s17 Goal Loop](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s17_goal_loop) uses a smaller, independent loop to check whether a stated goal has been reached and decide whether another turn is needed.

<!-- translation-sync: zh@v10, en@v10, ja@v10 -->

### Full code

The complete implementation is 888 lines: [`s16_workflow_runtime/code.py`](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s16_workflow_runtime/code.py).

## Goal loop

> **Source:** [Goal loop](https://github.com/shareAI-lab/learn-claude-code/tree/HEAD/s17_goal_loop) · [Learn Claude Code](https://github.com/shareAI-lab/learn-claude-code), MIT

s01 → ... → s15 → [s16](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s16_workflow_runtime) → `s17`

> *"The model making no more tool calls means that one turn wants to stop. A separate evaluator decides whether the whole goal is complete."*
>
> **Harness layer: continued execution.** Check a completion condition at the end of every turn, and start another turn when work remains.

---

![Goal Loop overview](https://raw.githubusercontent.com/shareAI-lab/learn-claude-code/HEAD/s17_goal_loop/images/goal-loop-overview.svg)

Since s01, the agent loop has had one simple exit condition: when the model stops calling tools, the program returns.

That is enough for ordinary conversations, but not always for tasks such as "keep fixing until every test passes" or "finish every acceptance criterion." The model may believe the work is done after only part of it. No new `tool_use` means only that the current turn ended; it does not prove that the whole goal was achieved.

`/goal` adds one independent decision before the real return.

### /goal is a session-scoped Stop hook

Enter:

```text
/goal pytest tests/auth exits with code 0 and lint reports no errors
```

The program stores the completion condition and immediately gives it to the main model as the current task. You do not need to send a second "start working" prompt.

When the main model stops calling tools, the loop runs the Goal Stop hook before returning:

```python
if tool_results:
    messages.append({"role": "user", "content": tool_results})
    continue

decision = await self.goal.evaluate_after_turn(self.messages)
if decision.action == "block":
    self.messages.append({
        "role": "user",
        "content": decision.reason,
    })
    continue

return SessionResult(text=text, status=decision.action)
```

With no active goal, the hook allows the stop immediately, so the return condition is the same as in s01.

### The evaluator is separate from the worker

The main model edits code, runs commands, and solves the task. The Goal evaluator is a separate model call with one job: judge the completion condition.

`GoalController` owns the evaluator as an internal dependency of the Goal gate. It is not a second return path beside the main loop.

This lesson has no separate `CommandQueue`: when evaluation blocks the stop, the controller appends the reason to the same `messages[]` and starts the next turn. A larger host may use a shared queue to carry user input, background results, and continuation commands back into the session, but that queue is transport for the whole host, not a component owned by the Goal gate. Putting it inside the gate would blur the decision with the path used to deliver that decision.

The evaluator sees:

- the active Goal condition;
- the conversation so far;
- tool results that the worker placed in that conversation.

It has no tools. It cannot read a file or rerun a test on its own. It can only judge what is already present in the conversation:

```json
{
  "ok": false,
  "reason": "The conversation does not contain pytest's exit code yet.",
  "impossible": false
}
```

`ok=true` means the condition is satisfied. `ok=false` means another turn is needed. If the task can no longer be completed, the evaluator can return `impossible=true`.

### The conversation is the evaluator's input

The evaluator reads the current conversation. Tool results, worker explanations, and background-task notifications all enter it as messages, and the decision depends on what those messages actually say.

The evaluator input keeps the most recent complete messages. If the newest message alone is too large, it keeps that message's beginning and end so one tool result cannot fill the whole evaluator request.

That does not mean a bare "tests passed" claim must be accepted. The evaluator prompt explicitly requires concrete results from the conversation and tells the model not to assume an unreported command succeeded.

It is still a model reading text, so reliability depends on whether important results were surfaced clearly. The worker's system prompt therefore says:

> After running a verification command, report the command and its result clearly enough for an independent evaluator to inspect.

Goal Loop is not a test framework. Tools still perform the real verification. The Goal evaluator only decides whether those verification results are present in the current work record.

### A good completion condition is checkable

"Make the code good" is too vague. The evaluator cannot know what "good" means.

A useful condition states three things:

1. **End state:** what must be true when work is done;
2. **Check:** which command or output proves it;
3. **Constraints:** what must not be broken along the way.

For example:

```text
/goal finish the authentication migration until pytest tests/auth exits 0,
without modifying test files outside tests/auth
```

If you need to bound unattended work, use the main loop's global turn limit instead of hiding a fixed budget inside Goal:

```bash
MAX_TURNS=20 python s17_goal_loop/code.py \
  "/goal fix the type errors until npm run typecheck exits 0"
```

### Unfinished work returns to the same loop

When the evaluator says the condition is not met, it returns a short reason:

```text
The conversation has no complete test result. Run pytest tests/auth and report its exit code.
```

The program appends that reason to `messages[]` and executes `continue` in the current `while` loop. The main model starts another turn without waiting for the user to type "continue."

There is no separate continuation queue. Goal evaluation happens at the loop's return boundary, and unfinished work returns through that same boundary.

### Wait before judging unfinished background work

A Workflow, background command, or other asynchronous task may still be running when the main model ends its current turn.

Evaluating immediately would be premature because the important result has not returned to the conversation. The Goal Stop hook returns `defer`, keeps the Goal active, and skips the evaluator. When the task finishes, the host passes its completion message to `submit_background_result()`; that message enters the same `messages[]`, and the loop resumes.

A Workflow notification has no mechanical privilege. It enters the conversation like other messages, and the evaluator judges the actual result it contains.

### Automatic continuation still needs an exit

Goal has no hidden default budget of twenty turns. The evaluator judges the condition again after each completed turn.

No automatic mechanism should monopolize one request forever, however. This lesson keeps two general exits outside the goal itself:

- the main loop's global `max_turns`;
- a cap on consecutive Stop-hook blocks.

When a limit is reached, the program returns control to the user. It does not mark the goal complete and does not silently clear it. The user can inspect status, provide more information, continue, or clear the goal.

An evaluator error follows the same rule: stop automatic continuation, leave the goal active, and surface the error instead of claiming success when completion could not be judged.

### Inspect, replace, and clear

One session has at most one active Goal.

```text
/goal
```

Shows the condition, elapsed time, evaluation count, main Agent token spend, and the latest evaluator reason.

```text
/goal a new completion condition
```

Replaces the previous Goal and begins work under the new condition immediately.

```text
/goal clear
```

Clears the active Goal. `stop`, `off`, `reset`, `none`, and `cancel` are accepted aliases.

`GoalController.restore()` can restore a still-active Goal from `goal_status` events persisted by the host; this lesson's CLI does not persist a whole session. A completed, failed, or cleared Goal does not restart. The condition carries over, while turn count, elapsed time, and token baseline start fresh.

### What the code adds

This is an independent mechanism example built on the S04 kernel. It keeps the five base tools and the four hook points, then adds four Goal-specific pieces:

| Piece | Responsibility |
|---|---|
| `GoalState` | Store the condition, evaluation count, start time, and latest reason |
| `PromptGoalEvaluator` | Use a separate model call to judge the conversation |
| `GoalController` | Set, inspect, clear, and run the Goal Stop hook |
| `AgentSession` | Connect the Stop hook to the original return boundary |

The integration point is only a few lines:

```python
decision = await self.goal.evaluate_after_turn(self.messages)
if decision.action == "block":
    continue
return SessionResult(text=text, status=decision.action)
```

### Try it

Install dependencies and prepare `.env`:

```bash
pip install -r requirements.txt

# .env
ANTHROPIC_API_KEY=...
MODEL_ID=...

# Optional: use a smaller model for Goal evaluation
GOAL_EVALUATOR_MODEL_ID=...
```

Start the interactive session:

```bash
python s17_goal_loop/code.py
```

Then enter:

```text
/goal python -m pytest exits with code 0
```

You can also set a Goal directly from the command line:

```bash
python s17_goal_loop/code.py "/goal python -m pytest exits with code 0"
```

### Relationship to s16

s16 answers how a batch of work should run: which steps are concurrent, how results are verified, and how an interrupted run resumes.

s17 answers whether the entire task is complete. A Workflow may finish successfully while the user's final requirements are still unmet. Once the Workflow result enters the conversation, the Goal evaluator decides whether the session should stop or continue.

You can use either mechanism on its own. When one host connects them, the Workflow completion message enters the conversation and Goal Loop decides whether the overall task needs another turn.

<!-- translation-sync: zh@v6, en@v6, ja@v6 -->

### Full code

The complete implementation is 903 lines: [`s17_goal_loop/code.py`](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s17_goal_loop/code.py).
