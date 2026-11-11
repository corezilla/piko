/**
 * Case ID: UT-PI-261  ·  STATUS: real
 *
 * 责任：参数 `config: RuntimeConfig` 的 `非法值` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-261.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-261 · PiRuntime.constructor · 纯函数/无副作用 × 非法值", () => {
  it("accepts the illegal-value class of the config parameter without throwing at construction time", async () => {  // accepts the illegal-value class of the config parameter without throwing at construction time
    // 步骤 1：非法值 —— identity.memory 配了但结构为空对象、doc_search 同理
    // 步骤 2：构造
    const fx = await piConstructor({
      config: piConfig({
        identity: {
          role: "developer",
          name: "alice:developer",
          memory: {} as never,
          doc_search: {} as never,
        },
      }),
      mem0ApiKey: "mem0-key",
      graphragApiKey: "graphrag-key",
    });
    try {
      // 步骤 3：断言当前实况 —— 构造器只做「配了 key 吗」判断，不校验 memory/doc_search 的内部结构
      // （G-UT-PI-1：PI 各 HTTP 客户端几乎零入参校验）
      expect(fx.error).toBeUndefined();
      expect(fx.runtime).toBeDefined();
    } finally {
      await fx.close();
    }
  });
});
