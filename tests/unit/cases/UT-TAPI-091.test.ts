/**
 * Case ID: UT-TAPI-091  ·  STATUS: skeleton
 *
 * 责任：可选参数 `obs` 缺省/显式两态（server.ts:49）
 * 维度坐标：`create` × `纯函数/无副作用` × `未知枚举`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-091.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-TAPI-091 · create（server.ts:49）", () => {
  test.todo("纯函数/无副作用 × 未知枚举");
  // 输入构造：按 `未知枚举` 类构造 `obs: Observability`，其余参数取合法等价类（server.ts:49）
  // 观察点：该类的预期语义（合法＝正常返回；边界＝按 ISD 语义；非法＝typed 错误且无副作用）
  // 待实现：构造输入 → create(/* 参数 */) → 逐值断言（Oracle：UT-TAPI-091 用例文档 §3）
});
