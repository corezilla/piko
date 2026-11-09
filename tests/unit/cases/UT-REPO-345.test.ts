/**
 * Case ID: UT-REPO-345  ·  STATUS: real
 *
 * 责任：状态写 L490 → `db`（store.ts）
 * 维度坐标：`markTurn` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-345.md（脚本的唯一依据）
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

describe("UT-REPO-345 · markTurn · 持久化/序列化 × round-trip", () => {

  it("writes the status and keeps the existing pi ids when the new ones are missing", async () => {
    const store = newStore();
    try {
      acceptDiscussion(store, "t-345", "!room:test");
      store.markTurn("t-345", "$e1", "QueuedInPi", "entry-345", "op-345");
      store.db.prepare("UPDATE discussion_turns SET pi_entry_id=NULL,pi_operation_id=NULL").run();

      // 步骤 1：构造使 store.ts:490 对 `db` 的写被执行的前置状态
      expect(
        (store.db.prepare("SELECT status,pi_entry_id,pi_operation_id FROM discussion_turns").get() as any),
      ).toEqual({ status: "QueuedInPi", pi_entry_id: null, pi_operation_id: null });

      // 步骤 2：调用 markTurn(…)
      store.markTurn("t-345", "$e1", "Consumed", "entry-345", "op-345");

      // 步骤 3：读回权威事实源逐值对账写入语义——status 被推进，pi_* 被写成新值
      const row = store.db.prepare("SELECT status,pi_entry_id,pi_operation_id FROM discussion_turns").get() as any;
      expect(row).toEqual({ status: "Consumed", pi_entry_id: "entry-345", pi_operation_id: "op-345" });

      // coalesce 语义：再调一次不带 entry/op，pi_* 保持原值不变
      store.markTurn("t-345", "$e1", "Abandoned");
      const row2 = store.db.prepare("SELECT status,pi_entry_id,pi_operation_id FROM discussion_turns").get() as any;
      expect(row2).toEqual({ status: "Abandoned", pi_entry_id: "entry-345", pi_operation_id: "op-345" });
    } finally {
      store.close();
    }
  });

});
