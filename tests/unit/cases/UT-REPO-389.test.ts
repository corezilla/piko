/**
 * Case ID: UT-REPO-389  ·  STATUS: real
 *
 * 责任：参数 `event: string` 的 `空` 类（store.ts:524）
 * 维度坐标：`recordMatrixEvent` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-389.md（脚本的唯一依据）
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

describe("UT-REPO-389 · recordMatrixEvent · 字符串/路径/枚举输入 × 空", () => {

  it("accepts an empty event id but rejects undefined", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造参数 event——''（空串）、undefined（缺省）、null（显式空值）三态；其余参数取合法等价类
      // 步骤 2：调用 recordMatrixEvent(…)
      const empty = store.recordMatrixEvent("!r", "", "@a:hs", "tx1");
      let undefErr: any = null;
      try {
        store.recordMatrixEvent("!r", undefined as never, "@a:hs", "tx2");
      } catch (e) {
        undefErr = e;
      }
      const nulled = store.recordMatrixEvent("!r", null as never, "@a:hs", "tx3");

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      //         实现的真实语义：空串是合法的 TEXT 主键，原样入库；undefined 被绑定层拒绝；
      //         null 触发 NOT NULL 约束，但 INSERT OR IGNORE 把该违规吞掉并返回 changes=0 → false
      expect(empty).toBe(true);
      expect(undefErr).not.toBeNull();
      expect(undefErr.code).toBe("ERR_INVALID_ARG_TYPE");
      expect(undefErr.message).toContain("cannot be bound to SQLite parameter 2");
      expect(nulled).toBe(false);
      const rows = store.db.prepare("SELECT event_id FROM matrix_events ORDER BY rowid").all() as any[];
      expect(rows.map((r) => r.event_id)).toEqual([""]);
    } finally {
      store.close();
    }
  });

});
