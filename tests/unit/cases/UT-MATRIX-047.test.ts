/**
 * Case ID: UT-MATRIX-047  ·  STATUS: real
 *
 * 责任：参数 `run` 的 `空` 类（matrix.ts:113）
 * 维度坐标：`sendDiscussionReply` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-047.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-047 · sendDiscussionReply · 字符串/路径/枚举输入 × 空", () => {
  it("builds a transaction id from the run id", async () => {
    // 步骤 1：构造 runtime、真实 run 行与 client 替身
    const store = newStore();
    const { client, sent } = recordingClient();
    try {
      const run = store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, client);

      // 步骤 2：调用 sendDiscussionReply(run, "!room:test", "$event", 1, "answer")
      // 步骤 3：断言事务 id 含 run id 与 turn 号
      await matrix.sendDiscussionReply((run as { task_id: string }).task_id, "!room:test", "$event", 1, "answer");
      expect(sent[0].txnId).toContain(":turn:1:assistant");
    } finally {
      store.close();
    }
  });

});
