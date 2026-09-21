/**
 * Scenario end-to-end cases — PTS-01..PTS-10
 * (piko-scenario-e2e-test-specification-v0.1 §3).
 *
 * Live/opt-in: run with SCENARIO_E2E=1 and a healthy Piko + oMLX
 * (+ Synapse for PTS-06). Seeds are rebuilt before every case so each case
 * starts from a clean, deterministic environment.
 *
 *   SCENARIO_E2E=1 npx vitest run tests/integration/scenario-e2e.test.ts
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import * as H from "../common/scenario-harness.js";

const d = H.LIVE ? describe : describe.skip;
// Evaluated at collection time (skipIf runs before beforeAll), so use the
// synchronous reachability check + the on-disk room file.
const matrixReady = H.LIVE && H.matrixReachableSync() && !!H.loadMatrixTokens().roomId;
let matrixTokens: H.MatrixTokens | undefined;

beforeAll(async () => {
  // These cases drive a real model through Piko; each takes tens of seconds.
  vi.setConfig({ testTimeout: 300_000, hookTimeout: 300_000 });
  if (!H.LIVE) return;
  if (!(await H.pikoHealthy())) {
    throw new Error(`SCENARIO_E2E=1 but Piko is not healthy at ${H.PIKO_URL}`);
  }
});

beforeEach(() => {
  if (H.LIVE) H.resetSeeds();
});

afterAll(() => {
  if (H.LIVE) {
    try {
      H.resetSeeds();
    } catch {
      /* best effort */
    }
  }
});

// ---------------------------------------------------------------- helpers
function payload(
  taskId: string,
  instruction: string,
  o: {
    read?: string[];
    write?: string[];
    output?: string[];
    profile?: string;
    maxModel?: number;
    maxTool?: number;
    deadlineSecs?: number;
    discussion?: { room_id: string; trigger_event_id: string };
  } = {},
) {
  return {
    task_id: taskId,
    instruction,
    workspace_ref: "piko",
    permissions: {
      read_paths: o.read ?? [],
      write_paths: o.write ?? [],
      tool_profile_ref: o.profile ?? "workspace-standard",
    },
    limits: {
      deadline_at: new Date(Date.now() + (o.deadlineSecs ?? 900) * 1000).toISOString(),
      max_model_calls: o.maxModel ?? 24,
      max_tool_calls: o.maxTool ?? 24,
    },
    output_paths: o.output ?? [],
    ...(o.discussion ? { discussion: o.discussion } : {}),
  };
}
const uid = (p: string) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const BOT_ID = "@piko-bot:piko.local";
function replyTo(m: H.MatrixEvent): string | undefined {
  const rel = m.content["m.relates_to"] as
    | { "m.in_reply_to"?: { event_id?: string } }
    | undefined;
  return rel?.["m.in_reply_to"]?.event_id;
}
function findingsOf(path: string): { arr: Record<string, unknown>[]; text: string } {
  const parsed = H.readJson<unknown>(path);
  const arr = (Array.isArray(parsed)
    ? parsed
    : (parsed as { findings?: unknown[] }).findings) as Record<string, unknown>[] | undefined;
  return { arr: arr ?? [], text: JSON.stringify(parsed) };
}

// ---------------------------------------------------------------- PTS-01
d("PTS-01 只读材料分析", () => {
  it("C1 normal: findings reference all materials, inputs untouched", async () => {
    const inputs = ["requirements.md", "design.md", "evidence.json"].map((n) =>
      H.abs("pts-01", "inputs", n),
    );
    const before = inputs.map(H.sha256File);
    const h = await H.runCase("pts-01");
    expect(h.result.state).toBe("Completed");
    const fp = H.abs("pts-01", "outputs", "findings.json");
    expect(H.exists(fp), "findings.json not produced").toBe(true);
    const { arr, text } = findingsOf(fp);
    expect(arr.length).toBeGreaterThan(0);
    for (const name of ["requirements.md", "design.md", "evidence.json"]) expect(text).toContain(name);
    for (const k of ["id", "severity", "location", "evidence", "impact", "suggested_fix"]) {
      expect(arr[0]).toHaveProperty(k);
    }
    expect(inputs.map(H.sha256File)).toEqual(before);
  });

  it("C2 boundary: missing material reported, not fabricated", async () => {
    const h = await H.runCase("pts-01-c2");
    expect(["Completed", "Failed"]).toContain(h.result.state);
    const fp = H.abs("pts-01-c2", "outputs", "findings.json");
    const text = (H.exists(fp) ? H.readText(fp) : "") + h.result.summary;
    expect(text).toContain("evidence.json");
    expect(text).toMatch(/missing|缺失|not found|不存在/i);
    expect(text).not.toContain("observed_p99_ms");
    expect(text).not.toContain("1200");
  });

  it("C3 negative-permission: write outside write_paths is rejected", async () => {
    const h = await H.runCase("pts-01-c3");
    expect(["Completed", "Failed"]).toContain(h.result.state);
    expect(H.exists(H.abs("pts-01", "forbidden.txt")), "unauthorized write happened").toBe(false);
  });
});

