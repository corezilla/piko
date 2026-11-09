/**
 * Case ID: UT-REPO-148  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:299）
 * 维度坐标：`inputStaging` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-148.md（脚本的唯一依据）
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

describe("UT-REPO-148 · inputStaging · 字符串/路径/枚举输入 × 注入字符", () => {
  it("throws on an injection-shaped taskId without touching other tables", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 taskId——SQL 注入串、路径穿越串、控制字符串
      accept(store, task("t1"));
      const ids = ["'; DROP TABLE runs;--", "../../etc/piko", "a\u0001b"];
      // 步骤 2：调用 inputStaging（预期被拒绝 → 抛错）
            let err: any = null;
            try {
              store.inputStaging(ids[0]);
            } catch (e) {
              err = e;
            }
      // 步骤 3：断言——参数化绑定生效：注入串命中不到行，走 undefined 解引用分支
            expect(err).toBeInstanceOf(TypeError);
            expect(err.message).toContain("input_staging_json");
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
            expect((store.db.prepare("SELECT count(*) n FROM runs WHERE task_id=?").get(ids[0]) as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
