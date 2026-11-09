/**
 * Case ID: UT-REPO-070  ·  STATUS: real
 *
 * 责任：参数 `triggerContent: string` 的 `空` 类（store.ts:183）
 * 维度坐标：`createOrGet` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-070.md（脚本的唯一依据）
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

describe("UT-REPO-070 · createOrGet · 字符串/路径/枚举输入 × 空", () => {

  it("stores an empty triggerContent as an empty visible_content", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 triggerContent 的空类——'' 与缺省
      store.createOrGet(discussionTask("co-070-a"), "slinky", 10, "");
      store.createOrGet(discussionTask("co-070-b"), "slinky", 10);

      // 步骤 2：调用 createOrGet(...)
      // 步骤 3：断言逐值对账——两种空态都落到 visible_content=""
      const a = store.db.prepare("SELECT visible_content FROM discussion_turns WHERE task_id=?").get("co-070-a") as any;
      const b = store.db.prepare("SELECT visible_content FROM discussion_turns WHERE task_id=?").get("co-070-b") as any;
      expect(a.visible_content).toBe("");
      expect(b.visible_content).toBe("");
    } finally {
      store.close();
    }
  });

});
