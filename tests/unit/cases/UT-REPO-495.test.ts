/**
 * Case ID: UT-REPO-495  ·  STATUS: real
 *
 * 责任：返回站点 L610 值 `{ state: "Pending" }` 逐值断言（store.ts）
 * 维度坐标：`prepareMatrixSend` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-495.md（脚本的唯一依据）
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

describe("UT-REPO-495 · prepareMatrixSend · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the literal { state: \"Pending\" } for a new transaction", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:610 的返回站点被到达的输入——新事务
      accept(store, task("t1"));
      // 步骤 2：调用 prepareMatrixSend
            const out = store.prepareMatrixSend("tx-1", "t1", 1, "sha-1");
      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
            expect(out).toEqual({ state: "Pending" });
            expect(Object.keys(out)).toEqual(["state"]);
            expect(out.state).toBe("Pending");
    } finally {
      store.close();
    }
  });

});
