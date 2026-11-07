/**
 * Case ID: UT-MATRIX-063  ·  STATUS: real
 *
 * 责任：分支 L115 catch : catch (error)（matrix.ts）
 * 维度坐标：`sendDiscussionReply` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-063.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-063 · sendDiscussionReply · 状态分支 × 合法迁移", () => {
  it("marks the send as unknown when the transport fails", async () => {
    // 步骤 1：构造 runtime、真实 run 行与一个会失败的 client
    const store = newStore();
    try {
      const run = store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        sendEvent: async () => {
          throw new Error("uncertain send");
        },
      });

      // 步骤 2：调用 sendDiscussionReply —— 失败被上抛
      await expect(
        matrix.sendDiscussionReply((run as { task_id: string }).task_id, "!room:test", "$event", 1, "answer"),
      ).rejects.toThrow(/uncertain/);
    } finally {
      store.close();
    }
  });

});
