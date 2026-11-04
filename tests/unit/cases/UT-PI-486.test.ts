/**
 * Case ID: UT-PI-486  ·  STATUS: skeleton
 *
 * 责任：可选参数 `turn` 缺省/显式两态（pi-runtime.ts:43）
 * 维度坐标：`initialPrompt` × `纯函数/无副作用` × `未知枚举`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-486.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-PI-486 · initialPrompt（pi-runtime.ts:43）", () => {
  test.todo("纯函数/无副作用 × 未知枚举");
  // 输入构造：按 `未知枚举` 类构造 `turn: DiscussionTurn`，其余参数取合法等价类（pi-runtime.ts:43）
  // 观察点：该类的预期语义（合法＝正常返回；边界＝按 ISD 语义；非法＝typed 错误且无副作用）
  // 待实现：构造输入 → initialPrompt(/* 参数 */) → 逐值断言（Oracle：UT-PI-486 用例文档 §3）
});
