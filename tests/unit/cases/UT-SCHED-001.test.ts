/**
 * Case ID: UT-SCHED-001  ·  STATUS: skeleton
 *
 * 责任：`acquire` × `并发/可重入` × `并发对偶/交错`（粗粒度登记）
 * 维度坐标：`acquire` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-001.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-SCHED-001 · acquire（scheduler.ts:15）", () => {
  test.todo("并发/可重入 × 并发对偶/交错");
  // 输入构造：按 `并发/可重入` × `并发对偶/交错` 展开规则构造（scheduler.ts:15）
  // 观察点：返回值、typed 错误码、持久化副作用与资源释放
  // 待实现：acquire(/* 参数 */) → 断言（Oracle：用例文档 §3）
});