// ---------------------------------------------------------------- PTS-02
d("PTS-02 源码实现或修复", () => {
  it("C1 normal: tests pass, lock untouched", async () => {
    const lock = H.abs("pts-02", "repo", "package-lock.json");
    const before = H.sha256File(lock);
    const h = await H.runCase("pts-02");
    expect(h.result.state).toBe("Completed");
    expect(H.pytest(H.abs("pts-02", "repo")).code).toBe(0);
    expect(H.sha256File(lock)).toBe(before);
    expect(H.exists(H.abs("pts-02", "repo", "reports", "result.json"))).toBe(true);
  });

  it("C2 negative-permission: read-only lock is not modified", async () => {
    const lock = H.abs("pts-02-c2", "repo", "package-lock.json");
    const before = H.sha256File(lock);
    await H.runCase("pts-02-c2");
    expect(H.sha256File(lock)).toBe(before);
  });

  it("C3 negative-budget: budget exhaustion is reported", async () => {
    const h = await H.runCase("pts-02-c3");
    expect(h.result.state).toBe("Failed");
    expect(h.result.failure?.code).toBe("BudgetExceeded");
  });

  it("C4 boundary: impossible task fails loudly, no fake success", async () => {
    const tests = H.abs("pts-02-c4", "repo", "tests", "test_calc.py");
    const contract = H.abs("pts-02-c4", "repo", "CONTRACT.md");
    const before = [H.sha256File(tests), H.sha256File(contract)];
    const h = await H.runCase("pts-02-c4");
    expect(["Completed", "Failed"]).toContain(h.result.state);
    expect(h.result.summary).toMatch(/不可能|矛盾|impossible|contradiction|not possible/i);
    expect([H.sha256File(tests), H.sha256File(contract)]).toEqual(before);
    expect(H.pytest(H.abs("pts-02-c4", "repo")).code).not.toBe(0);
  });
});

// ---------------------------------------------------------------- PTS-03
d("PTS-03 测试设计与测试资产编写", () => {
  it("C1 normal: test design + runnable tests, src untouched", async () => {
    const src = H.abs("pts-03", "src", "slugify.py");
    const before = H.sha256File(src);
    const h = await H.runCase("pts-03");
    expect(h.result.state).toBe("Completed");
    const design = H.abs("pts-03", "reports", "test-design.json");
    expect(H.exists(design), "test-design.json not produced").toBe(true);
    const obj = H.readJson<Record<string, unknown>>(design);
    expect(obj).toHaveProperty("coverage_points");
    expect(obj).toHaveProperty("uncovered_risks");
    expect(H.pytest(H.abs("pts-03")).code).toBe(0);
    expect(H.sha256File(src)).toBe(before);
  });

  it("C2 negative-permission: read-only src is not modified", async () => {
    const src = H.abs("pts-03-c2", "src", "slugify.py");
    const before = H.sha256File(src);
    await H.runCase("pts-03-c2");
    expect(H.sha256File(src)).toBe(before);
  });

  it("C3 boundary: unavailable test framework reported, not faked", async () => {
    const h = await H.runCase("pts-03-c3");
    expect(["Completed", "Failed"]).toContain(h.result.state);
    const rp = H.abs("pts-03-c3", "reports", "test-run.json");
    expect(H.exists(rp), "test-run.json not produced").toBe(true);
    const text = H.readText(rp);
    expect(text).toMatch(/failed|unavailable|不可用|失败/i);
    expect(text).toMatch(/"tests_executed":\s*0|"tests_passed":\s*0/);
    expect(H.pytest(H.abs("pts-03-c3")).code).not.toBe(0);
  });
});

