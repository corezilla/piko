/**
 * Case ID: UT-MATRIX-062  ·  STATUS: real
 *
 * 责任：分支 L114 if : if (prepared.state==="Sent")（matrix.ts）
 * 维度坐标：`sendDiscussionReply` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-062.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-062 · sendDiscussionReply · 状态分支 × 合法迁移", () => {
  it("reuses a sent transaction instead of sending again", async () => {
    // 步骤 1：构造 runtime、真实 run 行与 client 替身
    const store = newStore();
    const { client, sent } = recordingClient();
    try {
      const run = store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, client);

      // 步骤 2：连续调用两次 sendDiscussionReply（同一事务 id）
      const runId = (run as { task_id: string }).task_id;
      const first = await matrix.sendDiscussionReply(runId, "!room:test", "$event", 1, "answer");
      const second = await matrix.sendDiscussionReply(runId, "!room:test", "$event", 1, "answer");

      // 步骤 3：断言只发了一次，第二次复用同一个事件 id（幂等）
      expect(sent).toHaveLength(1);
      expect(first).toBe(second);
    } finally {
      store.close();
    }
  });

});
