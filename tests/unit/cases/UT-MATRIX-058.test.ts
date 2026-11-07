/**
 * Case ID: UT-MATRIX-058  ·  STATUS: real
 *
 * 责任：参数 `turn` 的 `−1 通过` 类（matrix.ts:113）
 * 维度坐标：`sendDiscussionReply` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-058.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-058 · sendDiscussionReply · 数值/长度上限参数 × −1 通过", () => {
  it("accepts turn zero in the transaction id", async () => {
    // 步骤 1：构造 runtime、真实 run 行与 client 替身
    const store = newStore();
    const { client, sent } = recordingClient();
    try {
      const run = store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, client);

      // 步骤 2：调用 sendDiscussionReply(..., turn=0, ...)
      await matrix.sendDiscussionReply((run as { task_id: string }).task_id, "!room:test", "$event", 0, "answer");

      // 步骤 3：断言事务 id 含 turn 0（该参数无下界校验）
      expect(sent[0].txnId).toContain(":turn:0:assistant");
    } finally {
      store.close();
    }
  });

});
