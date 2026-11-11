/**
 * Case ID: UT-PI-310  ·  STATUS: real
 *
 * 责任：状态写 L130 → `this.graphragAdapter`（pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-310.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-310 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("writes the graphrag adapter instance into the runtime state", async () => {  // writes the graphrag adapter instance into the runtime state
    // 步骤 1：构造前置状态 —— identity.doc_search 配了 + key 给了
    const fx = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", doc_search: { provider: "graphrag", api_key_secret_ref: "env:GRAPHRAG_API_KEY", base_url: "https://graphrag.internal", default_scope: "design" } } }),
      graphragApiKey: "graphrag-key",
    });
    try {
      // 步骤 2/3：读回权威事实源，逐值对账写入语义
      const adapter = fx.state<{ baseUrl: string; apiKey: string; defaultScope: string }>("graphragAdapter");
      expect(adapter).toBeDefined();
      expect(adapter!.baseUrl).toBe("https://graphrag.internal");
      expect(adapter!.apiKey).toBe("graphrag-key");
      expect(adapter!.defaultScope).toBe("design");
    } finally {
      await fx.close();
    }
  });
});
