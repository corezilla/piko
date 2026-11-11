/**
 * Case ID: UT-PI-433  ·  STATUS: real
 *
 * 责任：分支 L304 `if (task.discussion)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-433.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-433 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the discussion check on the completed outcome", async () => {  // takes the true and the false side of the discussion check on the completed outcome
    // 步骤 1a：discussion 任务 ⇒ 取真侧 ⇒ 走回合/关闭 intake 的分支
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
      expect(withDiscussion.facts.some((f) => f.kind === "closeIntake")).toBe(true);
    } finally {
      vi.unstubAllGlobals();
      await withDiscussion.close();
    }

    // 步骤 1b：非 discussion 任务 ⇒ 取假侧 ⇒ 直接返回完成，不发 closeIntake
    const withoutDiscussion = await piFixture();
    stubModelFetch();
    try {
      const res = await withoutDiscussion.runtime.execute("task-1", 1, piTask("task-1"), withoutDiscussion.root, () => false);
      expect(res.status).toBe("completed");
      expect(withoutDiscussion.facts.some((f) => f.kind === "closeIntake")).toBe(false);
    } finally {
      vi.unstubAllGlobals();
      await withoutDiscussion.close();
    }
  });
});
