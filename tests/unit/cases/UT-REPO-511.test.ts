/**
 * Case ID: UT-REPO-511  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `+1 拒绝` 类（store.ts:619）
 * 维度坐标：`tryCloseIntake` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-511.md（脚本的唯一依据）
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

describe("UT-REPO-511 · tryCloseIntake · 数值/长度上限参数 × +1 拒绝", () => {

  it("refuses to close when the lease epoch is one above the session epoch", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 epoch 的 +1 拒绝类——run_sessions 的 lease_epoch ＝ 3，调用 epoch ＝ 4
      store.createOrGet(discussionTask("tc-511", "!room:511", "$evt"), "slinky", 10, "hello");
      store.markTurn("tc-511", "$evt", "Consumed");
      store.db
        .prepare("INSERT OR IGNORE INTO run_sessions VALUES(?,?,'main',NULL,NULL,NULL,?)")
        .run("tc-511", "tc-511", 3);

      // 步骤 2：调用 tryCloseIntake("tc-511", 4)
      const closed = store.tryCloseIntake("tc-511", 4);

      // 步骤 3：断言逐值对账——epoch 不匹配，EXISTS 守卫不成立，返回 false，状态不变
      expect(closed).toBe(false);
      expect(store.getRun("tc-511").discussion_intake_state).toBe("Open");
    } finally {
      store.close();
    }
  });

});
