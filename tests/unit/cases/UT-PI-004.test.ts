/**
 * Case ID: UT-PI-004  ·  STATUS: skeleton
 *
 * 责任：`isProviderUnavailableMessage` × `错误路径` × `每个 typed 错误码`（粗粒度登记）
 * 维度坐标：`isProviderUnavailableMessage` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-004.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-PI-004 · isProviderUnavailableMessage（pi-runtime.ts:37）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：按 `错误路径` × `每个 typed 错误码` 展开规则构造（pi-runtime.ts:37）
  // 观察点：返回值、typed 错误码、持久化副作用与资源释放
  // 待实现：isProviderUnavailableMessage(/* 参数 */) → 断言（Oracle：用例文档 §3）
});
