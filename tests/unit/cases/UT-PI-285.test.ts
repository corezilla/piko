/**
 * Case ID: UT-PI-285  ·  STATUS: real
 *
 * 责任：可选参数 `transfer` 缺省/显式两态（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `纯函数/无副作用` × `未知枚举`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-285.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor } from "./support/pi-runtime-fix.js";

describe("UT-PI-285 · PiRuntime.constructor · 纯函数/无副作用 × 未知枚举", () => {
  it("treats an omitted transfer and an explicit one as the two distinct states", async () => {  // treats an omitted transfer and an explicit one as the two distinct states
    // 步骤 1a：缺省 ⇒ transfer 为 undefined
    const omitted = await piConstructor();
    try {
      expect(omitted.error).toBeUndefined();
      expect(omitted.state("transfer")).toBeUndefined();
    } finally {
      await omitted.close();
    }

    // 步骤 1b：显式给了 ⇒ transfer 持有该引用
    const explicit = { id: "t" };
    const given = await piConstructor({ transfer: explicit });
    try {
      expect(given.error).toBeUndefined();
      expect(given.state("transfer")).toBe(explicit);
    } finally {
      await given.close();
    }
  });
});
