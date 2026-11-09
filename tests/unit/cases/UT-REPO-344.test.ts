/**
 * Case ID: UT-REPO-344  ·  STATUS: real
 *
 * 责任：分支 L492 `op ?? null`（??；store.ts）
 * 维度坐标：`markTurn` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-344.md（脚本的唯一依据）
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

describe("UT-REPO-344 · markTurn · 状态分支 × 合法迁移", () => {
  it("keeps the existing operation id when op is null", async () => {
    const store = newStore();
    try {
      acceptDiscussion(store, "t-344", "!room:344");
      store.markTurn("t-344", "$e1", "QueuedInPi", "entry-1", "op-1");

      // 步骤 1：构造使 store.ts:492 的分支（??：`op ?? null`）取真的输入——op 为 null，
      //         语句把 coalesce 的第二个实参传成 SQL NULL，于是既有值被保留
      // 步骤 2：调用 markTurn(…) 并断言该侧可观测结果
      store.markTurn("t-344", "$e1", "Consumed", "entry-2", null as never);
      const row = store.db.prepare("SELECT pi_entry_id, pi_operation_id FROM discussion_turns").get() as any;
      // coalesce(NULL, pi_operation_id) ＝ 既有值 → pi_operation_id 仍是 op-1
      expect(row.pi_operation_id).toBe("op-1");
      // 而 coalesce('entry-2', pi_entry_id) ＝ 'entry-2' → pi_entry_id 被覆盖
      expect(row.pi_entry_id).toBe("entry-2");

      // 步骤 3：构造使该分支取假的输入——op 为具体字符串（无显式 else：取假即跳过该块）
      // 步骤 4：再次调用 markTurn(…) 并断言取假侧结果（两侧都被观测到）
      store.markTurn("t-344", "$e1", "Consumed", "entry-3", "op-3");
      const after = store.db.prepare("SELECT pi_entry_id, pi_operation_id FROM discussion_turns").get() as any;
      expect(after.pi_operation_id).toBe("op-3");
      expect(after.pi_entry_id).toBe("entry-3");
    } finally {
      store.close();
    }
  });

});