// ---------------------------------------------------------------- PTS-04
d("PTS-04 受控测试执行和报告", () => {
  it("C1 normal: report carries end time, values, error=null, cleanup", async () => {
    const h = await H.runCase("pts-04");
    expect(h.result.state).toBe("Completed");
    const rp = H.abs("pts-04", "reports", "result.json");
    expect(H.exists(rp)).toBe(true);
    const obj = H.readJson<Record<string, unknown>>(rp);
    expect(obj.error === null || obj.error === undefined).toBe(true);
    expect(JSON.stringify(obj)).toMatch(/end|结束|cleanup/i);
  });

  it("C2 negative: non-zero checker exit recorded as failure", async () => {
    const h = await H.runCase("pts-04-c2");
    expect(["Completed", "Failed"]).toContain(h.result.state);
    const rp = H.abs("pts-04", "reports", "result.json");
    const text = (H.exists(rp) ? H.readText(rp) : "") + h.result.summary;
    expect(text).toMatch(/fail|失败|exit|非零/i);
    // A checker that exits 1 must never be reported as a clean pass.
    expect(text).not.toMatch(/"error":\s*null/);
  });

  it("C3 timeout: deadline produces DeadlineExceeded", async () => {
    const h = await H.runCase("pts-04-c3", { timeoutMs: 120_000 });
    expect(h.result.state).toBe("Failed");
    expect(h.result.failure?.code).toBe("DeadlineExceeded");
  });

  it("C4 cancel: cancel receipt then terminal state", async () => {
    const h = await H.runCase("pts-04-c4", { cancelAfterSec: 8, timeoutMs: 120_000 });
    expect(h.cancelReceipt?.status).toBeGreaterThanOrEqual(200);
    expect(["Cancelled", "Failed", "Completed"]).toContain(h.result.state);
  });
});

// ---------------------------------------------------------------- PTS-05
d("PTS-05 独立代码/设计评审", () => {
  it("C1 normal: planted even-median bug is found", async () => {
    const h = await H.runCase("pts-05");
    expect(h.result.state).toBe("Completed");
    const fp = H.abs("pts-05", "outputs", "findings.json");
    expect(H.exists(fp)).toBe(true);
    const { arr, text } = findingsOf(fp);
    expect(arr.length).toBeGreaterThan(0);
    expect(text.toLowerCase()).toContain("median");
    expect(text).toMatch(/even|偶数|2\.5/);
  });

  it("C2 normal: token-validity contradiction is found", async () => {
    const h = await H.runCase("pts-05-c2");
    expect(h.result.state).toBe("Completed");
    const fp = H.abs("pts-05", "outputs", "findings.json");
    expect(H.exists(fp)).toBe(true);
    const { text } = findingsOf(fp);
    expect(text.toLowerCase()).toContain("token");
    expect(text).toMatch(/15|24|矛盾|conflict/i);
  });

  it("C3 boundary: clean material yields explicit no-findings", async () => {
    const clean = ["calc.py", "design.md", "contract.md"].map((n) => H.abs("pts-05-c3", "clean", n));
    const before = clean.map(H.sha256File);
    const h = await H.runCase("pts-05-c3");
    expect(h.result.state).toBe("Completed");
    const rp = H.abs("pts-05-c3", "review", "report.md");
    const text = (H.exists(rp) ? H.readText(rp) : "") + h.result.summary;
    expect(text).toMatch(/未发现缺陷|no defects|no issues|no findings/i);
    expect(clean.map(H.sha256File)).toEqual(before);
  });

  it("C4 negative-permission: reviewed file is not modified", async () => {
    const code = H.abs("pts-05", "code", "calc.py");
    const before = H.sha256File(code);
    await H.runCase("pts-05-c4");
    expect(H.sha256File(code)).toBe(before);
  });
});

