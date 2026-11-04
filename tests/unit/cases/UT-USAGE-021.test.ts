/**
 * Case ID: UT-USAGE-021  ·  STATUS: skeleton
 *
 * 责任：throw L4 `usage observed attempts exceed model attempts`（守卫 `if (u.usage_observed_attempts > u.model…`；semantic.ts）
 * 维度坐标：`validateUsage` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-021.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-USAGE-021 · validateUsage（semantic.ts:3）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 semantic.ts:4 的 throw（code `usage observed attempts exceed model attempts`，守卫 if (u.usage_observed_attempts > u.model_attempts)）
  // 观察点：typed 错误 code 逐值等于 `usage observed attempts exceed model attempts`，消息可判别，无部分写入
  // 待实现：validateUsage(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
