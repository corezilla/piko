/**
 * Case ID: UT-REPO-647  ·  STATUS: real
 *
 * 责任：返回站点 L827 值 `{ removed, tombstones }` 逐值断言（store.ts）
 * 维度坐标：`purge` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-647.md（脚本的唯一依据）
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

describe("UT-REPO-647 · purge · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the { removed, tombstones } counters", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:827 的返回站点被到达的输入——一条 Active 的任务
      accept(store, task("t1"));
      // 步骤 2：调用 purge
            const out = store.purge({ task_id: "t1" });
            const again = store.purge({ task_id: "t1" });
      // 步骤 3：断言返回值逐值对账——首次删一条，墓碑化的任务再删一次不再计数
            expect(out).toEqual({ removed: 1, tombstones: 1 });
            expect(again).toEqual({ removed: 0, tombstones: 0 });
            expect(out.removed).toBe(out.tombstones);
    } finally {
      store.close();
    }
  });

});
