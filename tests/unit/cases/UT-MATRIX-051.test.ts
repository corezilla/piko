/**
 * Case ID: UT-MATRIX-051  ·  STATUS: real
 *
 * 责任：参数 `room` 的 `超长` 类（matrix.ts:113）
 * 维度坐标：`sendDiscussionReply` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-051.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-051 · sendDiscussionReply · 字符串/路径/枚举输入 × 超长", () => {
  it("sends the reply to an over-long room id", async () => {
    // 步骤 1：构造 runtime、真实 run 行与 client 替身
    const store = newStore();
    const { client, sent } = recordingClient();
    try {
      const run = store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, client);

      // 步骤 2：调用 sendDiscussionReply(run, 超长房间, ...)
      const room = "!r".repeat(1000);
      await matrix.sendDiscussionReply((run as { task_id: string }).task_id, room, "$event", 1, "answer");

      // 步骤 3：断言原样送出
      expect(sent[0].room).toBe(room);
    } finally {
      store.close();
    }
  });

});
