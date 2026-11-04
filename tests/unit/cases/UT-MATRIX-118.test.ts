/**
 * Case ID: UT-MATRIX-118  ·  STATUS: skeleton
 *
 * 责任：throw L18 `Matrix credential identity mismatch`（守卫 `if (who.user_id!==this.config.matrix.us…`；matrix.ts）
 * 维度坐标：`start` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-118.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-MATRIX-118 · start（matrix.ts:15）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 matrix.ts:18 的 throw（code `Matrix credential identity mismatch`，守卫 if (who.user_id!==this.config.matrix.user_id)）
  // 观察点：typed 错误 code 逐值等于 `Matrix credential identity mismatch`，消息可判别，无部分写入
  // 待实现：start(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
