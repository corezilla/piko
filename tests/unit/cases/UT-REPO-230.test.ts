/**
 * Case ID: UT-REPO-230  ·  STATUS: real
 *
 * 责任：状态写 L437 → `db`（store.ts）
 * 维度坐标：`reserveModel` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-230.md（脚本的唯一依据）
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

describe("UT-REPO-230 · reserveModel · 持久化/序列化 × round-trip", () => {
  it("persists the model_attempts row so a reopened database sees the same attempt", async () => {
    const { mkdtempSync, rmSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = mkdtempSync(join(tmpdir(), "piko-repo-230-"));
    const path = join(dir, "store.sqlite");
    const store = new TaskStore(path, 1000);
    let closed = false;
    try {
      // 步骤 1：构造使 store.ts:437 对 `db` 的写被执行的前置状态——一条已受理的 run
      accept(store, task("t-230"));

      // 步骤 2：调用 reserveModel(…)
      expect(store.reserveModel("t-230", "op-1", "step-1", 1)).toBe(true);
      store.close();
      closed = true;

      // 步骤 3：读回权威事实源（重开库逐行对账）逐值对账写入语义
      const reopened = new TaskStore(path, 1000);
      try {
        const row = reopened.db.prepare("SELECT * FROM model_attempts WHERE task_id='t-230'").get() as any;
        expect(row.task_id).toBe("t-230");
        expect(row.operation_id).toBe("op-1");
        expect(row.step_id).toBe("step-1");
        expect(row.attempt).toBe(1);
        expect(row.state).toBe("Started");
        expect(row.raw_usage_json).toBeNull();
        expect(row.record_version).toBe(1);
        expect(typeof row.updated_at).toBe("string");
        expect(row.updated_at.length).toBeGreaterThan(0);
        // 计数也一并落库
        expect((reopened.db.prepare("SELECT model_calls FROM runs WHERE task_id='t-230'").get() as any).model_calls).toBe(1);
      } finally {
        reopened.close();
      }
    } finally {
      if (!closed) store.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

});
