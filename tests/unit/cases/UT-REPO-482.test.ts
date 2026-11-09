/**
 * Case ID: UT-REPO-482  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:602）
 * 维度坐标：`prepareMatrixSend` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-482.md（脚本的唯一依据）
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

describe("UT-REPO-482 · prepareMatrixSend · 字符串/路径/枚举输入 × 超长", () => {
  it("rejects an over-long taskId at the foreign key", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造 taskId——长度 2×上限 = 8192；其余参数取合法等价类
      accept(store, task("t1"));
      const longTaskId = "t".repeat(8192);
      // 步骤 2：调用 prepareMatrixSend
            let err: any = null;
            try {
              store.prepareMatrixSend("tx-1", longTaskId, 1, "sha-1");
            } catch (e) {
              err = e;
            }
      // 步骤 3：断言——超长 taskId 匹配不到 run 行，外键约束拒绝；事务回滚，无部分写入
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toContain("FOREIGN KEY constraint failed");
            expect((store.db.prepare("SELECT count(*) n FROM matrix_sends").get() as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
