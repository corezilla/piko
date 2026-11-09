/**
 * Case ID: UT-REPO-348  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:494）
 * 维度坐标：`pendingTurns` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-348.md（脚本的唯一依据）
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

describe("UT-REPO-348 · pendingTurns · 字符串/路径/枚举输入 × 注入字符", () => {

  it("returns an empty list for an injection-shaped task id without touching the table", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 taskId 的注入字符类——穿越串、SQL 元字符
      store.createOrGet(discussionTask("pt-348"), "slinky", 10, "hello");

      // 步骤 2：调用 pendingTurns(traversal) 与 pendingTurns(injection)
      const first = store.pendingTurns("../../etc/passwd");
      const second = store.pendingTurns("'; DROP TABLE discussion_turns;--");

      // 步骤 3：断言逐值对账——参数化绑定使注入串只是字面值，表完好且原 turn 未被读到
      expect(first).toEqual([]);
      expect(second).toEqual([]);
      expect(store.db.prepare("SELECT name FROM sqlite_master WHERE name='discussion_turns'").get()).toBeTruthy();
      expect(store.pendingTurns("pt-348")).toHaveLength(1);
    } finally {
      store.close();
    }
  });

});
