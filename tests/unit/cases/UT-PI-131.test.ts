/**
 * Case ID: UT-PI-131  ·  STATUS: skeleton
 *
 * 责任：throw L90 `projectName required`（守卫 `if (!context.projectName || context.pro…`；graphrag-tools.ts）
 * 维度坐标：`validateDocSearchContext` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-131.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-PI-131 · validateDocSearchContext（graphrag-tools.ts:85）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 graphrag-tools.ts:90 的 throw（code `projectName required`，守卫 if (!context.projectName || context.projectName.trim() === …）
  // 观察点：typed 错误 code 逐值等于 `projectName required`，消息可判别，无部分写入
  // 待实现：validateDocSearchContext(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
