/**
 * Case ID: UT-REPO-365  ·  STATUS: real
 *
 * 责任：分支 L517 `!this.db.prepare("SELECT 1 FROM discussion_ac…`（!；store.ts）
 * 维度坐标：`discussionAccessLost` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-365.md（脚本的唯一依据）
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

describe("UT-REPO-365 · discussionAccessLost · 状态分支 × 合法迁移", () => {

  it("reports false without a loss record and true once the loss is recorded", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:517 的分支取真的输入——discussion_access_loss 里没有该 task_id 的行
      accept(store, discussionTask("d1", "!r:d1"));

      // 步骤 2：调用 discussionAccessLost(…) 并断言该侧可观测结果（返回值/状态/副作用）与设计一致
      const before = store.discussionAccessLost("d1");
      expect(before).toBe(false);
      expect((store.db.prepare("SELECT count(*) n FROM discussion_access_loss").get() as any).n).toBe(0);

      // 步骤 3：构造使该分支取假的输入——discussion_access_loss 里有该 task_id 的行（无显式 else：取假即跳过该块，断言块内副作用不发生）
      expect(store.markDiscussionAccessLost("!r:d1")).toEqual(["d1"]);

      // 步骤 4：再次调用 discussionAccessLost(…) 并断言取假侧结果；两侧都必须被观测到
      const after = store.discussionAccessLost("d1");
      expect(after).toBe(true);
      // 取假侧无副作用：查询本身不写任何东西
      expect((store.db.prepare("SELECT count(*) n FROM discussion_access_loss").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
