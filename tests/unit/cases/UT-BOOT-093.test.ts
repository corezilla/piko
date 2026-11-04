/**
 * Case ID: UT-BOOT-093  ·  STATUS: skeleton
 *
 * 责任：throw L126 `Matrix is enabled but neither direct_access_token nor access_token_secret_ref is configured`（守卫 `if (config.matrix.enabled && !config.ma…`；config.ts）
 * 维度坐标：`loadConfig` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-093.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-BOOT-093 · loadConfig（config.ts:86）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 config.ts:126 的 throw（code `Matrix is enabled but neither direct_access_token nor access_token_secret_ref is configured`，守卫 if (config.matrix.enabled && !config.matrix.direct_access_t…）
  // 观察点：typed 错误 code 逐值等于 `Matrix is enabled but neither direct_access_token nor access_token_secret_ref is configured`，消息可判别，无部分写入
  // 待实现：loadConfig(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
