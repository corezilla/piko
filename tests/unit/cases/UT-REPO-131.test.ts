/**
 * Case ID: UT-REPO-131  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:288）
 * 维度坐标：`setInputStaging` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-131.md（脚本的唯一依据）
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

describe("UT-REPO-131 · setInputStaging · 字符串/路径/枚举输入 × 超长", () => {
  it("rejects an over-long taskId with a typed TaskNotFound", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造 taskId——长度 2×上限 = 8192（源码无比较常量，故取文档默认上限 4096）；
      // 其余参数取合法等价类
      accept(store, task("t1"));
      const longId = "x".repeat(8192);
      // 步骤 2：调用被测符号（预期被拒绝 → 抛错）
            let err: any = null;
            try {
              store.setInputStaging(longId, { state: "none", fetched: [], failed: [] });
            } catch (e) {
              err = e;
            }
      // 步骤 3：断言——typed 错误逐值对账，且无状态写/资源残留
            expect(err).not.toBeNull();
      expect(err.code).toBe("TaskNotFound");
            expect(err.status).toBe(404);
            // 超长 taskId 只是匹配不到行，实现不做长度校验
            expect((store.db.prepare("SELECT count(*) n FROM runs WHERE task_id=?").get(longId) as any).n).toBe(0);
            expect((store.db.prepare("SELECT input_staging_json FROM runs WHERE task_id='t1'").get() as any).input_staging_json).toBe(
              JSON.stringify({ state: "none", fetched: [], failed: [] }),
            );
    } finally {
      store.close();
    }
  });

});
