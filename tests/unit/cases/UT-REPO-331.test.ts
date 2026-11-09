/**
 * Case ID: UT-REPO-331  ·  STATUS: real
 *
 * 责任：参数 `event: string` 的 `注入字符` 类（store.ts:489）
 * 维度坐标：`markTurn` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-331.md（脚本的唯一依据）
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

describe("UT-REPO-331 · markTurn · 字符串/路径/枚举输入 × 注入字符", () => {

  it("treats an injection-shaped event id as a bound parameter", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 event——SQL 元字符 + 路径穿越串 + 控制字符
      acceptDiscussion(store, "t-331", "!room:331");
      const nasty = "'; DROP TABLE discussion_turns;--\u0001../../etc";

      // 步骤 2：调用 markTurn(…)
      store.markTurn("t-331", nasty, "Consumed", "entry-1", "op-1");

      // 步骤 3：断言——参数化绑定：注入串命中不到任何行，原有 turn 仍是 Pending，discussion_turns 表完好
      const rows = store.db.prepare("SELECT event_id,status,pi_entry_id FROM discussion_turns").all() as any[];
      expect(rows.length).toBe(1);
      expect(rows[0].event_id).toBe("$e1");
      expect(rows[0].status).toBe("Pending");
      expect(rows[0].pi_entry_id).toBeNull();
    } finally {
      store.close();
    }
  });

});
