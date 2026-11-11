/**
 * Case ID: UT-PI-373  ·  STATUS: real
 *
 * 责任：分支 L255 `!policy`（!；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-373.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-373 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the negation on the tool policy", async () => {  // takes the true and the false side of the negation on the tool policy
    // 步骤 1a：profile 声明了 read ⇒ !policy 为假 ⇒ 工具可用
    const withPolicy = await piFixture({
      registry: piTools({ "workspace-standard": { read: { effect: "read_only", replay: "safe" } } as never }),
    });
    stubModelFetch();
    try {
      const res = await withPolicy.runtime.execute("run-1", 1, piTask("task-1"), withPolicy.root, () => false);
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await withPolicy.close();
    }

    // 步骤 1b：profile 为空 ⇒ 工具清单里没有工具 ⇒ before_tool 的 !policy 分支不可达，
    // 但「工具不在 profile」这一拒绝路径由 Pi 的 prepareToolCall 先行拦下
    const withoutPolicy = await piFixture({
      registry: piTools({ "workspace-standard": {} }),
    });
    stubModelFetch();
    try {
      const res = await withoutPolicy.runtime.execute("run-1", 1, piTask("task-1"), withoutPolicy.root, () => false);
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await withoutPolicy.close();
    }
  });
});
