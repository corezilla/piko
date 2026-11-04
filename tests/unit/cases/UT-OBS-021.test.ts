/**
 * Case ID: UT-OBS-021  ·  STATUS: skeleton
 *
 * 责任：参数 `ms: number` 的 `恰好通过` 类（clock.ts:44）
 * 维度坐标：`advance` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-021.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-OBS-021 · advance（clock.ts:44）", () => {
  test.todo("数值/长度上限参数 × 恰好通过");
  // 输入构造：按 `恰好通过` 类构造 `ms: number`，其余参数取合法等价类（clock.ts:44）
  // 观察点：该类的预期语义（合法＝正常返回；边界＝按 ISD 语义；非法＝typed 错误且无副作用）
  // 待实现：构造输入 → advance(/* 参数 */) → 逐值断言（Oracle：UT-OBS-021 用例文档 §3）
});
