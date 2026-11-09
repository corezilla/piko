/**
 * Case ID: UT-REPO-116  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:255）
 * 维度坐标：`getRun` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-116.md（脚本的唯一依据）
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

describe("UT-REPO-116 · getRun · 字符串/路径/枚举输入 × 空", () => {

  it("reports NotFound for an empty task id", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 taskId 的空类——''（空串）
      // 步骤 2：调用 getRun("")
      let err: any = null;
      try {
        store.getRun("");
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言逐值对账——空串不是合法 task_id，命中 typed NotFound
      expect(err).toBeInstanceOf(Error);
      expect((err as any).code).toBe("NotFound");
      expect((err as any).status).toBe(404);
    } finally {
      store.close();
    }
  });

});
