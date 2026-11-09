/**
 * Case ID: UT-REPO-278  ·  STATUS: real
 *
 * 责任：状态写 L450 → `db`（store.ts）
 * 维度坐标：`terminalModel` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-278.md（脚本的唯一依据）
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

describe("UT-REPO-278 · terminalModel · 持久化/序列化 × round-trip", () => {

  it("persists the terminalModel write so a reopened database sees the same row", async () => {
    const { mkdtempSync, rmSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = mkdtempSync(join(tmpdir(), "piko-repo-278-"));
    const path = join(dir, "store.sqlite");
    const store = new TaskStore(path, 1000);
    let closed = false;
    try {
      // 步骤 1：构造使 store.ts:450 对 `db` 的写被执行的前置状态——一条已预留的 model_attempts 行
      accept(store, task("t1"));
      store.reserveModel("t1", "op", "step", 1);

      // 步骤 2：调用 terminalModel(…)
      store.terminalModel("t1", "op", "step", 1, true);
      store.close();
      closed = true;

      // 步骤 3：读回权威事实源（重开库逐行对账）逐值对账写入语义
      const reopened = new TaskStore(path, 1000);
      try {
        const row = reopened.db.prepare("SELECT * FROM model_attempts WHERE task_id='t1'").get() as any;
        expect(row.state).toBe("Unknown");
        expect(row.record_version).toBe(2);
        expect(typeof row.updated_at).toBe("string");
        expect(row.updated_at.length).toBeGreaterThan(0);
        expect(row.raw_usage_json).toBeNull();
      } finally {
        reopened.close();
      }
    } finally {
      if (!closed) store.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

});
