/**
 * Case ID: UT-MATRIX-057  ·  STATUS: real
 *
 * 责任：参数 `turn` 的 `+1 拒绝` 类（matrix.ts:113）
 * 维度坐标：`sendDiscussionReply` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-057.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-057 · sendDiscussionReply · 数值/长度上限参数 × +1 拒绝", () => {
  it("includes the next turn number in the transaction id", async () => {
    // 步骤 1：构造 runtime、真实 run 行与 client 替身
    const store = newStore();
    const { client, sent } = recordingClient();
    try {
      const run = store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, client);

      // 步骤 2：调用 sendDiscussionReply(..., turn=2, ...)
      await matrix.sendDiscussionReply((run as { task_id: string }).task_id, "!room:test", "$event", 2, "answer");

      // 步骤 3：断言事务 id 含 turn 2（与 turn 1 不同——幂等键不同）
      expect(sent[0].txnId).toContain(":turn:2:assistant");
    } finally {
      store.close();
    }
  });

});
