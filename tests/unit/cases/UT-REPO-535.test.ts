/**
 * Case ID: UT-REPO-535  ·  STATUS: real
 *
 * 责任：返回站点 L659 值 `{ outcome: "CancelledBeforeStart", requ…` 逐值断言（store.ts）
 * 维度坐标：`cancel` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-535.md（脚本的唯一依据）
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

describe("UT-REPO-535 · cancel · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the CancelledBeforeStart outcome with a requested_at timestamp", async () => {
    const store = newStore();
    try {
      accept(store, task("t-535"));

      // 步骤 1：构造使 store.ts:659 的返回站点被到达的输入——任务仍在 Queued
      // 步骤 2：调用 cancel(…)
      const outcome = store.cancel("t-535");

      // 步骤 3：断言返回值逐值对账——结构固定为 { outcome, requested_at }，
      //         outcome 是 "CancelledBeforeStart"，requested_at 是 ISO 时间戳
      expect(Object.keys(outcome).sort()).toEqual(["outcome", "requested_at"]);
      expect(outcome.outcome).toBe("CancelledBeforeStart");
      expect(typeof outcome.requested_at).toBe("string");
      expect(new Date(outcome.requested_at).toISOString()).toBe(outcome.requested_at);
      // 另外两个出口逐值对账
      expect(store.cancel("t-535").outcome).toBe("AlreadyTerminal");
    } finally {
      store.close();
    }
  });

});
