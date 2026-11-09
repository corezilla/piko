/**
 * Case ID: UT-REPO-519  ·  STATUS: real
 *
 * 责任：返回站点 L620 值 `this.tx(() => { const pending = (this.d…` 逐值断言（store.ts）
 * 维度坐标：`tryCloseIntake` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-519.md（脚本的唯一依据）
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

describe("UT-REPO-519 · tryCloseIntake · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the boolean produced inside the closing transaction", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条已 Consumed 触发 turn、lease epoch 匹配的讨论任务
      store.createOrGet(discussionTask("tc-519", "!room:519", "$evt"), "slinky", 10, "hello");
      store.markTurn("tc-519", "$evt", "Consumed");
      store.db
        .prepare("INSERT OR IGNORE INTO run_sessions VALUES(?,?,'main',NULL,NULL,NULL,?)")
        .run("tc-519", "tc-519", 1);

      // 步骤 2：调用 tryCloseIntake("tc-519", 1)
      const closed = store.tryCloseIntake("tc-519", 1);

      // 步骤 3：断言逐值对账——tx 包装返回的就是该事务算出的布尔值
      expect(closed).toBe(true);
      expect(typeof closed).toBe("boolean");
    } finally {
      store.close();
    }
  });

});
