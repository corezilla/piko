/**
 * Case ID: UT-REPO-332  ·  STATUS: real
 *
 * 责任：参数 `status: "QueuedInPi" | "Consumed" | "Abandoned"` 的 `每等价类合法值` 类（store.ts:489）
 * 维度坐标：`markTurn` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-332.md（脚本的唯一依据）
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

describe("UT-REPO-332 · markTurn · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts every legal turn status value and stores it verbatim", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `每等价类合法值` 类构造参数 status——类型定义里的三个枚举值
      //         "QueuedInPi" / "Consumed" / "Abandoned" 各用一个独立的 turn
      acceptDiscussion(store, "t-332a", "!room:a");
      acceptDiscussion(store, "t-332b", "!room:b");
      acceptDiscussion(store, "t-332c", "!room:c");

      // 步骤 2：调用 markTurn(…)
      const queued = store.markTurn("t-332a", "$e1", "QueuedInPi");
      const consumed = store.markTurn("t-332b", "$e1", "Consumed");
      const abandoned = store.markTurn("t-332c", "$e1", "Abandoned");

      // 步骤 3：断言——被接受时返回值/状态与设计声明一致，逐值对账
      expect(queued).toBeUndefined();
      expect(consumed).toBeUndefined();
      expect(abandoned).toBeUndefined();
      const rows = store.db
        .prepare("SELECT task_id, status FROM discussion_turns ORDER BY task_id")
        .all() as any[];
      expect(rows).toEqual([
        { task_id: "t-332a", status: "QueuedInPi" },
        { task_id: "t-332b", status: "Consumed" },
        { task_id: "t-332c", status: "Abandoned" },
      ]);
      // 非法枚举值被列上的 CHECK 约束拒绝（抛的是 SQLite 原始错误，不是 PikoError）
      let err: any = null;
      try {
        store.markTurn("t-332a", "$e1", "Bogus" as never);
      } catch (e) {
        err = e;
      }
      expect(err).not.toBeNull();
      expect(err?.code).toBe("ERR_SQLITE_ERROR");
      expect(err?.constructor?.name).not.toBe("PikoError");
    } finally {
      store.close();
    }
  });

});
