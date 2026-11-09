/**
 * Case ID: UT-REPO-522  ·  STATUS: real
 *
 * 责任：返回站点 L627 值 `true` 逐值断言（store.ts）
 * 维度坐标：`tryCloseIntake` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-522.md（脚本的唯一依据）
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

describe("UT-REPO-522 · tryCloseIntake · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns true from the already-Closing return site", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 intake 已是 Closing 的前置状态
      store.createOrGet(discussionTask("tc-522", "!room:522", "$evt"), "slinky", 10, "hello");
      store.markTurn("tc-522", "$evt", "Consumed");
      store.db
        .prepare("INSERT OR IGNORE INTO run_sessions VALUES(?,?,'main',NULL,NULL,NULL,?)")
        .run("tc-522", "tc-522", 1);
      store.db
        .prepare("UPDATE runs SET discussion_intake_state='Closing' WHERE task_id=?")
        .run("tc-522");

      // 步骤 2：调用 tryCloseIntake("tc-522", 1)
      const closed = store.tryCloseIntake("tc-522", 1);

      // 步骤 3：断言逐值对账——该返回站点返回 true
      expect(closed).toBe(true);
    } finally {
      store.close();
    }
  });

});
