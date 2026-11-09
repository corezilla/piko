/**
 * Case ID: UT-REPO-350  ·  STATUS: real
 *
 * 责任：参数 `room: string` 的 `空` 类（store.ts:497）
 * 维度坐标：`markDiscussionAccessLost` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-350.md（脚本的唯一依据）
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

describe("UT-REPO-350 · markDiscussionAccessLost · 字符串/路径/枚举输入 × 空", () => {

  it("matches no task for an empty room id", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 room 的空类——''（空串）；库中有一间非空房间的讨论任务
      store.createOrGet(discussionTask("md-350", "!room:350", "$evt"), "slinky", 10, "hello");

      // 步骤 2：调用 markDiscussionAccessLost("")
      const affected = store.markDiscussionAccessLost("");

      // 步骤 3：断言逐值对账——没有任务的 room_id 是空串，故无任务受影响
      expect(affected).toEqual([]);
      expect(store.discussionAccessLost("md-350")).toBe(false);
    } finally {
      store.close();
    }
  });

});
