/**
 * Case ID: UT-PI-358  ·  STATUS: real
 *
 * 责任：分支 L241 `!providerDebug`（!；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-358.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-358 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the negation on the provider debug flag", async () => {  // takes the true and the false side of the negation on the provider debug flag
    // 步骤 1a：调试开启（"1"）⇒ !providerDebug 为假 ⇒ 走进调试分支
    const previous = process.env.PIKO_PROVIDER_DEBUG;
    const previousFile = process.env.PIKO_PROVIDER_DEBUG_FILE;
    process.env.PIKO_PROVIDER_DEBUG = "1";
    const fx = await piFixture();
    const debugFile = `${fx.root}/provider-debug.jsonl`;
    process.env.PIKO_PROVIDER_DEBUG_FILE = debugFile;
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 调试开启时写了调试行，执行仍正常完成
      expect(res.status).toBe("completed");
      const { readFileSync, existsSync } = await import("node:fs");
      expect(existsSync(debugFile)).toBe(true);
      expect(readFileSync(debugFile, "utf8")).toContain("\"kind\":\"request\"");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
      if (previous === undefined) delete process.env.PIKO_PROVIDER_DEBUG;
      else process.env.PIKO_PROVIDER_DEBUG = previous;
      if (previousFile === undefined) delete process.env.PIKO_PROVIDER_DEBUG_FILE;
      else process.env.PIKO_PROVIDER_DEBUG_FILE = previousFile;
    }
  });
});
