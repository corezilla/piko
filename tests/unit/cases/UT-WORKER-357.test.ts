/**
 * Case ID: UT-WORKER-357  ·  STATUS: skeleton
 *
 * 责任：状态写 L68 → `db`（worker.ts）
 * 维度坐标：`loop` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-357.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-WORKER-357 · loop（worker.ts:58）", () => {
  test.todo("持久化/序列化 × round-trip");
  // 输入构造：使 worker.ts:68 对 `db` 的写被执行
  // 观察点：写后读回权威事实源（SQLite 行）逐值对账
  // 待实现：loop(/* 参数 */) → 读回对账（Oracle：用例文档 §3）
});
