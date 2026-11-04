/**
 * Case ID: UT-TRANSFER-148  ·  STATUS: skeleton
 *
 * 责任：分支 L152 `this.config.transfer.retry ?? { max_attempts:…`（??；transfer.ts）
 * 维度坐标：`withRetry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-148.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-TRANSFER-148 · withRetry（transfer.ts:151）", () => {
  test.todo("状态分支 × 合法迁移");
  // 输入构造：使 transfer.ts:152 的分支（??：this.config.transfer.retry ?? { max_attempts: 3, base_delay…）取真，与取假成对
  // 观察点：两侧各自的可观测结果（返回值/状态/副作用）与设计一致
  // 待实现：withRetry(/* 参数 */) 分别命中两侧 → 断言（Oracle：用例文档 §3）
});
