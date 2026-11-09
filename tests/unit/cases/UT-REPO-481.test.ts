/**
 * Case ID: UT-REPO-481  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:602）
 * 维度坐标：`prepareMatrixSend` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-481.md（脚本的唯一依据）
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

describe("UT-REPO-481 · prepareMatrixSend · 字符串/路径/枚举输入 × 空", () => {
  it("rejects an empty taskId at the foreign key", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 taskId——''（空串）、null（显式空值）三态中的前两态；
      // 其余参数取合法等价类
      accept(store, task("t1"));
      // 步骤 2：调用 prepareMatrixSend
            let emptyErr: any = null;
            try {
              store.prepareMatrixSend("tx-1", "", 1, "sha-1");
            } catch (e) {
              emptyErr = e;
            }
            let nullErr: any = null;
            try {
              store.prepareMatrixSend("tx-2", null as any, 1, "sha-1");
            } catch (e) {
              nullErr = e;
            }
      // 步骤 3：断言——实现的真实语义：taskId 无显式校验，但 matrix_sends.task_id 有外键，
            // 空串/不存在的任务被 FOREIGN KEY 约束拒绝（SQLite 错误，非 typed PikoError）
            expect(emptyErr).toBeInstanceOf(Error);
            expect(emptyErr.message).toContain("FOREIGN KEY constraint failed");
            expect(nullErr).toBeInstanceOf(Error);
            expect(nullErr.message).toContain("NOT NULL constraint failed");
            expect((store.db.prepare("SELECT count(*) n FROM matrix_sends").get() as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
