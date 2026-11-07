/**
 * Case ID: UT-MATRIX-141  ·  STATUS: real
 *
 * 责任：分支 L34 ! : !["m.text","m.file","m.image","m.audi（matrix.ts）
 * 维度坐标：`prepareEvent` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-141.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-141 · prepareEvent · 状态分支 × 合法迁移", () => {
  it("ignores a message whose body is not a string", async () => {
    // 步骤 1：构造 store、runtime 与一条 body 不是字符串的消息
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, { getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }) });

      // 步骤 2：调用 prepareEvent(非字符串 body)
      const prepared = await (
        matrix as unknown as { prepareEvent(e: unknown): Promise<unknown> }
      ).prepareEvent(event("$one", { getContent: () => ({ msgtype: "m.text", body: 42 }) }));

      // 步骤 3：断言被忽略
      expect(prepared).toBeUndefined();
    } finally {
      store.close();
    }
  });

});
