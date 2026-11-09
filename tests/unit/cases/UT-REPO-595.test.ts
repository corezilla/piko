/**
 * Case ID: UT-REPO-595  ·  STATUS: real
 *
 * 责任：状态写 L750 → `db`（store.ts）
 * 维度坐标：`publishResult` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-595.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { TaskStore, asReader } from "../../../src/store.js";
import {
  accept,
  acceptDiscussion,
  discussionTask,
  newStore,
  rawUsageSample,
  result,
  task,
} from "./support/repo-fix.js";
import type { AgentResult } from "../../../src/types.js";

describe("UT-REPO-595 · publishResult · 持久化/序列化 × round-trip", () => {

  it("persists the generation increment written by publishResult", async () => {
    const { mkdtempSync, rmSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = mkdtempSync(join(tmpdir(), "piko-repo-595-"));
    const path = join(dir, "store.sqlite");
    const store = new TaskStore(path, 1000);
    let closed = false;
    try {
      // 步骤 1：构造使 store.ts:750 对 `db` 的写被执行的前置状态——一条已被槽持有、generation=1 的 run
      accept(store, task("t1"));
      const grant = store.tryClaimSlot("owner-1", "boot-1") as { task_id: string; lease_epoch: number };

      // 步骤 2：调用 publishResult(…)
      store.publishResult(result("t1"), grant.lease_epoch);
      store.close();
      closed = true;

      // 步骤 3：读回权威事实源（重开库逐行对账）逐值对账写入语义
      const reopened = new TaskStore(path, 1000);
      try {
        const row = reopened.db.prepare("SELECT generation, state FROM runs WHERE task_id='t1'").get() as any;
        expect(row.generation).toBe(2);
        // publishResult 只发布结果，不改终态
        expect(row.state).toBe("Running");
        const results = reopened.db.prepare("SELECT generation FROM results WHERE task_id='t1'").all() as any[];
        expect(results.map((r) => r.generation)).toEqual([1]);
      } finally {
        reopened.close();
      }
    } finally {
      if (!closed) store.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

});
