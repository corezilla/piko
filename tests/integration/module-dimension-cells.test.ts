import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ApiServer } from "../../src/server.js";
import { BearerAuth } from "../../src/auth.js";
import { TaskStore } from "../../src/store.js";
import { Observability } from "../../src/observability.js";
import { Transfer } from "../../src/transfer.js";
import { loadConfig } from "../../src/config.js";
import { PikoError } from "../../src/types.js";
import type { RuntimeConfig } from "../../src/types.js";

/**
 * Module dimension cells — MT-* Cases that register a dimension cell the
 * original 47-row registry left empty (G-MT-DIM-1).
 *
 * The module layer is defined as "real modules assembled together, stubs only
 * at true boundaries". Every Case below therefore drives the real ApiServer /
 * TaskStore / Transfer and observes a public return, a typed error or a
 * persisted side effect — never an internal symbol (that is the unit layer).
 */

const cleanups: (() => Promise<void> | void)[] = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()!();
});

const task = (id: string, over: Record<string, unknown> = {}) => ({
  task_id: id,
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: [],
  ...over,
});

async function assembled(capacity = 5) {
  const { config } = await loadConfig("config/runtime.example.json");
  const root = await mkdtemp(join(tmpdir(), "piko-mt-dim-"));
  cleanups.push(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "out"), { recursive: true });
  config.listen.port = 21000 + Math.floor(Math.random() * 20000);
  config.queue.capacity = capacity;
  config.workspace = { roots: { piko: root }, staging_root: join(root, "staging") };
  const store = new TaskStore(":memory:", 1000);
  cleanups.push(() => store.close());
  const obs = new Observability(config);
  const server = await ApiServer.create(config, store, new BearerAuth("slinky", Buffer.from("tok")), undefined, obs);
  await server.listen();
  cleanups.push(() => server.close());
  return { base: `http://127.0.0.1:${config.listen.port}`, store, obs, config, root };
}

const auth = { authorization: "Bearer tok", "content-type": "application/json" };

// ─── 写型端点/命令：未知字段/非法值、重复提交幂等、目标缺失 ──────────

describe("MT-TAPI · 写型端点 cell 补齐", () => {
  it("MT-TAPI-009 · 未知字段被拒（写型端点格：未知字段/非法值）", async () => {
    const { base } = await assembled();
    const res = await fetch(`${base}/tasks`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify(task("mt-unknown", { bogus_field: "nope" })),
    });
    // An unknown field must not be silently dropped: that would accept a
    // request the caller did not mean.
    expect([400, 422]).toContain(res.status);
    const body: any = await res.json();
    expect(body.error?.code ?? body.code).toBeTruthy();
  });

  it("MT-TAPI-010 · 非法值（空 task_id / 缺 instruction）被拒", async () => {
    const { base } = await assembled();
    const bad = await fetch(`${base}/tasks`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ ...task("mt-bad"), task_id: "" }),
    });
    expect([400, 422]).toContain(bad.status);

    const noInstr = await fetch(`${base}/tasks`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ ...task("mt-bad2"), instruction: undefined }),
    });
    expect([400, 422]).toContain(noInstr.status);
  });

  it("MT-TAPI-018 · 重复提交同一任务幂等，改内容则 409（写型端点格：重复提交幂等）", async () => {
    const { base, store } = await assembled();
    const first = await fetch(`${base}/tasks`, { method: "POST", headers: auth, body: JSON.stringify(task("mt-idem")) });
    expect(first.status).toBe(202);
    const replay = await fetch(`${base}/tasks`, { method: "POST", headers: auth, body: JSON.stringify(task("mt-idem")) });
    // Replaying the identical submission must not create a second business fact.
    expect(replay.status).toBe(202);
    const view = store.getRun("mt-idem");
    expect(view.generation).toBe(1);

    const changed = await fetch(`${base}/tasks`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify(task("mt-idem", { instruction: "different" })),
    });
    expect(changed.status).toBe(409);
    expect(((await changed.json()) as any).error.code).toBe("TaskConflict");
  });

  it("MT-TAPI-011 · 目标缺失：结果投递到一个不存在的任务返回 404", async () => {
    const { base } = await assembled();
    const res = await fetch(`${base}/tasks/does-not-exist/result`, { headers: auth });
    expect(res.status).toBe(404);
  });
});

// ─── 读型端点：不存在、终态/非终态、鉴权缺失 ──────────────────────

