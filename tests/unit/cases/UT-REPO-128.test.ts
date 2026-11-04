/**
 * Case ID: UT-REPO-128  ·  STATUS: skeleton
 *
 * 责任：throw L260 `NotFound`（守卫 `if (!r)`；store.ts）
 * 维度坐标：`getRun` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-128.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-REPO-128 · getRun（store.ts:255）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 store.ts:260 的 throw（code `NotFound`，守卫 if (!r)）
  // 观察点：typed 错误 code 逐值等于 `NotFound`，消息可判别，无部分写入
  // 待实现：getRun(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
