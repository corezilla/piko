/**
 * Case ID: UT-REPO-117  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:255）
 * 维度坐标：`getRun` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-117.md（脚本的唯一依据）
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

describe("UT-REPO-117 · getRun · 字符串/路径/枚举输入 × 超长", () => {

  it("reports NotFound for an over-long task id", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 taskId 的超长类——长度 2×4096＝8192
      const long = "t".repeat(8192);

      // 步骤 2：调用 getRun(long)
      let err: any = null;
      try {
        store.getRun(long);
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言逐值对账——实现对 taskId 无长度上限，超长串只是查不到，命中 NotFound
      expect((err as any).code).toBe("NotFound");
      expect((err as any).status).toBe(404);
    } finally {
      store.close();
    }
  });

});