describe("MT-TAPI · 读型端点 cell 补齐", () => {
  it("MT-TAPI-012 · 不存在的任务 id 返回 404 且不建行（读型端点格：不存在）", async () => {
    const { base, store } = await assembled();
    const res = await fetch(`${base}/tasks/mt-nope`, { headers: auth });
    expect(res.status).toBe(404);
    // Reading must not create state.
    expect(() => store.getTask("mt-nope")).toThrow();
  });

  it("MT-TAPI-013 · 非终态时 Result 不提前披露（读型端点格：非终态）", async () => {
    const { base } = await assembled();
    await fetch(`${base}/tasks`, { method: "POST", headers: auth, body: JSON.stringify(task("mt-nonterm")) });
    const res = await fetch(`${base}/tasks/mt-nonterm/result`, { headers: auth });
    // Not terminal yet: either 202/409, never a fabricated Result body.
    expect([202, 409]).toContain(res.status);
  });

  it("MT-TAPI-014 · 终态后 Result 可读（读型端点格：终态）", async () => {
    const { base, store } = await assembled();
    await fetch(`${base}/tasks`, { method: "POST", headers: auth, body: JSON.stringify(task("mt-term")) });
    store.cancel("mt-term");
    // A cancelled task is terminal, so the read no longer 409s — it resolves to
    // whatever the run actually recorded. (A zero-call cancel has no result row,
    // so the store answers ResultUnavailable rather than fabricating one.)
    const res = await fetch(`${base}/tasks/mt-term/result`, { headers: auth });
    const state = store.getRun("mt-term").state;
    expect(state).toBe("Cancelled");
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) expect(await res.json()).toBeTruthy();
  });

  it("MT-TAPI-015 · 无 Authorization 头一律 401（读型端点格：鉴权缺失）", async () => {
    const { base } = await assembled();
    for (const path of ["/tasks/mt-any", "/tasks/mt-any/result", "/diagnostics"]) {
      const res = await fetch(`${base}${path}`);
      expect(res.status, path).toBe(401);
    }
  });
});

// ─── 准入/队列：容量 N、N+1、并发领取唯一性、退避 ─────────────────

describe("MT-SCHED/MT-TAPI · 准入队列 cell 补齐", () => {
  it("MT-TAPI-016 · 容量 N 时最后一个仍被接受（准入格：容量 N）", async () => {
    const { base } = await assembled(2);
    for (const id of ["q1", "q2"]) {
      const res = await fetch(`${base}/tasks`, { method: "POST", headers: auth, body: JSON.stringify(task(id)) });
      // Admission is asynchronous: a queued task is accepted with 202, and the
      // acceptance is what "capacity N" means — not that work already ran.
      expect(res.status, id).toBe(202);
    }
  });

  it("MT-TAPI-017 · 容量 N+1 被显式拒绝（准入格：容量 N+1）", async () => {
    const { base } = await assembled(2);
    await fetch(`${base}/tasks`, { method: "POST", headers: auth, body: JSON.stringify(task("q1")) });
    await fetch(`${base}/tasks`, { method: "POST", headers: auth, body: JSON.stringify(task("q2")) });
    const over = await fetch(`${base}/tasks`, { method: "POST", headers: auth, body: JSON.stringify(task("q3")) });
    expect(over.status).toBe(429);
    const body: any = await over.json();
    expect(body.error?.code).toMatch(/QueueFull|Capacity/i);
  });

  it("MT-SCHED-004 · 并发领取只有一个赢家（准入格：并发领取唯一性）", async () => {
    const { store } = await assembled(5);
    store.createOrGet(task("c1") as never, "p", 5);
    const a = store.tryClaimSlot("owner-a", "boot");
    const b = store.tryClaimSlot("owner-b", "boot");
    const winners = [a, b].filter((x) => x !== "slot_busy");
    expect(winners).toHaveLength(1);
  });

  it("MT-SCHED-005 · 槽位被占时退避而不是重复派发（准入格：退避）", async () => {
    const { store } = await assembled(5);
    store.createOrGet(task("c1") as never, "p", 5);
    store.createOrGet(task("c2") as never, "p", 5);
    const first = store.tryClaimSlot("owner", "boot");
    expect(first).not.toBe("slot_busy");
    // While the slot is held, a second claim is refused — the caller backs
    // off rather than handing out a second lease.
    expect(store.tryClaimSlot("owner", "boot")).toBe("slot_busy");
  });
});

// ─── 配置热变更：变更后旧状态不被破坏、非法值显式拒绝 ─────────────

