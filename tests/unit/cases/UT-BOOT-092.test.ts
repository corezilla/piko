/**
 * Case ID: UT-BOOT-092  ·  STATUS: skeleton
 *
 * 责任：throw L100 `Pi revision lacks onRawUsage extension point`（守卫 `if (!harness.includes("onRawUsage"))`；config.ts）
 * 维度坐标：`loadConfig` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-092.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-BOOT-092 · loadConfig（config.ts:86）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 config.ts:100 的 throw（code `Pi revision lacks onRawUsage extension point`，守卫 if (!harness.includes("onRawUsage"))）
  // 观察点：typed 错误 code 逐值等于 `Pi revision lacks onRawUsage extension point`，消息可判别，无部分写入
  // 待实现：loadConfig(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
