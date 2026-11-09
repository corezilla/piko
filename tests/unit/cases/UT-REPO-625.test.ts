/**
 * Case ID: UT-REPO-625  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:795）
 * 维度坐标：`result` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-625.md（脚本的唯一依据）
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

describe("UT-REPO-625 · result · 字符串/路径/枚举输入 × 空", () => {
  it("rejects an empty or null task id with NotFound and refuses undefined at the binder", async () => {
    const store = newStore();
    try {
      accept(store, task("t-625"));
      store.finishQueued(result("t-625"));

      // 步骤 1：按 `空` 类构造参数 taskId——''（空串）、null（显式空值）、undefined（缺省）三态
      // 步骤 2：调用 result(…)
      let emptyErr: any = null;
      try {
        store.result("");
      } catch (e) {
        emptyErr = e;
      }
      let nullErr: any = null;
      try {
        store.result(null as never);
      } catch (e) {
        nullErr = e;
      }
      let undefErr: any = null;
      try {
        store.result(undefined as never);
      } catch (e) {
        undefErr = e;
      }

      // 步骤 3：断言——实现的真实语义：result 先查 results 表，
      //         空串与 null 查不到 → 回落到 getRun → typed 错误 NotFound(404)；
      //         undefined 被 SQLite 绑定层拒绝（TypeError），不是 PikoError
      expect(emptyErr?.code).toBe("NotFound");
      expect(emptyErr?.status).toBe(404);
      expect(emptyErr?.message).toBe("task not found");
      expect(nullErr?.code).toBe("NotFound");
      expect(nullErr?.status).toBe(404);
      expect(undefErr).toBeInstanceOf(TypeError);
      expect(String(undefErr.message)).toContain("cannot be bound to SQLite parameter");
      // 无状态写：只读查询
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
