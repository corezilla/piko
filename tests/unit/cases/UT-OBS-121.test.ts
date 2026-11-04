/**
 * Case ID: UT-OBS-121  ·  STATUS: skeleton
 *
 * 责任：分支 L96 `? op === "set" :`（ternary；observability.ts）
 * 维度坐标：`metric` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-121.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-OBS-121 · metric（observability.ts:90）", () => {
  test.todo("状态分支 × 合法迁移");
  // 输入构造：使 observability.ts:96 的分支（ternary：? op === "set" :）取真，与取假成对
  // 观察点：两侧各自的可观测结果（返回值/状态/副作用）与设计一致
  // 待实现：metric(/* 参数 */) 分别命中两侧 → 断言（Oracle：用例文档 §3）
});
