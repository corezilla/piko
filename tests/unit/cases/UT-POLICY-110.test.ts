/**
 * Case ID: UT-POLICY-110  ·  STATUS: skeleton
 *
 * 责任：分支 L24 `catch (dirname(candidate)`（catch；workspace.ts）
 * 维度坐标：`authorizePath` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-110.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-POLICY-110 · authorizePath（workspace.ts:18）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：使 workspace.ts:24 的分支（catch：catch (dirname(candidate)）取真，与取假成对
  // 观察点：两侧各自的可观测结果（返回值/状态/副作用）与设计一致
  // 待实现：authorizePath(/* 参数 */) 分别命中两侧 → 断言（Oracle：用例文档 §3）
});