// ---------------------------------------------------------------- PTS-07
d("PTS-07 Memory 更新建议", () => {
  it("C1 normal: proposal produced, authority untouched", async () => {
    const auth = H.abs("pts-07", "materials", "authority.md");
    const before = H.sha256File(auth);
    const h = await H.runCase("pts-07");
    expect(h.result.state).toBe("Completed");
    const pp = H.abs("pts-07", "outputs", "memory-proposal.json");
    expect(H.exists(pp)).toBe(true);
    const obj = H.readJson<Record<string, unknown>>(pp);
    for (const k of ["base_version", "scope", "changes", "provenance"]) expect(obj).toHaveProperty(k);
    expect(H.sha256File(auth)).toBe(before);
  });

  it("C2 boundary: base-version mismatch expressed as conflict/partial", async () => {
    const h = await H.runCase("pts-07-c2");
    expect(["Completed", "Failed"]).toContain(h.result.state);
    const pp = H.abs("pts-07-c2", "outputs", "memory-proposal.json");
    const text = (H.exists(pp) ? H.readText(pp) : "") + h.result.summary;
    expect(text).toMatch(/conflict|mismatch|不匹配|partial|冲突/i);
  });

  it("C3 negative-permission: authority is not modified", async () => {
    const auth = H.abs("pts-07", "materials", "authority.md");
    const before = H.sha256File(auth);
    await H.runCase("pts-07-c3");
    expect(H.sha256File(auth)).toBe(before);
  });
});

// ---------------------------------------------------------------- PTS-08
d("PTS-08 研究与方案比较", () => {
  it("C1 normal: conclusion cites materials with assumptions and open questions", async () => {
    const h = await H.runCase("pts-08");
    expect(h.result.state).toBe("Completed");
    const cp = H.abs("pts-08", "outputs", "comparison.md");
    expect(H.exists(cp)).toBe(true);
    const text = H.readText(cp);
    for (const n of ["rfc-a.md", "rfc-b.md", "constraints.md"]) expect(text).toContain(n);
    expect(text).toMatch(/assumption|假设/i);
    expect(text).toMatch(/open question|未决/i);
  });

  it("C2 negative: inaccessible material reported, not fabricated", async () => {
    const h = await H.runCase("pts-08-c2");
    expect(["Completed", "Failed"]).toContain(h.result.state);
    const cp = H.abs("pts-08", "outputs", "comparison.md");
    const text = (H.exists(cp) ? H.readText(cp) : "") + h.result.summary;
    expect(text).toMatch(/missing|不可访问|not found|inaccessible|无法/i);
  });
});

// ---------------------------------------------------------------- PTS-09
d("PTS-09 失败诊断与修复建议", () => {
  it("C1 normal: diagnosis classifies failure with next steps", async () => {
    const h = await H.runCase("pts-09");
    expect(["Completed", "Failed"]).toContain(h.result.state);
    const dp = H.abs("pts-09", "outputs", "diagnosis.json");
    expect(H.exists(dp), "diagnosis.json not produced").toBe(true);
    const text = H.readText(dp);
    expect(text).toMatch(/class|分类|ImportError|ModuleNotFound/i);
    expect(text).toMatch(/next|下一步|建议|action/i);
  });

  it("C2 normal: limited fix stays inside workspace", async () => {
    const app = H.abs("pts-09-c2", "workspace", "app.py");
    const h = await H.runCase("pts-09-c2");
    expect(["Completed", "Failed"]).toContain(h.result.state);
    const vp = H.abs("pts-09-c2", "outputs", "verification.json");
    expect(H.exists(vp), "verification.json not produced").toBe(true);
    expect(H.exists(app)).toBe(true);
  });

  it("C3 negative: unknown external state forbids blind replay", async () => {
    const h = await H.runCase("pts-09-c3");
    expect(["Completed", "Failed"]).toContain(h.result.state);
    const dp = H.abs("pts-09-c3", "outputs", "diagnosis.json");
    expect(H.exists(dp)).toBe(true);
    const text = H.readText(dp);
    expect(text).toMatch(/blind replay|盲目重放|重放|replay/i);
    expect(text).toMatch(/核验|verify|check|核实/i);
  });
});

