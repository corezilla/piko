/**
 * Case ID: UT-REPO-510  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `恰好通过` 类（store.ts:619）
 * 维度坐标：`tryCloseIntake` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-510.md（脚本的唯一依据）
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

describe("UT-REPO-510 · tryCloseIntake · 数值/长度上限参数 × 恰好通过", () => {

  it("closes the intake when the lease epoch matches exactly", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 epoch 的恰好通过类——run_sessions 的 lease_epoch ＝ 3，调用的 epoch 也是 3
      store.createOrGet(discussionTask("tc-510", "!room:510", "$evt"), "slinky", 10, "hello");
      store.markTurn("tc-510", "$evt", "Consumed");
      store.db
        .prepare("INSERT OR IGNORE INTO run_sessions VALUES(?,?,'main',NULL,NULL,NULL,?)")
        .run("tc-510", "tc-510", 3);

      // 步骤 2：调用 tryCloseIntake("tc-510", 3)
      const closed = store.tryCloseIntake("tc-510", 3);

      // 步骤 3：断言逐值对账——epoch 恰好命中，intake 从 Open 推进到 Closing
      expect(closed).toBe(true);
      expect(store.getRun("tc-510").discussion_intake_state).toBe("Closing");
    } finally {
      store.close();
    }
  });

});
