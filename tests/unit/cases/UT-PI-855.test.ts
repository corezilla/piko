/**
 * Case ID: UT-PI-855  ·  STATUS: skeleton
 *
 * 责任：参数 `base: typeof fetch` 的 `非法值` 类（tool-host-policy.ts:74）
 * 维度坐标：`makePolicyFetch` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-855.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-PI-855 · makePolicyFetch（tool-host-policy.ts:74）", () => {
  test.todo("纯函数/无副作用 × 非法值");
  // 输入构造：按 `非法值` 类构造 `base: typeof fetch`，其余参数取合法等价类（tool-host-policy.ts:74）
  // 观察点：该类的预期语义（合法＝正常返回；边界＝按 ISD 语义；非法＝typed 错误且无副作用）
  // 待实现：构造输入 → makePolicyFetch(/* 参数 */) → 逐值断言（Oracle：UT-PI-855 用例文档 §3）
});
