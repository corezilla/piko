/**
 * Case ID: UT-MATRIX-128  ·  STATUS: real
 *
 * 责任：参数 `event: MatrixEvent` 的 `每等价类合法值` 类（matrix.ts:29）
 * 维度坐标：`prepareEvent` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-128.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-128 · prepareEvent · 纯函数/无副作用 × 每等价类合法值", () => {
  it("prepares a text message into a turn", async () => {
    // 步骤 1：构造 store、runtime 与一个消息事件
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, { getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }) });

      // 步骤 2：调用 prepareEvent(消息事件)
      const prepared = await (
        matrix as unknown as { prepareEvent(e: unknown): Promise<unknown> }
      ).prepareEvent(event("$one"));

      // 步骤 3：断言房间/事件/发送者被取出，turns 指向开放的 run
      expect(prepared).toMatchObject({ room: "!room:test", event: "$one", sender: "@user:test" });
      expect((prepared as { turns: unknown[] }).turns).toHaveLength(1);
    } finally {
      store.close();
    }
  });

});
