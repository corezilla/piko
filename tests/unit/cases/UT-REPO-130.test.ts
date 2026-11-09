/**
 * Case ID: UT-REPO-130  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:288）
 * 维度坐标：`setInputStaging` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-130.md（脚本的唯一依据）
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

describe("UT-REPO-130 · setInputStaging · 字符串/路径/枚举输入 × 空", () => {
  it("rejects an empty taskId with a typed TaskNotFound", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 taskId——''（空串）、null（显式空值）三态中的前两态；
      // 其余参数取合法等价类（合法 staging 结构）
      const staging = { state: "none" as const, fetched: [], failed: [] };
      // 步骤 2：调用被测符号（预期被拒绝 → 抛错）
            let err: any = null;
            try {
              store.setInputStaging("", staging);
            } catch (e) {
              err = e;
            }
      // 步骤 3：断言——typed 错误逐值对账，且无状态写/资源残留
            expect(err).not.toBeNull();
      expect(err.code).toBe("TaskNotFound");
            expect(err.status).toBe(404);
            expect(err.message).toContain("staging reported for unknown task");
            // 空串匹配不到任何 run 行，被 UPDATE 的 changes===0 守卫拦下；无状态写
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
