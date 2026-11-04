/**
 * Case ID: UT-TRANSFER-004  ·  STATUS: skeleton
 *
 * 责任：`fetchInputs` × `状态分支` × `合法迁移`（粗粒度登记）
 * 维度坐标：`fetchInputs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-004.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-TRANSFER-004 · fetchInputs（transfer.ts:166）", () => {
  test.todo("状态分支 × 合法迁移");
  // 输入构造：按 `状态分支` × `合法迁移` 展开规则构造（transfer.ts:166）
  // 观察点：返回值、typed 错误码、持久化副作用与资源释放
  // 待实现：fetchInputs(/* 参数 */) → 断言（Oracle：用例文档 §3）
});
