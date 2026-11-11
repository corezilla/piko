/**
 * Case ID: UT-PI-454  ·  STATUS: real
 *
 * 责任：返回站点 L243 值 `undefined` 逐值断言（pi-runtime.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-454.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-454 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns undefined from the before payload hook", async () => {  // returns undefined from the before payload hook
    // 步骤 1：跑一轮 ⇒ before_payload 返回 undefined（不替换参数）
    const fx = await piFixture();
    const stub = stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 请求体未被 hook 改写：指令原文仍在
      expect(res.status).toBe("completed");
      const body = stub.calls[0]?.body as { input?: { content?: { text?: string }[] }[] } | undefined;
      const texts = (body?.input ?? []).flatMap((m) => m.content ?? []).map((c) => c.text ?? "");
      expect(texts.join(" ")).toContain("say hi");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
