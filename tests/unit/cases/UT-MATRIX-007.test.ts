/**
 * Case ID: UT-MATRIX-007  ·  STATUS: real
 *
 * 责任：`recordDiscussionAccessLost` × `状态分支` × `合法迁移`（波次一粗粒度登记）
 * 维度坐标：`recordDiscussionAccessLost` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-007.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-007 · recordDiscussionAccessLost · 状态分支 × 合法迁移", () => {
  it("records the loss fail-closed", async () => {
    // 步骤 1：构造 store、有讨论上下文的 run 与 runtime
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, undefined, true);

      // 步骤 2：调用 recordDiscussionAccessLost
      matrix.recordDiscussionAccessLost("!room:test");

      // 步骤 3：断言丢失被记下
      expect(store.discussionAccessLost("t")).toBe(true);
    } finally {
      store.close();
    }
  });

});
