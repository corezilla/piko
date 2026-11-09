/**
 * Case ID: UT-REPO-233  ·  STATUS: real
 *
 * 责任：返回站点 L436 值 `true` 逐值断言（store.ts）
 * 维度坐标：`reserveModel` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-233.md（脚本的唯一依据）
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

describe("UT-REPO-233 · reserveModel · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns true for both the first and the repeated reservation", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:436 的返回站点被到达的输入——合法等价类参数
      accept(store, task("t-233"));

      // 步骤 2：调用 reserveModel(…)
      const first = store.reserveModel("t-233", "op-1", "step-1", 1);
      const second = store.reserveModel("t-233", "op-1", "step-1", 1);

      // 步骤 3：断言返回值逐值对账——两个等价类（新建 / 已存在）都返回布尔 true
      expect(first).toBe(true);
      expect(typeof first).toBe("boolean");
      expect(second).toBe(true);
      expect(typeof second).toBe("boolean");
    } finally {
      store.close();
    }
  });

});
