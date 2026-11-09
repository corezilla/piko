/**
 * Case ID: UT-REPO-467  ·  STATUS: real
 *
 * 责任：参数 `room: string` 的 `注入字符` 类（store.ts:583）
 * 维度坐标：`openDiscussionRuns` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-467.md（脚本的唯一依据）
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

describe("UT-REPO-467 · openDiscussionRuns · 字符串/路径/枚举输入 × 注入字符", () => {

  it("returns no run for an injection-shaped room id without touching the table", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 room 的注入字符类——穿越串、SQL 元字符
      store.createOrGet(discussionTask("od-467", "!room:467", "$evt"), "slinky", 10, "hello");

      // 步骤 2：调用 openDiscussionRuns(traversal) 与 openDiscussionRuns(injection)
      const first = store.openDiscussionRuns("../../etc/passwd");
      const second = store.openDiscussionRuns("'; DROP TABLE tasks;--");

      // 步骤 3：断言逐值对账——参数化绑定使注入串只是字面值，表完好
      expect(first).toEqual([]);
      expect(second).toEqual([]);
      expect(store.db.prepare("SELECT name FROM sqlite_master WHERE name='tasks'").get()).toBeTruthy();
      expect(store.openDiscussionRuns("!room:467")).toEqual(["od-467"]);
    } finally {
      store.close();
    }
  });

});
