/**
 * Case ID: UT-TRANSFER-120  ·  STATUS: skeleton
 *
 * 责任：throw L116 `InputFetchFailed`（守卫 `if (!key)`；transfer.ts）
 * 维度坐标：`sshBaseArgs` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-120.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-TRANSFER-120 · sshBaseArgs（transfer.ts:112）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 transfer.ts:116 的 throw（code `InputFetchFailed`，守卫 if (!key)）
  // 观察点：typed 错误 code 逐值等于 `InputFetchFailed`，消息可判别，无部分写入
  // 待实现：sshBaseArgs(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
