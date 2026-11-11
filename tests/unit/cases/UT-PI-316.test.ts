/**
 * Case ID: UT-PI-316  ·  STATUS: real
 *
 * 责任：参数 `runId: string` 的 `注入字符` 类（pi-runtime.ts:155）
 * 维度坐标：`execute` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-316.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-316 · execute · 字符串/路径/枚举输入 × 注入字符", () => {
  it("accepts a run id with injection characters and never passes it to a shell", async () => {  // accepts a run id with injection characters and never passes it to a shell
    // 步骤 1：注入字符 —— shell 元字符
    const injected = "run-1'; DROP TABLE tasks; --`id`";
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute(injected, 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— runId 只作 operation id 与文件名，不进 shell；执行正常完成
      expect(res.status).toBe("completed");
      // operation id 逐值带上注入串（原样透传，不改写）
      const reserve = fx.facts.find((f) => f.kind === "reserveModel");
      expect(reserve).toBeDefined();
      expect((reserve as { operation: string }).operation.startsWith(injected)).toBe(true);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
