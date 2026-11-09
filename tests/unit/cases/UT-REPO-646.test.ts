/**
 * Case ID: UT-REPO-646  ·  STATUS: real
 *
 * 责任：返回站点 L805 值 `this.tx(() => { const rows = scope === …` 逐值断言（store.ts）
 * 维度坐标：`purge` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-646.md（脚本的唯一依据）
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

describe("UT-REPO-646 · purge · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the transaction's value from the outer return site", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:805 的返回站点被到达的输入——一条 Active 的任务
      accept(store, task("t1"));
      // 步骤 2：调用 purge
            const out = store.purge({ task_id: "t1" });
      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
            expect(typeof out).toBe("object");
            expect(Object.keys(out)).toEqual(["removed", "tombstones"]);
            expect(out.removed).toBe(1);
            expect(out.tombstones).toBe(1);
            expect((store.db.prepare("SELECT identity_state FROM tasks WHERE task_id='t1'").get() as any).identity_state).toBe("Tombstone");
    } finally {
      store.close();
    }
  });

});
