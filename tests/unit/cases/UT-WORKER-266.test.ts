/**
 * Case ID: UT-WORKER-266  ·  STATUS: skeleton
 *
 * 责任：状态写 L283 → `this.stopped`（worker.ts）
 * 维度坐标：`close` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-266.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-WORKER-266 · close（worker.ts:282）", () => {
  test.todo("状态分支 × 合法迁移");
  // 输入构造：使 worker.ts:283 对 `this.stopped` 的写被执行
  // 观察点：写后读回权威事实源（对象状态）逐值对账
  // 待实现：close(/* 参数 */) → 读回对账（Oracle：用例文档 §3）
});
