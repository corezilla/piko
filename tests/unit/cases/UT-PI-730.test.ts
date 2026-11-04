/**
 * Case ID: UT-PI-730  ·  STATUS: skeleton
 *
 * 责任：参数 `segment: string` 的 `超长` 类（tool-exec-policy.ts:143）
 * 维度坐标：`parseExecutable` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-730.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-PI-730 · parseExecutable（tool-exec-policy.ts:143）", () => {
  test.todo("字符串/路径/枚举输入 × 超长");
  // 输入构造：按 `超长` 类构造 `segment: string`，其余参数取合法等价类（tool-exec-policy.ts:143）
  // 观察点：该类的预期语义（合法＝正常返回；边界＝按 ISD 语义；非法＝typed 错误且无副作用）
  // 待实现：构造输入 → parseExecutable(/* 参数 */) → 逐值断言（Oracle：UT-PI-730 用例文档 §3）
});
