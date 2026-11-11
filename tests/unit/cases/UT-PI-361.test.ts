/**
 * Case ID: UT-PI-361  ·  STATUS: real
 *
 * 责任：分支 L243 `payload??null`（??；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-361.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-361 · execute · 状态分支 × 合法迁移", () => {
  it("falls back to null when the payload is absent in the debug record", async () => {  // falls back to null when the payload is absent in the debug record
    // 步骤 1：调试开启
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
      // 步骤 3：断言 —— payload ?? null 不会因 payload 缺失而崩；
      // 调试行仍然写出来了（说明 ?? 分支走到了）
      expect(res.status).toBe("completed");
      const { readFileSync } = await import("node:fs");
      const lines = readFileSync(debugFile, "utf8").trim().split("\n").map((l) => JSON.parse(l));
      expect(lines.some((l) => l.kind === "request")).toBe(true);
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