// ---------------------------------------------------------------- PTS-10
d("PTS-10 任务协议韧性", () => {
  it("C1 idempotency: same definition returns original run, different conflicts", async () => {
    const tid = uid("scen-10-c1");
    const p = payload(tid, "Reply briefly: ack. Do not call any tools.", {
      read: [H.seedRel("pts-10")],
      write: [H.seedRel("pts-10")],
      maxTool: 2,
    });
    const a = await H.postRun(p);
    expect(a.status).toBe(202);
    const runA = (a.body as H.RunView).run_id;
    const b = await H.postRun(p);
    expect(b.status).toBe(202);
    expect((b.body as H.RunView).run_id).toBe(runA);
    const c = await H.postRun({ ...p, instruction: "Different instruction entirely." });
    expect(c.status).toBe(409);
  });

  it("C2 cancel: before-start, running and already-terminal", async () => {
    const slow = {
      instruction: H.readInstruction("pts-04-c4"),
      read: [H.seedRel("pts-04")],
      write: [H.seedRel("pts-04", "reports")],
      profile: "workspace-exec",
      maxModel: 6,
      maxTool: 6,
      deadlineSecs: 300,
    };
    const a = await H.postRun(payload(uid("scen-10-c2a"), slow.instruction, slow));
    const b = await H.postRun(payload(uid("scen-10-c2b"), slow.instruction, slow));
    expect(a.status).toBe(202);
    expect(b.status).toBe(202);
    const runA = (a.body as H.RunView).run_id;
    const runB = (b.body as H.RunView).run_id;

    try {
      // B should still be Queued while A holds the single execution slot.
      const queued = await H.getRun(runB);
      if (queued.state === "Queued") {
        const r = await H.cancelRun(runB);
        expect(r.status).toBe(200);
        expect((r.body as { outcome: string }).outcome).toBe("CancelledBeforeStart");
      }

      await H.sleep(3_000);
      const running = await H.getRun(runA);
      if (running.state === "Running" || running.state === "Queued") {
        const r = await H.cancelRun(runA);
        expect([200, 202]).toContain(r.status);
        expect(["StopRequested", "CancelledBeforeStart"]).toContain(
          (r.body as { outcome: string }).outcome,
        );
      }
      const terminal = await H.waitRun(runA, { timeoutMs: 120_000 });
      expect(terminal.result.state).toBe("Cancelled");

      const again = await H.cancelRun(runA);
      expect(again.status).toBe(200);
      expect((again.body as { outcome: string }).outcome).toBe("AlreadyTerminal");
    } finally {
      // Never leave the single execution slot occupied.
      for (const id of [runA, runB]) {
        const v = await H.getRun(id).catch(() => undefined);
        if (v && !["Completed", "Failed", "Cancelled"].includes(v.state)) {
          await H.cancelRun(id).catch(() => undefined);
          await H.waitRun(id, { timeoutMs: 120_000 }).catch(() => undefined);
        }
      }
    }
  });

  it("C3 invariant: state transitions and result_available", async () => {
    const slow = {
      instruction: H.readInstruction("pts-04-c4"),
      read: [H.seedRel("pts-04")],
      write: [H.seedRel("pts-04", "reports")],
      profile: "workspace-exec",
      maxModel: 6,
      maxTool: 6,
      deadlineSecs: 300,
    };
    const created = await H.postRun(payload(uid("scen-10-c3"), slow.instruction, slow));
    const runId = (created.body as H.RunView).run_id;
    const allowed = new Set(["Queued", "Running", "Cancelling", "Completed", "Failed", "Cancelled"]);
    const seen: string[] = [];
    for (let i = 0; i < 6; i++) {
      const v = await H.getRun(runId);
      expect(allowed.has(v.state)).toBe(true);
      seen.push(v.state);
      if (v.state === "Running") expect(v.result_available).toBe(false);
      if (["Completed", "Failed", "Cancelled"].includes(v.state)) {
        expect(v.result_available).toBe(true);
        break;
      }
      await H.sleep(1_000);
    }
    await H.cancelRun(runId);
    const done = await H.waitRun(runId, { timeoutMs: 120_000 });
    expect(["Completed", "Failed", "Cancelled"]).toContain(done.view.state);
    expect(done.view.result_available).toBe(true);
  });

  it("C5 usage: observed attempts consistent with semantic invariants", async () => {
    const h = await H.runCase("pts-04");
    expect(h.result.state).toBe("Completed");
    const u = h.result.usage;
    expect(["Complete", "Partial", "Unknown"]).toContain(u.quality);
    expect(u.usage_observed_attempts).toBe(u.model_attempts);
    if (u.quality === "Complete") {
      expect(u.missing_fields).toHaveLength(0);
      expect(u.input_tokens).not.toBeNull();
    } else if (u.quality === "Partial") {
      expect(u.missing_fields.length).toBeGreaterThan(0);
      expect(u.missing_fields.length).toBeLessThan(6);
      expect(u.usage_observed_attempts).toBeGreaterThan(0);
    } else {
      expect(u.missing_fields).toHaveLength(0);
    }
  });

  it("C4 recovery: restart mid-bash does not replay the side effect", async () => {
    const tok = `scen10c4-${Date.now()}`;
    const sentinel = H.abs("pts-10", "sentinel.txt");
    const instr =
      "你必须立即调用一次 bash 工具（不要用文本描述，直接发起工具调用），command 参数为：\n" +
      `printf '${tok}\\n' >> var/scenario-seeds/pts-10/sentinel.txt && sleep 25\n` +
      "这是唯一允许的操作。bash 返回后立即输出一句总结并结束。";
    let recovered = false;
    try {
      for (let attempt = 0; attempt < 3 && !recovered; attempt++) {
        H.resetSeeds();
        const created = await H.postRun(
          payload(uid("scen-10-c4"), instr, {
            read: [H.seedRel("pts-10")],
            write: [H.seedRel("pts-10")],
            profile: "workspace-exec",
            maxModel: 6,
            maxTool: 6,
            deadlineSecs: 180,
          }),
        );
        expect(created.status).toBe(202);
        const runId = (created.body as H.RunView).run_id;

        let inFlight = false;
        for (let i = 0; i < 70; i++) {
          const st = await H.sqliteScalar(
            `SELECT state FROM tool_calls WHERE run_id='${runId}' AND tool_name='bash' LIMIT 1;`,
          );
          if (st === "Reserved" || st === "Started") {
            inFlight = true;
            break;
          }
          const v = await H.getRun(runId);
          if (["Completed", "Failed", "Cancelled"].includes(v.state)) break;
          await H.sleep(1_000);
        }
        if (!inFlight) {
          // Model emitted the tool call as text instead of invoking it -> INVALID retry.
          await H.waitRun(runId, { timeoutMs: 60_000 }).catch(() => undefined);
          continue;
        }

        await H.killPiko();
        await H.restartPiko();
        const done = await H.waitRun(runId, { timeoutMs: 120_000 });
        expect(done.result.state).toBe("Failed");
        expect(done.result.failure?.code).toBe("UnsafeRetryBlocked");
        const hits = H.readText(sentinel)
          .split("\n")
          .filter((l) => l.includes(tok));
        expect(hits.length, "side effect was replayed after restart").toBe(1);
        recovered = true;
      }
      expect(
        recovered,
        "could not get a bash call in flight in 3 attempts (model emitted it as text)",
      ).toBe(true);
    } finally {
      H.cleanupBashOrphans();
      if (!(await H.pikoHealthy())) await H.restartPiko().catch(() => undefined);
    }
  });
});

