/**
 * Case ID: UT-POLICY-044  ·  STATUS: skeleton
 *
 * 责任：throw L37 `ScopeDenied`（守卫 `if (!this.tools.profiles[task.permissio…`；policy.ts）
 * 维度坐标：`validate` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-044.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-POLICY-044 · validate（policy.ts:31）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 policy.ts:37 的 throw（code `ScopeDenied`，守卫 if (!this.tools.profiles[task.permissions.tool_profile_ref])）
  // 观察点：typed 错误 code 逐值等于 `ScopeDenied`，消息可判别，无部分写入
  // 待实现：validate(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
