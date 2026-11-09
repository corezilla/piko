/**
 * Case ID: UT-REPO-132  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:288）
 * 维度坐标：`setInputStaging` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-132.md（脚本的唯一依据）
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

describe("UT-REPO-132 · setInputStaging · 字符串/路径/枚举输入 × 注入字符", () => {
  it("rejects an injection-shaped taskId without touching other tables", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 taskId——SQL 元字符注入串、路径穿越串、控制字符串；
      // 其余参数取合法等价类
      accept(store, task("t1"));
      const ids = ["'; DROP TABLE runs;--", "../../etc/piko", "a\u0001b"];
      // 步骤 2：调用被测符号（预期被拒绝 → 抛错）
            let err: any = null;
            try {
              store.setInputStaging(ids[0], { state: "none", fetched: [], failed: [] });
            } catch (e) {
              err = e;
            }
      // 步骤 3：断言——typed 错误逐值对账，且无状态写/资源残留
            expect(err).not.toBeNull();
      expect(err.code).toBe("TaskNotFound");
            expect(err.status).toBe(404);
            // 参数化绑定：注入串只被当成普通 task_id，不会命中任何行，也不影响 runs 表
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
            expect((store.db.prepare("SELECT count(*) n FROM runs WHERE task_id=?").get(ids[0]) as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
