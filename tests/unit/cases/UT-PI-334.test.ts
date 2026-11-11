/**
 * Case ID: UT-PI-334  ·  STATUS: real
 *
 * 责任：分支 L160 `!profile`（!；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-334.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-334 · execute · 状态分支 × 合法迁移", () => {
  it("takes the false side of the profile existence check and throws the typed error", async () => {  // takes the false side of the profile existence check and throws the typed error
    // 步骤 1：profile 不存在 ⇒ !profile 为真
    const fx = await piFixture();
    stubModelFetch();
    try {
      const task = piTask("task-1", { permissions: { read_paths: [], write_paths: [], tool_profile_ref: "absent" } });
      // 步骤 2：调用 execute(…)
      let error: unknown;
      try {
        await fx.runtime.execute("run-1", 1, task, fx.root, () => false);
      } catch (e) {
        error = e;
      }
      // 步骤 3：断言 —— typed 错误码逐值对账
      expect((error as { code?: unknown }).code).toBe("UnknownToolProfile");
      expect((error as Error).message).toBe("unknown tool profile absent");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
