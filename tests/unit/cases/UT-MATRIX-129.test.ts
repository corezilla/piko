/**
 * Case ID: UT-MATRIX-129  ·  STATUS: real
 *
 * 责任：参数 `event` 的 `边界(上/下/零/空/满)` 类（matrix.ts:29）
 * 维度坐标：`prepareEvent` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-129.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-129 · prepareEvent · 纯函数/无副作用 × 每等价类合法值", () => {
  it("ignores an event with no id", async () => {
    // 步骤 1：构造 store、runtime 与一个没有 id 的事件
    const store = newStore();
    try {
      const matrix = runtimeWith(store, { getJoinedRooms: async () => ({ joined_rooms: [] }) });

      // 步骤 2：调用 prepareEvent(无 id 事件)
      const prepared = await (
        matrix as unknown as { prepareEvent(e: unknown): Promise<unknown> }
      ).prepareEvent(event("$one", { getId: () => undefined }));

      // 步骤 3：断言被忽略（返回 undefined）
      expect(prepared).toBeUndefined();
    } finally {
      store.close();
    }
  });

});
