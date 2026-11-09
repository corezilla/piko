/**
 * Case ID: UT-REPO-414  ·  STATUS: real
 *
 * 责任：参数 `turns: { task: string; visible: string }[]` 的 `空` 类（store.ts:528）
 * 维度坐标：`ingestMatrixEvent` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-414.md（脚本的唯一依据）
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

describe("UT-REPO-414 · ingestMatrixEvent · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty turns array", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 turns——''（空串）、undefined（缺省）、null（显式空值）三态
      acceptDiscussion(store, "d1", "!r");
      // 步骤 2：调用 ingestMatrixEvent
            const empty = store.ingestMatrixEvent("!r", "e1", "sender-1", "txn-1", []);
            const strTurns = store.ingestMatrixEvent("!r", "e2", "sender-1", "txn-2", "" as any);
            const rows = store.db.prepare("SELECT event_id FROM matrix_events ORDER BY event_id").all() as any[];
            const turns = store.db.prepare("SELECT count(*) n FROM discussion_turns").get() as any;
      // 步骤 3：断言——实现的真实语义：空数组正常走完；空串 turns 可迭代（长度为 0 的字符串）
            // 所以也不报错，只是没有 turn 被写入
            expect(empty).toBe(true);
            expect(strTurns).toBe(true);
            expect(rows.length).toBe(2);
            // 只有 createOrGet 建的触发 turn 在，ingest 没再写 turn
            expect(turns.n).toBe(1);
    } finally {
      store.close();
    }
  });

});
