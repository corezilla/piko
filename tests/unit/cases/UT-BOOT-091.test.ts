/**
 * Case ID: UT-BOOT-091  ·  STATUS: skeleton
 *
 * 责任：throw L97 `Pi checkout commit mismatch`（守卫 `if ((await gitHead(piRoot)) !== config.…`；config.ts）
 * 维度坐标：`loadConfig` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-091.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-BOOT-091 · loadConfig（config.ts:86）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 config.ts:97 的 throw（code `Pi checkout commit mismatch`，守卫 if ((await gitHead(piRoot)) !== config.pi.commit)）
  // 观察点：typed 错误 code 逐值等于 `Pi checkout commit mismatch`，消息可判别，无部分写入
  // 待实现：loadConfig(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
