/**
 * Case ID: UT-MATRIX-224  ·  STATUS: skeleton
 *
 * 责任：throw L98 `Matrix media exceeds limit`（守卫 `if (size>(this.config.matrix.max_media_…`；matrix.ts）
 * 维度坐标：`downloadMedia` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-224.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-MATRIX-224 · downloadMedia（matrix.ts:91）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 matrix.ts:98 的 throw（code `Matrix media exceeds limit`，守卫 if (size>(this.config.matrix.max_media_bytes??0))）
  // 观察点：typed 错误 code 逐值等于 `Matrix media exceeds limit`，消息可判别，无部分写入
  // 待实现：downloadMedia(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
