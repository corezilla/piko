/**
 * Case ID: UT-REPO-561  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:692）
 * 维度坐标：`rawUsage` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-561.md（脚本的唯一依据）
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

describe("UT-REPO-561 · rawUsage · 字符串/路径/枚举输入 × 空", () => {
  it("returns an empty array for an empty or null task id and rejects undefined at the binder", async () => {
    const store = newStore();
    try {
      accept(store, task("t-561"));

      // 步骤 1：按 `空` 类构造参数 taskId——''（空串）、null（显式空值）、undefined（缺省）三态
      // 步骤 2：调用 rawUsage(…)
      let emptyErr: any = null;
      let emptyOut: any = null;
      try {
        emptyOut = store.rawUsage("");
      } catch (e) {
        emptyErr = e;
      }
      let nullErr: any = null;
      let nullOut: any = null;
      try {
        nullOut = store.rawUsage(null as never);
      } catch (e) {
        nullErr = e;
      }
      let undefErr: any = null;
      try {
        store.rawUsage(undefined as never);
      } catch (e) {
        undefErr = e;
      }

      // 步骤 3：断言——实现的真实语义：rawUsage 只做等值查询、零校验，
      //         空串与 null 查不到行 → 空数组；undefined 被 SQLite 绑定层拒绝
      expect(emptyErr).toBeNull();
      expect(emptyOut).toEqual([]);
      expect(nullErr).toBeNull();
      expect(nullOut).toEqual([]);
      expect(undefErr).toBeInstanceOf(TypeError);
      expect(String(undefErr.message)).toContain("cannot be bound to SQLite parameter");
      // 无状态写：只读查询
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
