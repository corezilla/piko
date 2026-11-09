/**
 * Case ID: UT-REPO-314  ·  STATUS: real
 *
 * 责任：参数 `op: string` 的 `空` 类（store.ts:483）
 * 维度坐标：`terminalTool` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-314.md（脚本的唯一依据）
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

describe("UT-REPO-314 · terminalTool · 字符串/路径/枚举输入 × 空", () => {

  it("accepts an empty op string but rejects undefined", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造参数 op——''（空串）、undefined（缺省）、null（显式空值）三态；其余参数取合法等价类
      accept(store, task("t1"));
      store.reserveTool("t1", "op", "tc1", "name", "effect", "never");

      // 步骤 2：调用 terminalTool(…)
      let undefErr: any = null;
      try {
        store.terminalTool("t1", undefined as never, "tc1");
      } catch (e) {
        undefErr = e;
      }
      store.terminalTool("t1", "", "tc1");
      let nullErr: any = null;
      try {
        store.terminalTool("t1", null as never, "tc1");
      } catch (e) {
        nullErr = e;
      }

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      //         实现的真实语义：terminalTool 是一次参数化 UPDATE；空串与 null 都匹配不到行，
      //         不抛错也不写入；undefined 被绑定层拒绝
      expect(undefErr).not.toBeNull();
      expect(undefErr.code).toBe("ERR_INVALID_ARG_TYPE");
      expect(undefErr.message).toContain("cannot be bound to SQLite parameter 4");
      expect(nullErr).toBeNull();
      const row = store.db.prepare("SELECT state FROM tool_calls WHERE tool_call_id='tc1'").get() as any;
      expect(row.state).toBe("Reserved");
      expect((store.db.prepare("SELECT count(*) n FROM tool_calls").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
