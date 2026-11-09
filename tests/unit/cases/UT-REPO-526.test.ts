/**
 * Case ID: UT-REPO-526  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:634）
 * 维度坐标：`cancel` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-526.md（脚本的唯一依据）
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

describe("UT-REPO-526 · cancel · 字符串/路径/枚举输入 × 超长", () => {
  it("rejects an over-long task id with NotFound and writes nothing", async () => {
    const store = newStore();
    try {
      accept(store, task("t-526"));

      // 步骤 1：按 `超长` 类构造参数 taskId——源码里没有长度比较常量，取上限 4096 的 2 倍
      const longId = "t".repeat(8192);

      // 步骤 2：调用 cancel(…)
      let err: any = null;
      try {
        store.cancel(longId);
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言——实现的真实语义：cancel 对 taskId 零长度校验，
      //         超长 id 只是查不到任务 → typed 错误 NotFound(404)，不是「超长被拒」
      expect(err?.code).toBe("NotFound");
      expect(err?.status).toBe(404);
      expect(err?.message).toBe("task not found");
      // 无状态写：没有结果行，其它任务不受影响
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='t-526'").get() as any).state).toBe("Queued");
    } finally {
      store.close();
    }
  });

});
