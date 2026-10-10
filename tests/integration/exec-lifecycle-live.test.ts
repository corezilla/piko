/**
 * ST-EXEC-001 — the minimal complete live chain, end to end:
 * submit -> execute -> produce artifacts -> terminal Result.
 *
 * This is the entry that was missing for `ENV-LIVE-LLM` (gap `G-ENV-001`).
 * It drives a real model through a real Piko instance (oMLX) and asserts the
 * terminal `AgentResult`, not merely that "something ran".
 *
 * Live/opt-in — run with:
 *   SCENARIO_E2E=1 npx vitest run --config vitest.live.config.ts \
 *     tests/integration/exec-lifecycle-live.test.ts
 *
 * It is registered in vitest.live.config.ts alongside the scenario and Matrix
 * suites and is skipped entirely when no live Piko/LLM is reachable.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import * as H from "../common/scenario-harness.js";

const d = H.LIVE ? describe : describe.skip;

d("ST-EXEC-001 submit -> execute -> artifacts -> terminal Result (live)", () => {
  beforeAll(() => {
    // A real model call takes tens of seconds; do not race the default timeout.
    vi.setConfig({ testTimeout: 300_000, hookTimeout: 300_000 });
  });

  it("C1 normal: a real task reaches Completed with an output artifact and a frozen Result", async () => {
    const caseName = "exec-lifecycle";
    H.resetSeeds();

    const started = Date.now();
    const handle = await H.runCase(caseName, {
      taskId: `st-exec-001-${Date.now()}`,
      instruction:
        "Read README.md in the current directory and write exactly one line describing the project into out/summary.md. " +
        "Do not read or write anything else.",
    });
    const elapsedMs = Date.now() - started;

    // Terminal state is reached through the public polling API.
    expect(handle.view.state).toBe("Completed");
    expect(elapsedMs).toBeGreaterThan(0);

    // A real Result exists -- not a fabricated zero-call success.
    const result = handle.result;
    expect(result.task_id).toBe(handle.task_id);
    expect(result.state).toBe("Completed");
    expect(result.failure).toBeNull();
    expect(result.partial).toBe(false);
    expect(result.summary.trim().length).toBeGreaterThan(0);

    // The task really ran: model attempts were made and usage was observed.
    expect(result.usage.model_attempts).toBeGreaterThan(0);
    expect(result.usage.usage_observed_attempts).toBeGreaterThan(0);
    expect(result.usage.quality).not.toBe("Unknown");

    // Every declared output was produced, recorded with a digest, and is readable.
    const declared = H.readParams(caseName).output;
    expect(declared.length).toBeGreaterThan(0);
    expect(result.outputs.length).toBeGreaterThan(0);
    for (const rel of declared) {
      const abs = H.abs(caseName, rel);
      expect(H.exists(abs)).toBe(true);
      const recorded = result.outputs.find((o) => o.path.endsWith(rel));
      expect(recorded, `output ${rel} must be reported in the Result`).toBeTruthy();
      expect(recorded!.sha256).toBe(H.sha256File(abs));
      expect(H.readText(abs).trim().length).toBeGreaterThan(0);
    }

    // Result stays frozen and retrievable once the task is terminal.
    const again = await H.getResult(handle.task_id);
    expect(again.state).toBe(result.state);
    expect(JSON.stringify(again.outputs)).toBe(JSON.stringify(result.outputs));
  });

  it("C2 boundary: the same task_id with a different definition is a conflict, never a silent overwrite", async () => {
    const caseName = "exec-lifecycle";
    const taskId = `st-exec-001-conflict-${Date.now()}`;
    const payload = {
      task_id: taskId,
      instruction: "Write the single word alpha into out/summary.md and do nothing else.",
      workspace_ref: "piko",
      permissions: { read_paths: [], write_paths: H.readParams(caseName).write, tool_profile_ref: "workspace-exec" },
      output_paths: H.readParams(caseName).output,
    };
    const first = await H.postRun(payload);
    expect(first.status).toBe(202);

    const changed = await H.postRun({ ...payload, instruction: "Write the single word beta into out/summary.md." });
    expect(changed.status).toBe(409);
    expect((changed.body as { error?: { code?: string } }).error?.code).toBe("TaskConflict");
  });
});