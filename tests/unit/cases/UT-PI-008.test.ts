/**
 * Case ID: UT-PI-008  ·  STATUS: skeleton
 *
 * 责任：`search` × `持久化/序列化` × `截断/损坏`（粗粒度登记）
 * 维度坐标：`search` × `持久化/序列化` × `截断/损坏`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-008.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-PI-008 · search（graphrag-client.ts:130）", () => {
  test.todo("持久化/序列化 × 截断/损坏");
  // 输入构造：按 `持久化/序列化` × `截断/损坏` 展开规则构造（graphrag-client.ts:130）
  // 观察点：返回值、typed 错误码、持久化副作用与资源释放
  // 待实现：search(/* 参数 */) → 断言（Oracle：用例文档 §3）
});
