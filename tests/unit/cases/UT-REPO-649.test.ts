/**
 * Case ID: UT-REPO-649  ·  STATUS: real
 *
 * 责任：参数 `store: TaskStore` 的 `每等价类合法值` 类（store.ts:855）
 * 维度坐标：`asReader` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-649.md（脚本的唯一依据）
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

describe("UT-REPO-649 · asReader · 纯函数/无副作用 × 每等价类合法值", () => {
  it("exposes exactly the eight reader methods, bound to the given store", async () => {
    const store = newStore();
    try {
      accept(store, task("t-649"));

      // 步骤 1：按 `每等价类合法值` 类构造参数 store——一个真实的 TaskStore 实例
      // 步骤 2：调用 asReader(…)
      const reader = asReader(store);

      // 步骤 3：断言——被接受时返回值/状态与设计声明一致，逐值对账
      expect(Object.keys(reader)).toEqual([
        "getTask",
        "getRun",
        "cancelRequested",
        "generation",
        "pendingTurns",
        "rawUsage",
        "knownActions",
        "discussionAccessLost",
      ]);
      for (const key of Object.keys(reader)) {
        expect(typeof (reader as any)[key]).toBe("function");
      }
      // 每个方法都绑定到了传入的 store，读到的是该 store 的事实
      expect(reader.getTask("t-649").task_id).toBe("t-649");
      expect(reader.getRun("t-649").task_id).toBe("t-649");
      expect(reader.getRun("t-649").state).toBe("Queued");
      expect(reader.cancelRequested("t-649")).toBe(false);
      expect(reader.generation("t-649")).toBe(1);
      expect(reader.pendingTurns("t-649")).toEqual([]);
      expect(reader.rawUsage("t-649")).toEqual([]);
      expect(reader.knownActions("t-649")).toEqual([]);
      expect(reader.discussionAccessLost("t-649")).toBe(false);
      // reader 不暴露写方法
      expect((reader as any).cancel).toBeUndefined();
      expect((reader as any).finish).toBeUndefined();
    } finally {
      store.close();
    }
  });

});
