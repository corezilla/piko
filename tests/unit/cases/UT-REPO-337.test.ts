/**
 * Case ID: UT-REPO-337  ·  STATUS: real
 *
 * 责任：参数 `entry: string` 的 `注入字符` 类（store.ts:489）
 * 维度坐标：`markTurn` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-337.md（脚本的唯一依据）
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

describe("UT-REPO-337 · markTurn · 字符串/路径/枚举输入 × 注入字符", () => {

  it("stores an injected pi entry id verbatim", async () => {
    const store = newStore();
    try {
      acceptDiscussion(store, "t-337", "!room:test");
      const injected = "entry'; DROP TABLE discussion_turns;--";

      // 步骤 1：按 `注入字符` 类构造参数 entry——穿越串 + SQL 元字符 + 控制字符
      // 步骤 2：调用 markTurn(…)
      store.markTurn("t-337", "$e1", "QueuedInPi", injected, "op-337");

      // 步骤 3：断言——实现的真实语义：pi_entry_id 是绑定参数，注入串不构成 SQL，
      //         原样落库，discussion_turns 表结构完好
      const row = store.db.prepare("SELECT pi_entry_id,pi_operation_id,status FROM discussion_turns").get() as any;
      expect(row.pi_entry_id).toBe(injected);
      expect(row.pi_operation_id).toBe("op-337");
      expect(row.status).toBe("QueuedInPi");
      expect(store.db.prepare("SELECT count(*) n FROM discussion_turns").get()).toEqual({ n: 1 });
    } finally {
      store.close();
    }
  });

});
