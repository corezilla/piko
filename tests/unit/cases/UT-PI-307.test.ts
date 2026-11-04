/**
 * Case ID: UT-PI-307  ·  STATUS: skeleton
 *
 * 责任：throw L137 `graphragApiKey required when identity.doc_search configured`（守卫 `if (config.identity?.doc_search && !gra…`；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-307.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-PI-307 · PiRuntime.constructor（pi-runtime.ts:114）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 pi-runtime.ts:137 的 throw（code `graphragApiKey required when identity.doc_search configured`，守卫 if (config.identity?.doc_search && !graphragApiKey)）
  // 观察点：typed 错误 code 逐值等于 `graphragApiKey required when identity.doc_search configured`，消息可判别，无部分写入
  // 待实现：new PiRuntime.constructor(/* 构造参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
