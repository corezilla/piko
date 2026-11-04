/**
 * Case ID: UT-TRANSFER-152  ·  STATUS: skeleton
 *
 * 责任：throw L162 `reject`（守卫 `unconditional`；transfer.ts）
 * 维度坐标：`withRetry` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-152.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-TRANSFER-152 · withRetry（transfer.ts:151）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 transfer.ts:162 的 throw（code `reject`，守卫 unconditional）
  // 观察点：typed 错误 code 逐值等于 `reject`，消息可判别，无部分写入
  // 待实现：withRetry(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
