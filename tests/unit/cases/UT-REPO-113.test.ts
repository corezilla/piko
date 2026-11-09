/**
 * Case ID: UT-REPO-113  ·  STATUS: real
 *
 * 责任：状态写 L248 → `db`（store.ts）
 * 维度坐标：`mutateRun` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-113.md（脚本的唯一依据）
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

describe("UT-REPO-113 · mutateRun · 持久化/序列化 × round-trip", () => {

  it("persists the mutateRun write so a reopened database sees the same row", async () => {
    const { mkdtempSync, rmSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = mkdtempSync(join(tmpdir(), "piko-repo-113-"));
    const path = join(dir, "store.sqlite");
    const store = new TaskStore(path, 1000);
    let closed = false;
    try {
      // 步骤 1：构造使 store.ts:248 对 `db` 的写被执行的前置状态——一条 Queued 的 run
      accept(store, task("t1"));

      // 步骤 2：调用 mutateRun(…)
      const gen = store.mutateRun({
        task_id: "t1",
        expected_generation: 1,
        mutation: (r: any) => {
          r.state = "Running";
          r.cancel_requested = 1;
        },
      });
      expect(gen).toBe(2);
      store.close();
      closed = true;

      // 步骤 3：读回权威事实源（重开库逐行对账）逐值对账写入语义
      const reopened = new TaskStore(path, 1000);
      try {
        const row = reopened.db.prepare("SELECT * FROM runs WHERE task_id='t1'").get() as any;
        expect(row.generation).toBe(2);
        expect(row.state).toBe("Running");
        expect(row.cancel_requested).toBe(1);
        expect(typeof row.last_activity_at).toBe("string");
        expect(row.last_activity_at.length).toBeGreaterThan(0);
      } finally {
        reopened.close();
      }
    } finally {
      if (!closed) store.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

});
