/**
 * Case ID: UT-PI-306  ·  STATUS: skeleton
 *
 * 责任：throw L123 `mem0ApiKey required when identity.memory configured`（守卫 `if (config.identity?.memory && !mem0Api…`；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-306.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-PI-306 · PiRuntime.constructor（pi-runtime.ts:114）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 pi-runtime.ts:123 的 throw（code `mem0ApiKey required when identity.memory configured`，守卫 if (config.identity?.memory && !mem0ApiKey)）
  // 观察点：typed 错误 code 逐值等于 `mem0ApiKey required when identity.memory configured`，消息可判别，无部分写入
  // 待实现：new PiRuntime.constructor(/* 构造参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
