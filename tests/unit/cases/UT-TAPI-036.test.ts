/**
 * Case ID: UT-TAPI-036  ·  STATUS: skeleton
 *
 * 责任：参数 `error: unknown` 的 `每等价类合法值` 类（server.ts:140）
 * 维度坐标：`mapError` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-036.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-TAPI-036 · mapError（server.ts:140）", () => {
  test.todo("纯函数/无副作用 × 每等价类合法值");
  // 输入构造：按 `每等价类合法值` 类构造 `error: unknown`，其余参数取合法等价类（server.ts:140）
  // 观察点：该类的预期语义（合法＝正常返回；边界＝按 ISD 语义；非法＝typed 错误且无副作用）
  // 待实现：构造输入 → mapError(/* 参数 */) → 逐值断言（Oracle：UT-TAPI-036 用例文档 §3）
});
