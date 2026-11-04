/**
 * Case ID: UT-BOOT-127  ·  STATUS: skeleton
 *
 * 责任：分支 L72 `{ this.executionFacts.record({ tool_cal…`（else；durable-fs.ts）
 * 维度坐标：`exec` × `状态分支` × `每个非法迁移拒绝`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-127.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-BOOT-127 · exec（durable-fs.ts:25）", () => {
  test.todo("状态分支 × 每个非法迁移拒绝");
  // 输入构造：使 durable-fs.ts:72 的分支（else：{ this.executionFacts.record({ tool_cal…）取真，与取假成对
  // 观察点：两侧各自的可观测结果（返回值/状态/副作用）与设计一致
  // 待实现：exec(/* 参数 */) 分别命中两侧 → 断言（Oracle：用例文档 §3）
});
