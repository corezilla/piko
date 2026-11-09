/**
 * Case ID: UT-REPO-343  ·  STATUS: real
 *
 * 责任：分支 L492 `entry ?? null`（??；store.ts）
 * 维度坐标：`markTurn` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-343.md（脚本的唯一依据）
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

describe("UT-REPO-343 · markTurn · 状态分支 × 合法迁移", () => {

  it("keeps the previous entry id when entry is omitted and overwrites it when given", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:492 的分支（??：`entry ?? null`）取真的输入——entry 为 undefined
      acceptDiscussion(store, "t-343", "!room:343");
      store.markTurn("t-343", "$e1", "QueuedInPi", "entry-1", "op-1");

      // 步骤 2：调用 markTurn(…) 并断言该侧可观测结果
      store.markTurn("t-343", "$e1", "Consumed", undefined, undefined);

      // 步骤 3：断言取真侧——coalesce(?, pi_entry_id) 保留旧值
      const row = store.db.prepare("SELECT status,pi_entry_id,pi_operation_id FROM discussion_turns").get() as any;
      expect(row.status).toBe("Consumed");
      expect(row.pi_entry_id).toBe("entry-1");
      expect(row.pi_operation_id).toBe("op-1");

      // 步骤 4：断言取假侧——显式给出 entry/op 时被覆盖
      store.markTurn("t-343", "$e1", "Abandoned", "entry-2", "op-2");
      const after = store.db.prepare("SELECT status,pi_entry_id,pi_operation_id FROM discussion_turns").get() as any;
      expect(after.status).toBe("Abandoned");
      expect(after.pi_entry_id).toBe("entry-2");
      expect(after.pi_operation_id).toBe("op-2");
    } finally {
      store.close();
    }
  });

});
