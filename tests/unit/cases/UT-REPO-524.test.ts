/**
 * Case ID: UT-REPO-524  ·  STATUS: real
 *
 * 责任：返回站点 L629 值 `this.db.prepare("UPDATE runs SET discus…` 逐值断言（store.ts）
 * 维度坐标：`tryCloseIntake` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-524.md（脚本的唯一依据）
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

describe("UT-REPO-524 · tryCloseIntake · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns true from the state-update return site", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 intake 为 Open、无 pending turn、lease epoch 匹配的前置状态
      store.createOrGet(discussionTask("tc-524", "!room:524", "$evt"), "slinky", 10, "hello");
      store.markTurn("tc-524", "$evt", "Consumed");
      store.db
        .prepare("INSERT OR IGNORE INTO run_sessions VALUES(?,?,'main',NULL,NULL,NULL,?)")
        .run("tc-524", "tc-524", 1);

      // 步骤 2：调用 tryCloseIntake("tc-524", 1)
      const closed = store.tryCloseIntake("tc-524", 1);

      // 步骤 3：断言逐值对账——UPDATE 命中一行（changes===1），该站点返回 true
      expect(closed).toBe(true);
      expect(store.getRun("tc-524").discussion_intake_state).toBe("Closing");
    } finally {
      store.close();
    }
  });

});
