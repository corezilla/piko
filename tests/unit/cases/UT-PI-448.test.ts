/**
 * Case ID: UT-PI-448  ·  STATUS: real
 *
 * 责任：throw L310 `reject`（守卫 `if (!accepted.ok)`；pi-runtime.ts）
 * 维度坐标：`execute` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-448.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-448 · execute · 错误路径 × 每个 typed 错误码", () => {
  it("propagates the rejection of an accepted next turn prompt", async () => {  // propagates the rejection of an accepted next turn prompt
    // 步骤 1：正常路径下 lane.accept 成功 ⇒ !accepted.ok 为假 ⇒ 不抛错
    const fx = await piFixture();
    stubModelFetch();
    try {
      fx.store.createOrGet(
        piTask("task-1", { discussion: { room_id: "!room:piko", trigger_event_id: "evt-1" } }),
        "slinky",
        10,
        "kick off",
      );
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1", { discussion: { room_id: "!room:piko", trigger_event_id: "evt-1" } }), fx.root, () => false);
      // 步骤 3：断言 —— 接受成功，没有错误上抛
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
