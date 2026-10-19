# V0.1.3 Decision: Skill auto-prefetch at task start (LLM doesn't drive)

Status: **Draft, awaiting operator approval before code**
Author: Claude (sandbox session, 2026-10-20)
Supersedes: V0.1 / V0.1.1 / V0.1.2 (which kept skills as opt-in tools)

---

## 1. Problem

V0.1 / V0.1.1 / V0.1.2 all share a flawed assumption: **skills are LLM-driven**. The `buildSystemPrompt` block in `src/pi-runtime.ts` lists the available skill tools and tells the agent "use `mem0_lookup` when you encounter a pitfall". This relies on the model deciding to invoke the tool on its own.

Production reality is different. **Slinky (the upstream dispatcher) only sends task-related descriptions.** When a slinky task arrives at piko, the `task.instruction` is something like "implement the `my-greeter` skill" — it does **not** say "look up past experience about skill naming" or "check the project docs for conventions". A small model like qwen3-8b-flash **will not** decide on its own to invoke `mem0_lookup` when given a code-writing task, even though the system prompt lists the tool. We saw this in `piko-debug-run.ts` with the `greeting.ts` task: the agent wrote the file, never called the skill tools.

**Net result**: V0.1 day-1 verify (5/5 against real Mem0 Cloud, 5/5 against OpenSearch mock) proves the **adapter layer** is correct. It does **not** prove the skills are actually exercised by the agent. The V0.1 design's "skill is usable" intent was never end-to-end verified.

## 2. Decision (V0.1.3)

Skills become **automatically prefetched context**, not optional tools. Concretely:

1. `pi-runtime.ts:execute()` calls a new helper `prefetchSkillContext(task, identity)` **before** `AgentHarness.create(...)` is invoked.
2. `prefetchSkillContext` runs both `mem0.search(task.instruction, …)` and `graphrag.search(task.instruction, …)` (in parallel, with short timeouts) and returns `{ memory: Mem0SearchResult[], docs: GraphRAGSearchResult[] }`.
3. The system prompt that the agent sees is extended with a new `=== Context ===` section between the role/identity block and the rest of the prompt. The pre-fetched entries are rendered there.
4. The three skill tools (`mem0_lookup`, `mem0_record`, `graphrag_search`) **remain in the `available` map** so the agent can do *additional* queries mid-task if needed. The change is that the agent now starts each task **already informed** by relevant prior experience and project docs — it doesn't have to "remember" to query.

### 2.1 Why prefetch is mandatory, not optional

- A small / local model without strong tool-use priors (qwen3-8b flash, llama-class) will skip optional queries unless the task explicitly demands them
- "Skill is a fallback for forgetting" only works if the agent remembers to look it up; the model's failure mode is forgetting to do so
- Prefetching at task start is constant-time; per-task latency is a few hundred ms, acceptable
- Failures are graceful: if mem0 / graphrag are unreachable, the context section is empty (with a `⚠ no prior experience found` / `⚠ no docs found` line) and the task proceeds normally

### 2.2 Query construction

`mem0.search(task.instruction, { user_id: \`${identity.role}:${project}\`, max_results: 5 })`:
- `task.instruction` is the slinky-supplied description verbatim (e.g., "implement my-greeter")
- `user_id` is `role:project` per piko's existing convention
- `max_results: 5` is conservative; agent can do more queries later

`graphrag.search(task.instruction, { scope: defaultScope, max_results: 5 })`:
- Same query text
- `defaultScope` is `IdentityConfig.doc_search.default_scope` (set at runtime; defaults to `"piko-design-docs"` or whatever the operator configures)
- `max_results: 5`

### 2.3 System prompt extension

Current `buildSystemPrompt(task, identity)` produces something like:

```
You are Piko, executing one durable task. Work only inside the configured workspace...

You are acting as **tester**.
Your identity: alice:tester.

You have access to two skill-experience tools (role-scoped external memory):
  - mem0_lookup(query): search past experience for this role in this project
  - mem0_record(content, tags?): record a lesson when you encounter a pitfall, ...
Use mem0_lookup when starting work that might have known pitfalls. ...

You have access to a document search tool (project-wide corpus):
  - graphrag_search(query, scope?, max_results?): search the project's design docs / STD corpus for relevant content
Use graphrag_search when you need to recall what the project's specs say before making changes, ...
```

