/**
 * Case ID: UT-POLICY-125  ·  STATUS: skeleton
 *
 * 责任：参数 `workspace: string` 的 `超长` 类（workspace.ts:32）
 * 维度坐标：`collectOutputs` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-125.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-POLICY-125 · collectOutputs（workspace.ts:32）", () => {
  test.todo("字符串/路径/枚举输入 × 超长");
  // 输入构造：按 `超长` 类构造 `workspace: string`，其余参数取合法等价类（workspace.ts:32）
  // 观察点：该类的预期语义（合法＝正常返回；边界＝按 ISD 语义；非法＝typed 错误且无副作用）
  // 待实现：构造输入 → collectOutputs(/* 参数 */) → 逐值断言（Oracle：UT-POLICY-125 用例文档 §3）
});
