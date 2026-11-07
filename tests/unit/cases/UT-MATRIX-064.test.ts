/**
 * Case ID: UT-MATRIX-064  ·  STATUS: real
 *
 * 责任：throw L115 reject（守卫 `catch`；matrix.ts:113）
 * 维度坐标：`sendDiscussionReply` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-064.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-064 · sendDiscussionReply · 错误路径 × 每个 typed 错误码", () => {
  it("rethrows the transport failure after marking the send unknown", async () => {
    // 步骤 1：构造 runtime、真实 run 行与一个会失败的 client
    const store = newStore();
    try {
      const run = store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        sendEvent: async () => {
          throw new Error("uncertain send");
        },
      });

      // 步骤 2：调用 sendDiscussionReply
      // 步骤 3：断言错误原样上抛（不吞错——发送状态不明必须让上层知道）
      await expect(
        matrix.sendDiscussionReply((run as { task_id: string }).task_id, "!room:test", "$event", 1, "answer"),
      ).rejects.toThrow("uncertain send");
    } finally {
      store.close();
    }
  });

});
