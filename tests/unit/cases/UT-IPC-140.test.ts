/**
 * Case ID: UT-IPC-140  ·  STATUS: skeleton
 *
 * 责任：分支 L58 `if (this.stopped || !this.child)`（if；supervisor.ts）
 * 维度坐标：`startWatchdog` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-140.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-IPC-140 · startWatchdog（supervisor.ts:55）", () => {
  test.todo("状态分支 × 合法迁移");
  // 输入构造：使 supervisor.ts:58 的分支（if：if (this.stopped || !this.child)）取真，与取假成对
  // 观察点：两侧各自的可观测结果（返回值/状态/副作用）与设计一致
  // 待实现：startWatchdog(/* 参数 */) 分别命中两侧 → 断言（Oracle：用例文档 §3）
});