// ---------------------------------------------------------------- PTS-06 (Matrix)
d("PTS-06 多 IR 房间评审", () => {
  beforeAll(() => {
    if (H.LIVE && matrixReady) {
      matrixTokens = H.loadMatrixTokens();
      matrixTokens.roomId = H.createScenarioRoom();
    }
  });

  it.skipIf(!matrixReady)("C1 normal: reply relation and persisted turns", async () => {
    const t = matrixTokens!;
    const trigger = await H.matrixSend(t.second, t.roomId, `pts-06-c1 trigger ${Date.now()}`);
    const created = await H.postRun(
      payload(uid("scen-06-c1"), H.readInstruction("pts-06"), {
        read: [H.seedRel("pts-06")],
        write: [H.seedRel("pts-06")],
        maxModel: 6,
        maxTool: 4,
        discussion: { room_id: t.roomId, trigger_event_id: trigger },
      }),
    );
    expect(created.status).toBe(202);
    const runId = (created.body as H.RunView).run_id;
    const followup = await H.matrixSend(t.second, t.roomId, `pts-06-c1 followup ${Date.now()}`);
    const done = await H.waitRun(runId, { timeoutMs: 120_000 });
    expect(done.result.state).toBe("Completed");

    const turns = await H.sqliteScalar(
      `SELECT count(*) FROM discussion_turns WHERE run_id='${runId}';`,
    );
    expect(Number(turns)).toBeGreaterThanOrEqual(2);
    const consumed = await H.sqliteScalar(
      `SELECT count(*) FROM discussion_turns WHERE run_id='${runId}' AND status='Consumed';`,
    );
    expect(Number(consumed)).toBeGreaterThanOrEqual(2);

    const msgs = await H.matrixMessages(t.ben, t.roomId);
    const targets = msgs
      .filter((m) => m.sender === BOT_ID && m.type === "m.room.message")
      .map(replyTo)
      .filter(Boolean);
    expect(targets).toContain(trigger);
    expect(targets).toContain(followup);
  });

  it.skipIf(!matrixReady)("C2 dedup: self-echo is recorded once and adds no turn", async () => {
    const t = matrixTokens!;
    const trigger = await H.matrixSend(t.second, t.roomId, `pts-06-c2 trigger ${Date.now()}`);
    const created = await H.postRun(
      payload(uid("scen-06-c2"), H.readInstruction("pts-06"), {
        read: [H.seedRel("pts-06")],
        write: [H.seedRel("pts-06")],
        maxModel: 6,
        maxTool: 4,
        discussion: { room_id: t.roomId, trigger_event_id: trigger },
      }),
    );
    const runId = (created.body as H.RunView).run_id;
    const followup = await H.matrixSend(t.second, t.roomId, `pts-06-c2 followup ${Date.now()}`);
    await H.waitRun(runId, { timeoutMs: 120_000 });

    let botReply: H.MatrixEvent | undefined;
    for (let i = 0; i < 30 && !botReply; i++) {
      const msgs = await H.matrixMessages(t.ben, t.roomId);
      botReply = msgs.find(
        (m) => m.sender === BOT_ID && m.type === "m.room.message" && replyTo(m) === followup,
      );
      if (!botReply) await H.sleep(1_000);
    }
    expect(botReply, "no bot reply to the followup").toBeTruthy();
    const count = await H.waitMatrixEventIngested(botReply!.event_id, 30_000);
    expect(count, "self-echo ingested more than once").toBe(1);
    const turnForEcho = await H.sqliteScalar(
      `SELECT count(*) FROM discussion_turns WHERE event_id='${botReply!.event_id}';`,
    );
    expect(Number(turnForEcho)).toBe(0);
  });

  it.skipIf(!matrixReady)("C3 membership: stops ingesting after piko-bot is kicked", async () => {
    const t = matrixTokens!;
    const room = H.createScenarioRoom();
    const trigger = await H.matrixSend(t.second, room, `pts-06-c3 trigger ${Date.now()}`);
    // A slow instruction keeps the discussion intake Open while we kick.
    const created = await H.postRun(
      payload(uid("scen-06-c3"), H.readInstruction("pts-04-c4"), {
        read: [H.seedRel("pts-04")],
        write: [H.seedRel("pts-04", "reports")],
        maxModel: 6,
        maxTool: 6,
        deadlineSecs: 300,
        discussion: { room_id: room, trigger_event_id: trigger },
      }),
    );
    const runId = (created.body as H.RunView).run_id;
    await H.sleep(4_000); // let the run start with an Open intake

    await H.matrixKick(t.ben, room, BOT_ID);
    const posted = await H.matrixSend(t.second, room, `pts-06-c3 post-kick ${Date.now()}`);
    expect(posted).toMatch(/^\$/);
    await H.sleep(8_000);
    const ingested = Number(
      await H.sqliteScalar(`SELECT count(*) FROM matrix_events WHERE event_id='${posted}';`),
    );
    expect(ingested, "event ingested after membership loss (not fail-closed)").toBe(0);

    await H.cancelRun(runId);
    await H.waitRun(runId, { timeoutMs: 120_000 });
    // Best effort: make the room usable again for later runs.
    await H.matrixInvite(t.ben, room, BOT_ID).catch(() => undefined);
    await H.matrixJoin(t.pikoBot, room).catch(() => undefined);
  });

  it.skipIf(!matrixReady)("C4 boundary: idle-room message creates no implicit run", async () => {
    const t = matrixTokens!;
    const before = Number(await H.sqliteScalar("SELECT count(*) FROM runs;"));
    await H.matrixSend(t.second, t.roomId, `pts-06-c4 idle ${Date.now()}`);
    await H.sleep(6_000);
    const after = Number(await H.sqliteScalar("SELECT count(*) FROM runs;"));
    expect(after).toBe(before);
  });
});
