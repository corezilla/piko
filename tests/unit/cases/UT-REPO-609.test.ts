/**
 * Case ID: UT-REPO-609  ·  STATUS: skeleton
 *
 * 责任：throw L758 `LeaseLost`（守卫 `if (slot.task_id !== result.task_id || …`；store.ts）
 * 维度坐标：`finish` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-609.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-REPO-609 · finish（store.ts:755）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 store.ts:758 的 throw（code `LeaseLost`，守卫 if (slot.task_id !== result.task_id || slot.lease_epoch !==…）
  // 观察点：typed 错误 code 逐值等于 `LeaseLost`，消息可判别，无部分写入
  // 待实现：finish(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
