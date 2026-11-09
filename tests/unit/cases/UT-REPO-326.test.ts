/**
 * Case ID: UT-REPO-326  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:489）
 * 维度坐标：`markTurn` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-326.md（脚本的唯一依据）
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

describe("UT-REPO-326 · markTurn · 字符串/路径/枚举输入 × 空", () => {

  it("writes no turn row for an empty or null task id", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造参数 taskId——''（空串）、undefined（缺省）、null（显式空值）三态；其余参数取合法等价类
      accept(store, discussionTask("d1", "!r:d1"));

      // 步骤 2：调用 markTurn(…)
      let undefErr: any = null;
      try {
        store.markTurn(undefined as never, "$e1", "Consumed");
      } catch (e) {
        undefErr = e;
      }
      store.markTurn("", "$e1", "Consumed");
      store.markTurn(null as never, "$e1", "Consumed");

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      //         实现的真实语义：markTurn 是一次参数化 UPDATE；空串与 null 匹配不到行，
      //         不抛错也不写入；undefined 被绑定层拒绝
      expect(undefErr).not.toBeNull();
      expect(undefErr.code).toBe("ERR_INVALID_ARG_TYPE");
      expect(undefErr.message).toContain("cannot be bound to SQLite parameter 4");
      const row = store.db.prepare("SELECT status, pi_entry_id FROM discussion_turns WHERE task_id='d1'").get() as any;
      expect(row.status).toBe("Pending");
      expect(row.pi_entry_id).toBeNull();
      expect((store.db.prepare("SELECT count(*) n FROM discussion_turns").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
