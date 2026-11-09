/**
 * Case ID: UT-REPO-329  ·  STATUS: real
 *
 * 责任：参数 `event: string` 的 `空` 类（store.ts:489）
 * 维度坐标：`markTurn` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-329.md（脚本的唯一依据）
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

describe("UT-REPO-329 · markTurn · 字符串/路径/枚举输入 × 空", () => {

  it("matches no turn for an empty event id and refuses to bind undefined", async () => {
    const store = newStore();
    try {
      acceptDiscussion(store, "t-329", "!room:test");

      // 步骤 1：按 `空` 类构造参数 event——''（空串）、undefined（缺省）、null（显式空值）
      // 步骤 2：调用 markTurn(…)
      store.markTurn("t-329", "", "Consumed");
      let undefinedErr: any = null;
      try {
        store.markTurn("t-329", undefined as unknown as string, "Consumed");
      } catch (e) {
        undefinedErr = e;
      }
      let nullErr: any = null;
      try {
        store.markTurn("t-329", null as unknown as string, "Consumed");
      } catch (e) {
        nullErr = e;
      }

      // 步骤 3：断言——实现的真实语义：空串与 null 都命中 0 行、不报错、turn 状态不变；
      //         undefined 被绑定层拒绝（TypeError）
      expect(undefinedErr?.constructor?.name).toBe("TypeError");
      expect(undefinedErr?.message).toMatch(/cannot be bound to SQLite parameter/);
      expect(nullErr).toBeNull();
      const rows = store.db.prepare("SELECT event_id,status FROM discussion_turns").all() as any[];
      expect(rows).toEqual([{ event_id: "$e1", status: "Pending" }]);
    } finally {
      store.close();
    }
  });

});
