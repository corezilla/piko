/**
 * Case ID: UT-REPO-352  ·  STATUS: real
 *
 * 责任：参数 `room: string` 的 `注入字符` 类（store.ts:497）
 * 维度坐标：`markDiscussionAccessLost` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-352.md（脚本的唯一依据）
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

describe("UT-REPO-352 · markDiscussionAccessLost · 字符串/路径/枚举输入 × 注入字符", () => {

  it("matches no task for an injection-shaped room id without touching the table", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 room 的注入字符类——穿越串、SQL 元字符
      store.createOrGet(discussionTask("md-352", "!room:352", "$evt"), "slinky", 10, "hello");

      // 步骤 2：调用 markDiscussionAccessLost(traversal) 与 markDiscussionAccessLost(injection)
      const first = store.markDiscussionAccessLost("../../etc/passwd");
      const second = store.markDiscussionAccessLost("'; DROP TABLE discussion_access_loss;--");

      // 步骤 3：断言逐值对账——参数化绑定使注入串只是字面值，表完好且无任务被标记
      expect(first).toEqual([]);
      expect(second).toEqual([]);
      expect(
        store.db.prepare("SELECT name FROM sqlite_master WHERE name='discussion_access_loss'").get(),
      ).toBeTruthy();
      expect(store.discussionAccessLost("md-352")).toBe(false);
    } finally {
      store.close();
    }
  });

});
