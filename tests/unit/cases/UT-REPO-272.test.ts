/**
 * Case ID: UT-REPO-272  ·  STATUS: skeleton
 *
 * 责任：参数 `attempt: number` 的 `−1 通过` 类（store.ts:449）
 * 维度坐标：`terminalModel` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-272.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-REPO-272 · terminalModel（store.ts:449）", () => {
  test.todo("数值/长度上限参数 × −1 通过");
  // 输入构造：按 `−1 通过` 类构造 `attempt: number`，其余参数取合法等价类（store.ts:449）
  // 观察点：该类的预期语义（合法＝正常返回；边界＝按 ISD 语义；非法＝typed 错误且无副作用）
  // 待实现：构造输入 → terminalModel(/* 参数 */) → 逐值断言（Oracle：UT-REPO-272 用例文档 §3）
});
