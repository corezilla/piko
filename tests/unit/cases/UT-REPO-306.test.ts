/**
 * Case ID: UT-REPO-306  ·  STATUS: real
 *
 * 责任：状态写 L479 → `db`（store.ts）
 * 维度坐标：`reserveTool` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-306.md（脚本的唯一依据）
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

describe("UT-REPO-306 · reserveTool · 持久化/序列化 × round-trip", () => {

  it("persists the runs.tool_calls increment so a reopened database sees it", async () => {
    const { mkdtempSync, rmSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = mkdtempSync(join(tmpdir(), "piko-repo-306-"));
    const path = join(dir, "store.sqlite");
    const store = new TaskStore(path, 1000);
    let closed = false;
    try {
      // 步骤 1：构造使 store.ts:479 对 `db` 的写被执行的前置状态——一条已受理的 run
      accept(store, task("t1"));

      // 步骤 2：调用 reserveTool(…)
      expect(store.reserveTool("t1", "op", "tc1", "name", "effect", "never")).toBe("Admitted");
      expect(store.reserveTool("t1", "op", "tc2", "name", "effect", "never")).toBe("Admitted");
      store.close();
      closed = true;

      // 步骤 3：读回权威事实源（重开库逐行对账）逐值对账写入语义
      const reopened = new TaskStore(path, 1000);
      try {
        const run = reopened.db.prepare("SELECT tool_calls FROM runs WHERE task_id='t1'").get() as any;
        expect(run.tool_calls).toBe(2);
        const calls = reopened.db.prepare("SELECT tool_call_id, state FROM tool_calls ORDER BY tool_call_id").all() as any[];
        expect(calls.map((c) => c.tool_call_id)).toEqual(["tc1", "tc2"]);
        expect(calls.every((c) => c.state === "Reserved")).toBe(true);
      } finally {
        reopened.close();
      }
    } finally {
      if (!closed) store.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

});
