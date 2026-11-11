/**
 * Case ID: UT-PI-370  ·  STATUS: real
 *
 * 责任：分支 L250 `ev.runId??runId`（??；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-370.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-370 · execute · 状态分支 × 合法迁移", () => {
  it("records the response operation with the run id fallback in the debug line", async () => {  // records the response operation with the run id fallback in the debug line
    // 步骤 1：调试开启 ⇒ 调试行里带 operation_id
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
      // 步骤 3：断言 —— 调试行里有 operation_id 与 status
      expect(res.status).toBe("completed");
      const { readFileSync } = await import("node:fs");
      const lines = readFileSync(debugFile, "utf8").trim().split("\n").map((l) => JSON.parse(l));
      const response = lines.find((l) => l.kind === "response");
      expect(response).toBeDefined();
      expect(response.operation_id).toBe("run-1:initial");
      expect(response.status).toBe(200);
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
