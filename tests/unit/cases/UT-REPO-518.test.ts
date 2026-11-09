/**
 * Case ID: UT-REPO-518  ·  STATUS: real
 *
 * 责任：状态写 L629 → `db`（store.ts）
 * 维度坐标：`tryCloseIntake` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-518.md（脚本的唯一依据）
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

describe("UT-REPO-518 · tryCloseIntake · 持久化/序列化 × round-trip", () => {

  it("persists the Closing intake state it writes", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条已 Consumed 触发 turn、lease epoch 匹配的讨论任务
      store.createOrGet(discussionTask("tc-518", "!room:518", "$evt"), "slinky", 10, "hello");
      store.markTurn("tc-518", "$evt", "Consumed");
      store.db
        .prepare("INSERT OR IGNORE INTO run_sessions VALUES(?,?,'main',NULL,NULL,NULL,?)")
        .run("tc-518", "tc-518", 1);

      // 步骤 2：调用 tryCloseIntake("tc-518", 1)
      store.tryCloseIntake("tc-518", 1);

      // 步骤 3：断言逐值对账——runs 列被写成 'Closing'，getRun 读回同值
      const row = store.db
        .prepare("SELECT discussion_intake_state FROM runs WHERE task_id=?")
        .get("tc-518") as any;
      expect(row.discussion_intake_state).toBe("Closing");
      expect(store.getRun("tc-518").discussion_intake_state).toBe("Closing");
    } finally {
      store.close();
    }
  });

});
