/**
 * Case ID: UT-TRANSFER-179  ·  STATUS: skeleton
 *
 * 责任：throw L186 `InputFetchFailed`（守卫 `if (ref.sha256 && sha256(local) !== ref…`；transfer.ts）
 * 维度坐标：`fetchInputs` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-179.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-TRANSFER-179 · fetchInputs（transfer.ts:166）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 transfer.ts:186 的 throw（code `InputFetchFailed`，守卫 if (ref.sha256 && sha256(local) !== ref.sha256)）
  // 观察点：typed 错误 code 逐值等于 `InputFetchFailed`，消息可判别，无部分写入
  // 待实现：fetchInputs(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
