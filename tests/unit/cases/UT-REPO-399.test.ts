/**
 * Case ID: UT-REPO-399  ·  STATUS: real
 *
 * 责任：分支 L525 `txn ?? null`（??；store.ts）
 * 维度坐标：`recordMatrixEvent` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-399.md（脚本的唯一依据）
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

describe("UT-REPO-399 · recordMatrixEvent · 状态分支 × 合法迁移", () => {
  it("takes the left side of `txn ?? null` for a non-nullish txn and the right side for nullish ones", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:525 的分支（??：`txn ?? null`）取真的输入——txn 非 nullish
      // 步骤 2：调用 recordMatrixEvent(…) 并断言该侧可观测结果
      expect(store.recordMatrixEvent("!room:a", "$e1", "@alice", "$txn-1")).toBe(true);

      // 步骤 3：构造使该分支取假的输入——txn 为 undefined／null（`??` 只对这两个值取右操作数；
      //         空串是非 nullish，仍走左操作数）
      expect(store.recordMatrixEvent("!room:b", "$e2", "@alice", undefined)).toBe(true);
      expect(store.recordMatrixEvent("!room:c", "$e3", "@alice", null as never)).toBe(true);
      expect(store.recordMatrixEvent("!room:d", "$e4", "@alice", "")).toBe(true);

      // 步骤 4：再次读回 matrix_events 并断言取假侧结果；两侧都必须被观测到
      const rows = store.db.prepare("SELECT event_id,txn_id FROM matrix_events ORDER BY event_id").all() as any[];
      expect(rows.map((r: any) => r.txn_id)).toEqual(["$txn-1", null, null, ""]);
      // 取真侧：原值原样落库（不是 SQL NULL）
      expect(rows[0].txn_id).toBe("$txn-1");
      // 取假侧：null/undefined 落成 SQL NULL
      expect(rows[1].txn_id).toBeNull();
      expect(rows[2].txn_id).toBeNull();
      // 空串证明 `??` 不是 `||`
      expect(rows[3].txn_id).toBe("");
    } finally {
      store.close();
    }
  });

});
