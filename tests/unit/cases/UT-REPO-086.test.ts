/**
 * Case ID: UT-REPO-086  ·  STATUS: skeleton
 *
 * 责任：状态写 L215 → `db`（store.ts）
 * 维度坐标：`createOrGet` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-086.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-REPO-086 · createOrGet（store.ts:183）", () => {
  test.todo("持久化/序列化 × round-trip");
  // 输入构造：使 store.ts:215 对 `db` 的写被执行
  // 观察点：写后读回权威事实源（SQLite 行）逐值对账
  // 待实现：createOrGet(/* 参数 */) → 读回对账（Oracle：用例文档 §3）
});
