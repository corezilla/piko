/**
 * Case ID: UT-REPO-294  ·  STATUS: real
 *
 * 责任：参数 `replay: string` 的 `空` 类（store.ts:456）
 * 维度坐标：`reserveTool` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-294.md（脚本的唯一依据）
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

describe("UT-REPO-294 · reserveTool · 字符串/路径/枚举输入 × 空", () => {

  it("rejects an empty replay with the CHECK constraint and leaves no row", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造参数 replay——''（空串）、undefined（缺省）、null（显式空值）三态；其余参数取合法等价类
      accept(store, task("t1"));

      // 步骤 2：调用 reserveTool(…)
      let emptyErr: any = null;
      try {
        store.reserveTool("t1", "op", "tc-empty", "name", "effect", "");
      } catch (e) {
        emptyErr = e;
      }
      let nullErr: any = null;
      try {
        store.reserveTool("t1", "op", "tc-null", "name", "effect", null as never);
      } catch (e) {
        nullErr = e;
      }
      let undefErr: any = null;
      try {
        store.reserveTool("t1", "op", "tc-undef", "name", "effect", undefined as never);
      } catch (e) {
        undefErr = e;
      }

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      //         实现的真实语义：空串被 SQLite 的 CHECK(replay IN('never','safe')) 拒绝；
      //         null 被 NOT NULL 拒绝，undefined 被绑定层拒绝——三者都不是 typed PikoError
      expect(emptyErr).not.toBeNull();
      expect(emptyErr.code).toBe("ERR_SQLITE_ERROR");
      expect(emptyErr.message).toContain("CHECK constraint failed: replay IN('never','safe')");
      expect(nullErr).not.toBeNull();
      expect(nullErr.message).toContain("NOT NULL constraint failed: tool_calls.replay");
      expect(undefErr).not.toBeNull();
      expect(undefErr.code).toBe("ERR_INVALID_ARG_TYPE");
      // 无残留：三条被拒的调用都没有留下 tool_calls 行
      expect((store.db.prepare("SELECT count(*) n FROM tool_calls").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT tool_calls FROM runs WHERE task_id='t1'").get() as any).tool_calls).toBe(0);
    } finally {
      store.close();
    }
  });

});
