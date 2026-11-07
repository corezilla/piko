/**
 * Case ID: UT-MATRIX-005  ·  STATUS: real
 *
 * 责任：`prepareEvent` × `状态分支` × `合法迁移`（波次一粗粒度登记）
 * 维度坐标：`prepareEvent` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-005.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-005 · prepareEvent · 状态分支 × 合法迁移", () => {
  it("prepares a room message into a run turn", async () => {
    // 步骤 1：构造 store、有讨论上下文的 run 与 runtime
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, { getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }) });

      // 步骤 2：调用 prepareEvent(消息事件)
      const prepared = await (
        matrix as unknown as { prepareEvent(e: unknown): Promise<unknown> }
      ).prepareEvent(event("$one"));

      // 步骤 3：断言房间/事件被取出，且 turn 指向开放的 run
      expect(prepared).toMatchObject({ room: "!room:test", event: "$one" });
      expect((prepared as { turns: unknown[] }).turns).toHaveLength(1);
    } finally {
      store.close();
    }
  });

});
