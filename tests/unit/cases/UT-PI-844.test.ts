/**
 * Case ID: UT-PI-844  ·  STATUS: skeleton
 *
 * 责任：参数 `host: string` 的 `空` 类（tool-host-policy.ts:29）
 * 维度坐标：`PolicyViolationError.constructor` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-844.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-PI-844 · PolicyViolationError.constructor（tool-host-policy.ts:29）", () => {
  test.todo("字符串/路径/枚举输入 × 空");
  // 输入构造：按 `空` 类构造 `host: string`，其余参数取合法等价类（tool-host-policy.ts:29）
  // 观察点：该类的预期语义（合法＝正常返回；边界＝按 ISD 语义；非法＝typed 错误且无副作用；缺省态＝与显式默认值同构）
  // 待实现：构造输入 → new PolicyViolationError.constructor(/* 构造参数 */) → 逐值断言（Oracle：UT-PI-844 用例文档 §3）
});
