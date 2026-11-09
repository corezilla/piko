/**
 * Case ID: UT-REPO-652  ·  STATUS: real
 *
 * 责任：返回站点 L856 值 `{ getTask: store.getTask.bind(store), g…` 逐值断言（store.ts）
 * 维度坐标：`asReader` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-652.md（脚本的唯一依据）
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

describe("UT-REPO-652 · asReader · 纯函数/无副作用 × 每等价类合法值", () => {

  it("exposes exactly the eight read-only members bound to the store", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:856 的返回站点被到达的输入——一个带任务的真实 store
      accept(store, task("t-652"));
      store.reserveModel("t-652", "op", "step", 1);

      // 步骤 2：调用 asReader(…)
      const reader = asReader(store);

      // 步骤 3：断言返回值逐值对账——八个成员都在，且都是绑定到本 store 的函数
      expect(Object.keys(reader).sort()).toEqual([
        "cancelRequested",
        "discussionAccessLost",
        "generation",
        "getRun",
        "getTask",
        "knownActions",
        "pendingTurns",
        "rawUsage",
      ]);
      for (const member of Object.values(reader)) {
        expect(typeof member).toBe("function");
      }
      expect(reader.generation("t-652")).toBe(1);
      expect(reader.cancelRequested("t-652")).toBe(false);
      expect(reader.discussionAccessLost("t-652")).toBe(false);
      expect(reader.pendingTurns("t-652")).toEqual([]);
      expect(reader.rawUsage("t-652")).toEqual([]);
      expect(reader.knownActions("t-652")).toHaveLength(1);
      expect(reader.getTask("t-652").task_id).toBe("t-652");
      expect(reader.getRun("t-652").task_id).toBe("t-652");
    } finally {
      store.close();
    }
  });

});
