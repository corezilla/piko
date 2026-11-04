/**
 * Case ID: UT-TAPI-074  ·  STATUS: skeleton
 *
 * 责任：状态写 L47 → `this.server`（server.ts）
 * 维度坐标：`ApiServer.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-074.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-TAPI-074 · ApiServer.constructor（server.ts:40）", () => {
  test.todo("状态分支 × 合法迁移");
  // 输入构造：使 server.ts:47 对 `this.server` 的写被执行
  // 观察点：写后读回权威事实源（对象状态）逐值对账
  // 待实现：new ApiServer.constructor(/* 构造参数 */) → 读回对账（Oracle：用例文档 §3）
});
