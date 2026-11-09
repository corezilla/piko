/**
 * Case ID: UT-REPO-082  ·  STATUS: real
 *
 * 责任：分支 L214 `if (task.discussion)`（if；store.ts）
 * 维度坐标：`createOrGet` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-082.md（脚本的唯一依据）
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

describe("UT-REPO-082 · createOrGet · 状态分支 × 合法迁移", () => {

  it("inserts the trigger turn when the task carries a discussion", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:214 的 if (task.discussion) 取真的输入
      // 步骤 2：调用 createOrGet(..., triggerContent="hello")
      const outcome = store.createOrGet(discussionTask("co-082", "!room:082", "$evt082"), "slinky", 10, "hello");

      // 步骤 3：断言逐值对账——真侧在 discussion_turns 落一行 Pending/turn_seq=1
      expect(outcome.kind).toBe("created");
      const turn = store.db.prepare("SELECT * FROM discussion_turns WHERE task_id=?").get("co-082") as any;
      expect(turn.event_id).toBe("$evt082");
      expect(turn.turn_seq).toBe(1);
      expect(turn.status).toBe("Pending");
      expect(turn.visible_content).toBe("hello");
    } finally {
      store.close();
    }
  });

});
