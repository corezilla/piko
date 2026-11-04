/**
 * Case ID: UT-USAGE-026  ·  STATUS: skeleton
 *
 * 责任：throw L10 `usage total mismatch`（守卫 `if (u.input_tokens !== null && u.output…`；semantic.ts）
 * 维度坐标：`validateUsage` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-026.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-USAGE-026 · validateUsage（semantic.ts:3）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 semantic.ts:10 的 throw（code `usage total mismatch`，守卫 if (u.input_tokens !== null && u.output_tokens !== null && …）
  // 观察点：typed 错误 code 逐值等于 `usage total mismatch`，消息可判别，无部分写入
  // 待实现：validateUsage(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
