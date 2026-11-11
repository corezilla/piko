/**
 * Case ID: UT-PI-418  ·  STATUS: real
 *
 * 责任：分支 L290 `? task.discussion :`（ternary；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-418.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-418 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the discussion ternary in the initial turn lookup", async () => {  // takes the true and the false side of the discussion ternary in the initial turn lookup
    // 步骤 1a：discussion 任务 ⇒ 取真侧，找 turn_seq===1 的初始回合
    const withDiscussion = await piFixture();
    stubModelFetch();
    try {
      withDiscussion.store.createOrGet(
        piTask("task-1", { discussion: { room_id: "!room:piko", trigger_event_id: "evt-1" } }),
        "slinky",
        10,
        "kick off",
      );
      const res = await withDiscussion.runtime.execute("task-1", 1, piTask("task-1", { discussion: { room_id: "!room:piko", trigger_event_id: "evt-1" } }), withDiscussion.root, () => false);
      expect(res.status).toBe("completed");
      // 回合被上报为 QueuedInPi
      expect(withDiscussion.facts.some((f) => f.kind === "turn" && (f as { status: string }).status === "QueuedInPi")).toBe(true);
    } finally {
      vi.unstubAllGlobals();
      await withDiscussion.close();
    }

    // 步骤 1b：非 discussion 任务 ⇒ 取假侧，无初始回合
    const withoutDiscussion = await piFixture();
    stubModelFetch();
    try {
      const res = await withoutDiscussion.runtime.execute("task-1", 1, piTask("task-1"), withoutDiscussion.root, () => false);
      expect(res.status).toBe("completed");
      expect(withoutDiscussion.facts.some((f) => f.kind === "turn")).toBe(false);
    } finally {
      vi.unstubAllGlobals();
      await withoutDiscussion.close();
    }
  });
});
