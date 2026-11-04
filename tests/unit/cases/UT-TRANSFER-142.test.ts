/**
 * Case ID: UT-TRANSFER-142  ·  STATUS: skeleton
 *
 * 责任：await 拒绝传播 #1：被调方 `被调方` 拒绝必须 typed 化上抛（transfer.ts:15）
 * 维度坐标：`run` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-142.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-TRANSFER-142 · run（transfer.ts:15）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：注入第 1 个被调方（run 的 await 目标）拒绝
  // 观察点：拒绝按设计声明的 typed 错误上抛，不吞错、不降级为成功
  // 待实现：注入拒绝 → 调用 → 断言上抛（Oracle：用例文档 §3）
});