V0.1.3 adds a `=== Context ===` section between the role/identity block and the existing tool hints:

```
You are acting as **tester**.
Your identity: alice:tester.

=== Prior experience for role "tester" (3 most recent) ===
- "Prefer hermetic tmpdir for test fixtures" (2026-10-12, tags: tests, fixtures)
- "Mock fetch at the global level, not in adapter" (2026-10-08, tags: tests, mock)
- "Never bypass type check via any; use zod or ajv" (2026-10-04, tags: types)

=== Relevant project docs (top 3) ===
- docs/91_reviews/v0.1-coding-notes §0.7: 端到端 piko 跑通 mlx-serve qwen3-8b-flash; piko tool profiles use workspace-exec + mem0_lookup/record/graphrag_search
- docs/20_system_design/mechanisms/piko-skill-memory.md §3.2: per-role 隔离用 ${role}:${project} 形式 user_id
- docs/91_reviews/v0.1-coding-notes §0.7.3: runtime build 失败 pitfalls

You have access to two skill-experience tools (role-scoped external memory):
  - mem0_lookup(query): ...
  ...
```

(Each entry is the LLM-cached fragment that piko's adapter returned from the real backend; the format mirrors the `memory` / `content` fields of the response.)

If both prefetches return empty, the section collapses to:
```
=== Prior experience for role "tester" (0 found) ===

=== Relevant project docs (0 found) ===
```

This signals to the LLM that the corpus is fresh for this task / role.

## 3. Architecture: code surface

### 3.1 New file

`src/skill-prefetch.ts`:
```ts
import { Mem0Adapter } from "./mem0-client.js";
import { GraphRAGAdapter } from "./graphrag-client.js";

export interface PrefetchedSkillContext {
  memory: Mem0SearchResult[];
  docs: GraphRAGSearchResult[];
  memory_query: string;
  docs_query: string;
}

export async function prefetchSkillContext(
  query: string,
  identity: { role: string; user_id: string; defaultScope: string },
  mem0: Mem0Adapter,
  graphrag: GraphRAGAdapter,
  opts?: { timeoutMs?: number },
): Promise<PrefetchedSkillContext> { ... }
```

Implementation:
- `Promise.allSettled([mem0Promise, graphragPromise])` so a slow/broken backend doesn't block the other
- `timeoutMs: 1500` (configurable) per backend; beyond timeout we treat as empty result
- All exceptions are caught and logged; we never throw out of `prefetchSkillContext` (we always return a context object, possibly with empty arrays)

### 3.2 Modified files

`src/pi-runtime.ts`:
- Import `prefetchSkillContext` and `PrefetchedSkillContext`
- `execute()` calls `prefetchSkillContext` after constructing adapters but before `AgentHarness.create(...)` (sync? actually `prefetchSkillContext` is async, so add `await` between)
- `buildSystemPrompt(task, identity, skillContext?)` gains an optional 3rd arg; when provided, the `=== Context ===` section is emitted
- The handoff passes `skillContext` through to `buildSystemPrompt` via a local var in `execute()`

`src/tool-host-policy.ts`: no change (the prefetch is `globalThis.fetch`-free; it uses piko's own adapters which are already wrapped by the policy)

### 3.3 Updated existing docs

- `docs/91_reviews/piko-skill-memory.md §4 触发机制`: rewrite from "agent 主动调" to "V0.1.3 prefetch 自动 + 工具保留"
- `docs/91_reviews/piko-doc-search.md §6 集成点`: same
- `docs/91_reviews/v0.1-coding-notes-2026-10-18.md`: append `§0.9` recording the V0.1.3 decision

## 4. Failure / edge cases

| Case | Behavior |
|---|---|
| Both backends unreachable | Context section with 0 / 0 entries + log warning. Task continues. |
| Only mem0 reachable | Mem0 entries in context; docs section shows `⚠ no docs found`. |
| `identity.memory` not configured | Skip mem0 prefetch; context.mem0 empty. |
| `identity.doc_search` not configured | Skip graphrag prefetch; context.docs empty. |
| Mem0 / graphrag returns huge payload | Cap to top-5 entries by `_score` desc; render only first 200 chars per `memory` / `content` |
| Prefetch latency > 1500ms | That backend's result is empty; the other still served. Total task startup < 3s. |
| Task `instruction` is empty | Skip prefetch entirely (vacuously relevant). |

## 5. Test plan (V0.1.3 specific)

These tests pin down the *behavior* (auto-prefetch), not the adapter correctness (which V0.1.2 already covers).

### 5.1 Unit tests (`src/skill-prefetch.test.ts`)

- Returns empty `memory` / `docs` arrays when both adapters reject
- Returns mem0 entries when only mem0 adapter succeeds (graphrag fails)
- Times out gracefully: a deliberately slow adapter doesn't block beyond `timeoutMs`
- All exceptions are caught; the function never throws
- `Promise.allSettled` semantics: rejection of one doesn't reject the other

### 5.2 Integration test (`scripts/v0.1-pi-runtime-smoke.ts` extension or new file)

- Construct PiRuntime with mock mem0 (5 seeded memories) + mock graphrag (5 seeded chunks)
- Issue a task with a `task.instruction` that matches some seeded entries
- Read the system prompt that `PiRuntime.execute()` constructed (need a hook / refactor to expose)
- Assert the prompt contains the relevant memory / doc strings in the `=== Context ===` section

### 5.3 End-to-end test (`scripts/piko-debug-run.ts` rewrite)

- Task instruction: **no skill hint** — e.g., "Write a new piko skill called `my-greeter` that follows the project's convention."
- mlx-serve qwen3-8b-flash drives the agent
- Tool-call observer wraps `available[name].execute` for `mem0_lookup` / `graphrag_search`
- Assertions:
  - Mock-mem0 received the prefetch `mem0.search(query, …)` call (prefetched before LLM first turn)
  - Mock-graphrag received the prefetch `graphrag.search(query, …)` call
  - LLM mid-task may issue 0+ additional calls; the prefetch ones are the proof
  - The system prompt (observable via debug log) contains the prefetched entries in `=== Context ===` section
- This is the e2e proof that "V0.1 skills are usable" not in the sense of "tools are wired" but in the sense of "**the agent always sees prior context at task start**".

## 6. Migration / impact

| Area | V0.1.2 | V0.1.3 (this RFC) |
|---|---|---|
| `piko-skill-memory.md §4` | "agent triggers" | "prefetch at task start + tool retained" |
| `piko-doc-search.md §6` | same | same |
| `src/pi-runtime.ts:execute` | direct to `harness.create` | `await prefetchSkillContext` → then `harness.create` |
| `buildSystemPrompt` | 2 args | 3 args (added `skillContext?`) |
| `available` map | unchanged | unchanged (tools stay for additional mid-task queries) |
| `v0.1-coding-notes §0.9` | n/a | new section recording this decision |

## 7. Open questions

1. **Prefetch query**: should it be `task.instruction` verbatim, or enriched with `role: ${identity.role}\n${task.instruction}` to bias toward role-relevant experience? *Decision*: use `task.instruction` raw; the `user_id` already biases by role.
2. **What if `task.instruction` is very long (>1KB)**: cap at 500 chars to keep search query bounded. *Default*: `query.slice(0, 500)`.
3. **Caching**: should we cache `prefetchSkillContext` results across `execute()` calls within the same process? *Default*: no cache; the backend is fast enough; caching would complicate identity-change scenarios.

## 8. Roll-out

After operator approval:
1. Commit this RFC
2. Update `piko-skill-memory.md §4` and `piko-doc-search.md §6` to point at this RFC
3. Add §0.9 to `v0.1-coding-notes-2026-10-18.md`
4. Commit + push design updates
5. Code `src/skill-prefetch.ts` + tests
6. Wire into `src/pi-runtime.ts:execute()` and `buildSystemPrompt`
7. Re-run existing test sweep + add new prefetch tests
8. Update `scripts/piko-debug-run.ts` task to require skill use without explicit hint
9. Run e2e: mock mem0 + mock graphrag + mlx-serve, observe prefetch calls
10. Commit + push code
11. Update `scripts/v0.1-real-env-verify.sh` to include a "prefetch happened" smoke check

Steps 1-4 = design phase (this RFC + doc updates). Steps 5-11 = code/debug phase.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
