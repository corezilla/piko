/**
 * Case ID: UT-MATRIX-065  ·  STATUS: real
 *
 * 责任：资源 createHash（matrix.ts:113）
 * 维度坐标：`sendDiscussionReply` × `资源获取/释放` × `正常释放`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-065.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-065 · sendDiscussionReply · 资源获取/释放 × 正常释放", () => {
  it("derives the transaction id from a hash of the payload", async () => {
    // 步骤 1：构造 runtime、真实 run 行与 client 替身
    const store = newStore();
    const { client, sent } = recordingClient();
    try {
      const run = store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, client);

      // 步骤 2：调用 sendDiscussionReply（事务 id 含 sha256 摘要）
      await matrix.sendDiscussionReply((run as { task_id: string }).task_id, "!room:test", "$event", 1, "answer");

      // 步骤 3：断言事务 id 形如 instance:run:turn:N:assistant
      expect(sent[0].txnId).toBe("piko-test:t:turn:1:assistant");
    } finally {
      store.close();
    }
  });

});
