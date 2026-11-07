/**
 * Case ID: UT-MATRIX-148  ·  STATUS: real
 *
 * 责任：返回站点 L33 值 （matrix.ts）
 * 维度坐标：`prepareEvent` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-148.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-148 · prepareEvent · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the self-echo shape with no turns", async () => {
    // 步骤 1：构造 store、runtime 与一条来自 Piko 自己的消息
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, { getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }) });

      // 步骤 2：调用 prepareEvent(自己的消息)
      const prepared = await (
        matrix as unknown as { prepareEvent(e: unknown): Promise<unknown> }
      ).prepareEvent(event("$self", { getSender: () => "@piko:test" }));

      // 步骤 3：断言返回房间/事件/发送者且 turn 为空
      expect(prepared).toMatchObject({ room: "!room:test", event: "$self", sender: "@piko:test" });
      expect((prepared as { turns: unknown[] }).turns).toEqual([]);
    } finally {
      store.close();
    }
  });

});
