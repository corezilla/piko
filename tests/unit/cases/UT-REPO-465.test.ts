/**
 * Case ID: UT-REPO-465  ·  STATUS: real
 *
 * 责任：参数 `room: string` 的 `空` 类（store.ts:583）
 * 维度坐标：`openDiscussionRuns` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-465.md（脚本的唯一依据）
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

describe("UT-REPO-465 · openDiscussionRuns · 字符串/路径/枚举输入 × 空", () => {

  it("returns no run for an empty room id", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 room 的空类——''（空串）；库中有一间非空房间的讨论任务
      store.createOrGet(discussionTask("od-465", "!room:465", "$evt"), "slinky", 10, "hello");

      // 步骤 2：调用 openDiscussionRuns("")
      const runs = store.openDiscussionRuns("");

      // 步骤 3：断言逐值对账——没有任务的 room_id 是空串，故返回空数组
      expect(runs).toEqual([]);
    } finally {
      store.close();
    }
  });

});
