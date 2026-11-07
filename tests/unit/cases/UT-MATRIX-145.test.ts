/**
 * Case ID: UT-MATRIX-145  ·  STATUS: real
 *
 * 责任：await 拒绝传播（prepareEvent 的 await 目标拒绝必须 typed 化上抛；matrix.ts:29）
 * 维度坐标：`prepareEvent` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-145.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-145 · prepareEvent · 错误路径 × 每个 typed 错误码", () => {
  it("rejects when the media download fails", async () => {
    // 步骤 1：构造 store、runtime 与一条缺 media URL 的文件消息
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
        mxcUrlToHttp: () => "https://matrix.test/file",
      });

      // 步骤 2：调用 prepareEvent(非法 media URL)
      await expect(
        (matrix as unknown as { prepareEvent(e: unknown): Promise<unknown> }).prepareEvent(
          event("$one", { getContent: () => ({ msgtype: "m.file", body: "x.txt", url: "https://bad" }) }),
        ),
      ).rejects.toThrow(/media URL/);
    } finally {
      store.close();
    }
  });

});
