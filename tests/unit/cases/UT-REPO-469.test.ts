/**
 * Case ID: UT-REPO-469  ·  STATUS: real
 *
 * 责任：分支 L590 `catch ()`（catch；store.ts）
 * 维度坐标：`openDiscussionRuns` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-469.md（脚本的唯一依据）
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

describe("UT-REPO-469 · openDiscussionRuns · 错误路径 × 每个 typed 错误码", () => {

  it("skips a run whose stored json cannot be parsed", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一个 task_json 被破坏的 run 行，外加一个正常任务
      store.createOrGet(discussionTask("od-469-a", "!room:469", "$e1"), "slinky", 10, "a");
      store.createOrGet(discussionTask("od-469-b", "!room:469", "$e2"), "slinky", 10, "b");
      store.db.prepare("UPDATE tasks SET task_json='not-json' WHERE task_id=?").run("od-469-a");

      // 步骤 2：调用 openDiscussionRuns("!room:469")
      const runs = store.openDiscussionRuns("!room:469");

      // 步骤 3：断言逐值对账——catch 分支把解析失败的那行跳过，只返回能正常解析的任务
      expect(runs).toEqual(["od-469-b"]);
    } finally {
      store.close();
    }
  });

});
