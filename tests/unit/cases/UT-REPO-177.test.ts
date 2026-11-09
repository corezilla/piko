/**
 * Case ID: UT-REPO-177  ·  STATUS: real
 *
 * 责任：返回站点 L381 值 `rows.map((r) => r.task_id as string)` 逐值断言（store.ts）
 * 维度坐标：`failAccessLostTasks` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-177.md（脚本的唯一依据）
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

describe("UT-REPO-177 · failAccessLostTasks · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the access-lost task ids in task_id order", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:381 的返回站点被到达的输入——两条同房间的讨论任务被标记为讨论失联
      accept(store, discussionTask("a2", "!r:lost"));
      accept(store, discussionTask("a1", "!r:lost"));
      accept(store, task("plain"));
      expect(store.markDiscussionAccessLost("!r:lost")).toEqual(["a2", "a1"]);

      // 步骤 2：调用 failAccessLostTasks(…)
      const affected = store.failAccessLostTasks();

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(affected).toEqual(["a1", "a2"]);
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='a1'").get() as any).state).toBe("Failed");
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='a2'").get() as any).state).toBe("Failed");
      // 无未声明副作用：未受影响的普通任务仍停在 Queued
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='plain'").get() as any).state).toBe("Queued");
    } finally {
      store.close();
    }
  });

});
