/**
 * Case ID: UT-MATRIX-009  ·  STATUS: real
 *
 * 责任：`sendDiscussionReply` × `并发/可重入` × `并发对偶/交错`（波次一粗粒度登记）
 * 维度坐标：`sendDiscussionReply` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-009.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-009 · sendDiscussionReply · 并发/可重入 × 并发对偶/交错", () => {
  it("sends one reply per turn under concurrent calls", async () => {
    // 步骤 1：构造 store、真实 run 行与记录发送的 client 替身
    const store = newStore();
    const { client, sent } = recordingClient();
    try {
      const run = store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, client);

      // 步骤 2：并发调用两次 sendDiscussionReply（同一事务 id）
      const runId = (run as { task_id: string }).task_id;
      await Promise.all([
        matrix.sendDiscussionReply(runId, "!room:test", "$event", 1, "answer"),
        matrix.sendDiscussionReply(runId, "!room:test", "$event", 1, "answer"),
      ]);

      // 步骤 3：断言两次调用带的是同一个事务 id（幂等键由 run/turn 决定，
      //         不因并发而变）——去重发生在 homeserver 侧
      expect(sent.length).toBeGreaterThanOrEqual(1);
      expect(new Set(sent.map((s) => s.txnId)).size).toBe(1);
    } finally {
      store.close();
    }
  });

});
