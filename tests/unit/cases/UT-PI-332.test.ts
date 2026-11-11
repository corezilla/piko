/**
 * Case ID: UT-PI-332  ·  STATUS: real
 *
 * 责任：可选参数 `onDiscussionReply` 缺省/显式两态（pi-runtime.ts:155）
 * 维度坐标：`execute` × `数值/长度上限参数` × `未知枚举`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-332.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-332 · execute · 数值/长度上限参数 × 未知枚举", () => {
  it("treats an omitted discussion reply callback and an explicit one as the two distinct states", async () => {  // treats an omitted discussion reply callback and an explicit one as the two distinct states
    // 步骤 1a：缺省 ⇒ 回调不存在
    const omitted = await piFixture();
    stubModelFetch();
    try {
      const res = await omitted.runtime.execute("run-1", 1, piTask("task-1"), omitted.root, () => false);
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await omitted.close();
    }

    // 步骤 1b：显式给了 ⇒ 回调存在但无回合可回
    const given = await piFixture();
    stubModelFetch();
    let calls = 0;
    try {
      const res = await given.runtime.execute("run-1", 1, piTask("task-1"), given.root, () => false, async () => {
        calls += 1;
      });
      expect(res.status).toBe("completed");
      expect(calls).toBe(0);
    } finally {
      vi.unstubAllGlobals();
      await given.close();
    }
  });
});
