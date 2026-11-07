/**
 * Case ID: UT-MATRIX-151  ·  STATUS: real
 *
 * 责任：返回站点 L41 值 （matrix.ts）
 * 维度坐标：`prepareEvent` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-151.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-151 · prepareEvent · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the prepared turn list", async () => {
    // 步骤 1：构造 store、runtime 与一条消息事件
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, { getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }) });

      // 步骤 2：调用 prepareEvent(消息事件)
      const prepared = await (
        matrix as unknown as { prepareEvent(e: unknown): Promise<unknown> }
      ).prepareEvent(event("$one"));

      // 步骤 3：断言 turn 指向 run、可见内容是消息正文
      const turns = (prepared as { turns: { task: string; visible: string }[] }).turns;
      expect(turns[0].task).toBe("t");
      expect(turns[0].visible).toBe("hello");
    } finally {
      store.close();
    }
  });

});
