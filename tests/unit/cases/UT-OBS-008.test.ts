/**
 * Case ID: UT-OBS-008  ·  STATUS: skeleton
 *
 * 责任：`metric` × `数值/长度上限参数` × `+1 拒绝`（粗粒度登记）
 * 维度坐标：`metric` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-008.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-OBS-008 · metric（observability.ts:90）", () => {
  test.todo("数值/长度上限参数 × +1 拒绝");
  // 输入构造：按 `数值/长度上限参数` × `+1 拒绝` 展开规则构造（observability.ts:90）
  // 观察点：返回值、typed 错误码、持久化副作用与资源释放
  // 待实现：metric(/* 参数 */) → 断言（Oracle：用例文档 §3）
});
