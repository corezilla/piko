/**
 * Case ID: UT-REPO-354  ·  STATUS: real
 *
 * 责任：分支 L506 `catch ()`（catch；store.ts）
 * 维度坐标：`markDiscussionAccessLost` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-354.md（脚本的唯一依据）
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

describe("UT-REPO-354 · markDiscussionAccessLost · 错误路径 × 每个 typed 错误码", () => {

  it("skips a task whose stored json cannot be parsed", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一个 task_json 被破坏的 run 行（JSON.parse 会抛），外加一个正常任务
      store.createOrGet(discussionTask("md-354-a", "!room:354", "$e1"), "slinky", 10, "a");
      store.createOrGet(discussionTask("md-354-b", "!room:354", "$e2"), "slinky", 10, "b");
      store.db.prepare("UPDATE tasks SET task_json='not-json' WHERE task_id=?").run("md-354-a");

      // 步骤 2：调用 markDiscussionAccessLost("!room:354")
      const affected = store.markDiscussionAccessLost("!room:354");

      // 步骤 3：断言逐值对账——catch 分支把解析失败的那行当成"不匹配"跳过，
      // 只返回能正常解析且房间相同的任务
      expect(affected).toEqual(["md-354-b"]);
      expect(store.discussionAccessLost("md-354-a")).toBe(false);
      expect(store.discussionAccessLost("md-354-b")).toBe(true);
    } finally {
      store.close();
    }
  });

});
