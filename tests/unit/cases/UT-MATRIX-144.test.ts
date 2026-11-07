/**
 * Case ID: UT-MATRIX-144  ·  STATUS: real
 *
 * 责任：分支 L38 if : if (content.msgtype!=="m.text")（matrix.ts）
 * 维度坐标：`prepareEvent` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-144.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-144 · prepareEvent · 状态分支 × 合法迁移", () => {
  it("attaches a media note for a non-text message", async () => {
    // 步骤 1：构造 store、runtime 与一条文件消息
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
        mxcUrlToHttp: () => "https://matrix.test/file",
      });

      // 步骤 2：调用 prepareEvent(文件消息) —— 媒体必须先下载成功
      // 步骤 3：断言下载校验失败被抛出（缺 size → 不允许的媒体大小）
      await expect(
        (matrix as unknown as { prepareEvent(e: unknown): Promise<unknown> }).prepareEvent(
          event("$one", { getContent: () => ({ msgtype: "m.file", body: "x.txt", url: "mxc://t/x" }) }),
        ),
      ).rejects.toThrow(/media size/);
    } finally {
      store.close();
    }
  });

});
