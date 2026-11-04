/**
 * Case ID: UT-TRANSFER-172  ·  STATUS: skeleton
 *
 * 责任：分支 L180 `if (this.config.transfer.method === "mount")`（if；transfer.ts）
 * 维度坐标：`fetchInputs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-172.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-TRANSFER-172 · fetchInputs（transfer.ts:166）", () => {
  test.todo("状态分支 × 合法迁移");
  // 输入构造：使 transfer.ts:180 的分支（if：if (this.config.transfer.method === "mount")）取真，与取假成对
  // 观察点：两侧各自的可观测结果（返回值/状态/副作用）与设计一致
  // 待实现：fetchInputs(/* 参数 */) 分别命中两侧 → 断言（Oracle：用例文档 §3）
});
