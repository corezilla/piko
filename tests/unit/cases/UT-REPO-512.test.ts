/**
 * Case ID: UT-REPO-512  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `−1 通过` 类（store.ts:619）
 * 维度坐标：`tryCloseIntake` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-512.md（脚本的唯一依据）
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

describe("UT-REPO-512 · tryCloseIntake · 数值/长度上限参数 × −1 通过", () => {

  it("refuses to close when the lease epoch is one below the session epoch", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 epoch 的 −1 通过类——run_sessions 的 lease_epoch ＝ 3，调用 epoch ＝ 2
      store.createOrGet(discussionTask("tc-512", "!room:511", "$evt"), "slinky", 10, "hello");
      store.markTurn("tc-512", "$evt", "Consumed");
      store.db
        .prepare("INSERT OR IGNORE INTO run_sessions VALUES(?,?,'main',NULL,NULL,NULL,?)")
        .run("tc-512", "tc-512", 3);

      // 步骤 2：调用 tryCloseIntake("tc-512", 2)
      const closed = store.tryCloseIntake("tc-512", 2);

      // 步骤 3：断言逐值对账——epoch 是精确比较（不是 >= ），低于也不通过，返回 false
      expect(closed).toBe(false);
      expect(store.getRun("tc-512").discussion_intake_state).toBe("Open");
    } finally {
      store.close();
    }
  });

});
