/**
 * Case ID: UT-REPO-083  ·  STATUS: real
 *
 * 责任：分支 L219 `triggerContent ?? ""`（??；store.ts）
 * 维度坐标：`createOrGet` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-083.md（脚本的唯一依据）
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

describe("UT-REPO-083 · createOrGet · 状态分支 × 合法迁移", () => {

  it("substitutes an empty string for an absent triggerContent", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:219 的 ?? 取右侧的输入——triggerContent 缺省
      // 步骤 2：调用 createOrGet(...)
      store.createOrGet(discussionTask("co-083"), "slinky", 10);

      // 步骤 3：断言逐值对账——?? 右侧 "" 生效，turn 的 visible_content 为空串
      const turn = store.db.prepare("SELECT visible_content FROM discussion_turns WHERE task_id=?").get("co-083") as any;
      expect(turn.visible_content).toBe("");
    } finally {
      store.close();
    }
  });

});
