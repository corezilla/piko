/**
 * Case ID: UT-MATRIX-066  ·  STATUS: real
 *
 * 责任：返回站点 L114 值 （matrix.ts:113）
 * 维度坐标：`sendDiscussionReply` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-066.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-066 · sendDiscussionReply · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the event id of a sent reply", async () => {
    // 步骤 1：构造 runtime、真实 run 行与 client 替身
    const store = newStore();
    const { client } = recordingClient();
    try {
      const run = store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, client);

      // 步骤 2：调用 sendDiscussionReply
      const eventId = await matrix.sendDiscussionReply(
        (run as { task_id: string }).task_id,
        "!room:test",
        "$event",
        1,
        "answer",
      );

      // 步骤 3：断言返回值是 SDK 给的事件 id
      expect(eventId).toBe("$sent");
    } finally {
      store.close();
    }
  });

});
