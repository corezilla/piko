/**
 * Case ID: UT-REPO-538  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:667）
 * 维度坐标：`cancelRequested` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-538.md（脚本的唯一依据）
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

describe("UT-REPO-538 · cancelRequested · 字符串/路径/枚举输入 × 超长", () => {

  it("returns false for an over-long task id", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 taskId 的超长类——长度 2×4096＝8192
      store.createOrGet(task("cr-538"), "slinky", 10);

      // 步骤 2：调用 cancelRequested(long)
      const requested = store.cancelRequested("t".repeat(8192));

      // 步骤 3：断言逐值对账——实现对 taskId 无长度上限，超长串只是查不到，返回 false
      expect(requested).toBe(false);
    } finally {
      store.close();
    }
  });

});
