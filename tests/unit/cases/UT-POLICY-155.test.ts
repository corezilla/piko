/**
 * Case ID: UT-POLICY-155  ·  STATUS: skeleton
 *
 * 责任：throw L10 `InvalidWorkspace`（守卫 `if (!configured)`；workspace.ts）
 * 维度坐标：`resolveWorkspace` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-155.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-POLICY-155 · resolveWorkspace（workspace.ts:9）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 workspace.ts:10 的 throw（code `InvalidWorkspace`，守卫 if (!configured)）
  // 观察点：typed 错误 code 逐值等于 `InvalidWorkspace`，消息可判别，无部分写入
  // 待实现：resolveWorkspace(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
