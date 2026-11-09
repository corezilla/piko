/**
 * Case ID: UT-REPO-523  ·  STATUS: real
 *
 * 责任：返回站点 L628 值 `false` 逐值断言（store.ts）
 * 维度坐标：`tryCloseIntake` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-523.md（脚本的唯一依据）
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

describe("UT-REPO-523 · tryCloseIntake · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns false from the not-Open return site", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 intake 为 Disabled 的前置状态
      store.createOrGet(task("tc-523"), "slinky", 10);
      store.db
        .prepare("INSERT OR IGNORE INTO run_sessions VALUES(?,?,'main',NULL,NULL,NULL,?)")
        .run("tc-523", "tc-523", 1);

      // 步骤 2：调用 tryCloseIntake("tc-523", 1)
      const closed = store.tryCloseIntake("tc-523", 1);

      // 步骤 3：断言逐值对账——该返回站点返回 false
      expect(closed).toBe(false);
    } finally {
      store.close();
    }
  });

});
