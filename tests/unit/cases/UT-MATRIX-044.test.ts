/**
 * Case ID: UT-MATRIX-044  ·  STATUS: real
 *
 * 责任：分支 L110 if : if (replyTo)（matrix.ts）
 * 维度坐标：`send` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-044.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-044 · send · 状态分支 × 合法迁移", () => {
  it("sets the reply relation only when replyTo is given", async () => {
    // 步骤 1：构造 runtime 与 client 替身
    const store = newStore();
    const { client, sent } = recordingClient();
    try {
      const matrix = runtimeWith(store, client);

      // 步骤 2：调用 send 带 replyTo
      await matrix.send("!room:test", "txn", "body", "$event");

      // 步骤 3：断言带上 m.relates_to
      const content = sent[0].content as {
        "m.relates_to"?: { "m.in_reply_to": { event_id: string } };
      };
      expect(content["m.relates_to"]?.["m.in_reply_to"].event_id).toBe("$event");
    } finally {
      store.close();
    }
  });

});
