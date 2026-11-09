/**
 * Case ID: UT-REPO-146  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:299）
 * 维度坐标：`inputStaging` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-146.md（脚本的唯一依据）
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

describe("UT-REPO-146 · inputStaging · 字符串/路径/枚举输入 × 空", () => {
  it("throws on an empty taskId (no row → undefined dereference)", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 taskId——''（空串）、null（显式空值）三态中的前两态
      accept(store, task("t1"));
      // 步骤 2：调用 inputStaging（预期被拒绝 → 抛错）
            let err: any = null;
            try {
              store.inputStaging("");
            } catch (e) {
              err = e;
            }
            let errNull: any = null;
            try {
              store.inputStaging(null as any);
            } catch (e) {
              errNull = e;
            }
      // 步骤 3：断言——实现的真实语义：inputStaging 对未知 taskId 不做 typed 化，
            // 而是解引用 undefined 抛原生 TypeError（store.ts:299 无显式校验语句）
            expect(err).toBeInstanceOf(TypeError);
            expect(err.message).toContain("input_staging_json");
            expect(errNull).toBeInstanceOf(TypeError);
            expect(errNull.message).toContain("input_staging_json");
            // 无状态写
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
