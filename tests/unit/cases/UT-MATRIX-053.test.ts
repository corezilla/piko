/**
 * Case ID: UT-MATRIX-053  ·  STATUS: real
 *
 * 责任：参数 `event` 的 `空` 类（matrix.ts:113）
 * 维度坐标：`sendDiscussionReply` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-053.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-053 · sendDiscussionReply · 字符串/路径/枚举输入 × 空", () => {
  it("replies to an empty event id", async () => {
    // 步骤 1：构造 runtime、真实 run 行与 client 替身
    const store = newStore();
    const { client, sent } = recordingClient();
    try {
      const run = store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, client);

      // 步骤 2：调用 sendDiscussionReply(run, 房间, "", 1, "answer")
      await matrix.sendDiscussionReply((run as { task_id: string }).task_id, "!room:test", "", 1, "answer");

      // 步骤 3：断言没有 m.relates_to——空串是假值，send 的 if (replyTo) 不成立
      expect((sent[0].content as { "m.relates_to"?: unknown })["m.relates_to"]).toBeUndefined();
    } finally {
      store.close();
    }
  });

});
