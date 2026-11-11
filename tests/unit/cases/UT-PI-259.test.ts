/**
 * Case ID: UT-PI-259  ·  STATUS: real
 *
 * 责任：参数 `config: RuntimeConfig` 的 `每等价类合法值` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-259.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-259 · PiRuntime.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts the legal equivalent classes of the config parameter and constructs without throwing", async () => {  // accepts the legal equivalent classes of the config parameter and constructs without throwing
    // 步骤 1：每个等价类一个代表值 —— identity 有/无、workspace.roots 有/无
    const configs = [
      piConfig(),
      piConfig({ identity: { role: "developer", name: "alice:developer" } }),
      piConfig({ workspace: { roots: {}, staging_root: "/tmp" } }),
    ];

    // 步骤 2：逐个构造
    for (const config of configs) {
      const fx = await piConstructor({ config });
      try {
        // 步骤 3：断言被接受 —— 构造成功、无错误
        expect(fx.error).toBeUndefined();
        expect(fx.runtime).toBeDefined();
        // 无残留：构造不产生 channel 事实
        expect(fx.facts).toEqual([]);
      } finally {
        await fx.close();
      }
    }
  });
});
