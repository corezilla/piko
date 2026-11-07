/**
 * Case ID: UT-MATRIX-061  ·  STATUS: real
 *
 * 责任：参数 `body` 的 `注入字符` 类（matrix.ts:113）
 * 维度坐标：`sendDiscussionReply` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-061.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-061 · sendDiscussionReply · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected reply body as data", async () => {
    // 步骤 1：构造 runtime、真实 run 行与 client 替身
    const store = newStore();
    const { client, sent } = recordingClient();
    try {
      const run = store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, client);

      // 步骤 2：调用 sendDiscussionReply(..., 注入串 body)
      const body = "$(rm -rf /)`; DROP TABLE x;--";
      await matrix.sendDiscussionReply((run as { task_id: string }).task_id, "!room:test", "$event", 1, body);

      // 步骤 3：断言原样送出、不执行
      expect((sent[0].content as { body: string }).body).toBe(body);
    } finally {
      store.close();
    }
  });

});
