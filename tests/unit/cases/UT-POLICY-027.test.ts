/**
 * Case ID: UT-POLICY-027  ·  STATUS: skeleton
 *
 * 责任：throw L26 `ScopeDenied`（守卫 `if (!root)`；policy.ts）
 * 维度坐标：`resolveWorkspace` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-027.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-POLICY-027 · resolveWorkspace（policy.ts:24）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 policy.ts:26 的 throw（code `ScopeDenied`，守卫 if (!root)）
  // 观察点：typed 错误 code 逐值等于 `ScopeDenied`，消息可判别，无部分写入
  // 待实现：resolveWorkspace(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
