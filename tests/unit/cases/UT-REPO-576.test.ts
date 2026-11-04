/**
 * Case ID: UT-REPO-576  ·  STATUS: skeleton
 *
 * 责任：分支 L722 `loop (this.db .prepare("SELECT operation_id,t…`（loop；store.ts）
 * 维度坐标：`knownActions` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-576.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-REPO-576 · knownActions（store.ts:711）", () => {
  test.todo("状态分支 × 合法迁移");
  // 输入构造：使 store.ts:722 的分支（loop：loop (this.db .prepare("SELECT operation_id,tool_call_i…)）取真，与取假成对
  // 观察点：两侧各自的可观测结果（返回值/状态/副作用）与设计一致
  // 待实现：knownActions(/* 参数 */) 分别命中两侧 → 断言（Oracle：用例文档 §3）
});
