/**
 * Case ID: UT-IPC-017  ·  STATUS: skeleton
 *
 * 责任：参数 `fact: Fact` 的 `边界(上/下/零/空/满)` 类（ipc.ts:118）
 * 维度坐标：`report` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-017.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-IPC-017 · report（ipc.ts:118）", () => {
  test.todo("纯函数/无副作用 × 边界(上/下/零/空/满)");
  // 输入构造：按 `边界(上/下/零/空/满)` 类构造 `fact: Fact`，其余参数取合法等价类（ipc.ts:118）
  // 观察点：该类的预期语义（合法＝正常返回；边界＝按 ISD 语义；非法＝typed 错误且无副作用）
  // 待实现：构造输入 → report(/* 参数 */) → 逐值断言（Oracle：UT-IPC-017 用例文档 §3）
});
