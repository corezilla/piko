/**
 * Case ID: UT-REPO-135  ·  STATUS: real
 *
 * 责任：参数 `staging: InputStaging` 的 `非法值` 类（store.ts:288）
 * 维度坐标：`setInputStaging` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-135.md（脚本的唯一依据）
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

describe("UT-REPO-135 · setInputStaging · 纯函数/无副作用 × 非法值", () => {
  it("stores an out-of-enum InputStaging verbatim (no state validation)", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `非法值` 类构造 staging——state 取类型定义枚举表之外的值；
      // 其余参数取合法等价类
      accept(store, task("t1"));
      // 步骤 2：调用 setInputStaging
            store.setInputStaging("t1", { state: "bogus" as any, fetched: [], failed: [] });
      // 步骤 3：断言——实现的真实语义：runs.input_staging_json 只是 TEXT 列、没有 CHECK 约束，
            // 所以非法枚举值不被 typed 拒绝，而是原样落库并原样读回
            expect(store.inputStaging("t1")).toEqual({ state: "bogus", fetched: [], failed: [] });
            expect((store.db.prepare("SELECT input_staging_json FROM runs WHERE task_id='t1'").get() as any).input_staging_json).toBe(
              JSON.stringify({ state: "bogus", fetched: [], failed: [] }),
            );
    } finally {
      store.close();
    }
  });

});