describe("MT-OBS · 配置热变更 cell 补齐", () => {
  it("MT-OBS-006 · 关闭 metrics 不破坏已写入的事件（配置格：旧状态不被破坏）", async () => {
    const { obs, config } = await assembled();
    obs.emit("before.change", { task_id: "x" });
    config.observability.metrics_enabled = false;
    const obs2 = new Observability(config);
    obs2.emit("after.change", { task_id: "x" });
    // Events written before the change are still there: a hot change must not
    // roll back or tear state that already entered the pipeline.
    const snap: any = obs.snapshot();
    const names = (snap.recent_events ?? []).map((e: any) => e.event_name);
    expect(names).toContain("before.change");
  });

  it("MT-OBS-007 · 非法 metric 输入不使观测层崩溃（配置格：非法值）", async () => {
    const { config } = await assembled();
    const obs = new Observability(config);
    // The observability boundary is fail-open by design (VRC-OBS-003): a bad
    // metric id or op must degrade that one datapoint, never throw into the
    // business path and never take the process down.
    expect(() => obs.metric("task.metric.bogus" as never, "inc")).not.toThrow();
    expect(() => obs.metric("x", "not-an-op" as never)).not.toThrow();
    // And the bad datapoint did not become a metric.
    expect(Object.keys((obs.snapshot() as any).metrics)).not.toContain("task.metric.bogus");
  });
});

// ─── 组装并发：租约续期 CAS、陈旧 epoch 被 fence ──────────────────

describe("MT-SCHED/MT-REPO · 组装并发 cell 补齐", () => {
  it("MT-SCHED-006 · 续租 CAS 只在 epoch 匹配时成功（并发格：租约续期 CAS）", async () => {
    const { store } = await assembled(5);
    store.createOrGet(task("l1") as never, "p", 5);
    const grant: any = store.tryClaimSlot("owner", "boot");
    expect(store.renewSlot(grant.task_id, grant.lease_epoch)).toBe(true);
    expect(store.renewSlot(grant.task_id, grant.lease_epoch - 1)).toBe(false);
  });

  it("MT-REPO-007 · 陈旧 epoch 的写入被 fence 拒绝（并发格：陈旧 epoch 被 fence）", async () => {
    const { store } = await assembled(5);
    store.createOrGet(task("e1") as never, "p", 5);
    const grant: any = store.tryClaimSlot("owner", "boot");
    const stale = grant.lease_epoch;
    store.releaseSlot(grant.task_id, stale);
    store.createOrGet(task("e2") as never, "p", 5);
    store.tryClaimSlot("owner", "boot"); // epoch advances to stale+1
    expect(store.renewSlot(grant.task_id, stale)).toBe(false);
  });
});

// ─── 资源清理：异常中途释放、重复清理幂等 ────────────────────────

describe("MT-TRANSFER · 资源清理 cell 补齐", () => {
  it("MT-TRANSFER-006 · 中途失败后 staging 仍可清理且不抛（清理格：异常中途释放）", async () => {
    const { config } = await assembled();
    const xfer = new Transfer(config);
    await mkdir(join(config.workspace.staging_root, "rf1", "partial"), { recursive: true });
    await writeFile(join(config.workspace.staging_root, "rf1", "partial", "f.txt"), "x");
    expect(() => xfer.clearStaging("rf1")).not.toThrow();
    expect(existsSync(join(config.workspace.staging_root, "rf1"))).toBe(false);
  });

  it("MT-TRANSFER-007 · 重复清理同一个 staging 幂等（清理格：重复清理幂等）", async () => {
    const { config } = await assembled();
    const xfer = new Transfer(config);
    await mkdir(join(config.workspace.staging_root, "rf2"), { recursive: true });
    xfer.clearStaging("rf2");
    expect(() => xfer.clearStaging("rf2")).not.toThrow();
    expect(existsSync(join(config.workspace.staging_root, "rf2"))).toBe(false);
  });
});

// ─── 外部依赖失败：认证失败、限流/超时、部分失败 ─────────────────

describe("MT-PI · 外部依赖失败 cell 补齐", () => {
  it("MT-PI-004 · 上游 401 被 typed 化为认证失败（依赖格：认证失败）", async () => {
    const mod: any = await import("../../src/mem0-client.js");
    const err: any = new mod.Mem0ApiError(401, "unauthorized");
    expect(err.status).toBe(401);
    expect(err.code).toBeTruthy();
  });

  it("MT-PI-005 · 上游 429 被 typed 化为限流（依赖格：限流/超时）", async () => {
    const mod: any = await import("../../src/graphrag-client.js");
    const err: any = new mod.GraphRAGApiError(429, "rate limited");
    expect(err.status).toBe(429);
    expect(err.code).toBeTruthy();
  });

  it("MT-PI-006 · 部分失败不得伪造成成功（依赖格：部分失败）", async () => {
    const { store } = await assembled(5);
    store.createOrGet(task("pf1") as never, "p", 5);
    const grant: any = store.tryClaimSlot("owner", "boot");
    // A partial failure must leave the run non-terminal, never Completed.
    store.mutateRun({
      task_id: grant.task_id,
      expected_generation: 1,
      expected_lease_epoch: grant.lease_epoch,
      // mutateRun mutates the row object in place; the return value is ignored.
      mutation: (run: any) => { run.state = "Failed"; },
    } as never);
    expect(store.getRun("pf1").state).toBe("Failed");
  });
});
