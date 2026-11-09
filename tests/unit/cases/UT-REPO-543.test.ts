/**
 * Case ID: UT-REPO-543  ·  STATUS: real
 *
 * 责任：返回站点 L668 值 `!!(this.db.prepare("SELECT cancel_reque…` 逐值断言（store.ts）
 * 维度坐标：`cancelRequested` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-543.md（脚本的唯一依据）
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

describe("UT-REPO-543 · cancelRequested · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the boolean produced by the cancel flag lookup", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条已请求取消与一条未请求取消的 run
      store.createOrGet(task("cr-543-a"), "slinky", 10);
      store.cancel("cr-543-a");
      store.createOrGet(task("cr-543-b"), "slinky", 10);

      // 步骤 2：调用 cancelRequested(...) 两次
      const requested = store.cancelRequested("cr-543-a");
      const notRequested = store.cancelRequested("cr-543-b");

      // 步骤 3：断言逐值对账——返回值是严格的布尔值
      expect(requested).toBe(true);
      expect(notRequested).toBe(false);
      expect(typeof requested).toBe("boolean");
      expect(typeof notRequested).toBe("boolean");
    } finally {
      store.close();
    }
  });

});
