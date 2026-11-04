/**
 * Case ID: UT-PI-278  ·  STATUS: skeleton
 *
 * 责任：参数 `graphragApiKey: string` 的 `空` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-278.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-PI-278 · PiRuntime.constructor（pi-runtime.ts:114）", () => {
  test.todo("字符串/路径/枚举输入 × 空");
  // 输入构造：按 `空` 类构造 `graphragApiKey: string`，其余参数取合法等价类（pi-runtime.ts:114）
  // 观察点：该类的预期语义（合法＝正常返回；边界＝按 ISD 语义；非法＝typed 错误且无副作用；缺省态＝与显式默认值同构）
  // 待实现：构造输入 → new PiRuntime.constructor(/* 构造参数 */) → 逐值断言（Oracle：UT-PI-278 用例文档 §3）
});
