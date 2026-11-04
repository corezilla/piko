/**
 * Case ID: UT-POLICY-080  ·  STATUS: skeleton
 *
 * 责任：返回站点 L3 值 `{...t,permissions:{...t.permissions,rea…` 逐值断言（task-equality.ts）
 * 维度坐标：`normalizedTask` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-080.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-POLICY-080 · normalizedTask（task-equality.ts:3）", () => {
  test.todo("纯函数/无副作用 × 每等价类合法值");
  // 输入构造：使 task-equality.ts:3 的返回站点（值 {...t,permissions:{...t.permissions,read_path…）被到达
  // 观察点：该返回路径的返回值逐值对账（结构、字段、顺序），无未声明副作用
  // 待实现：normalizedTask(/* 参数 */) → 断言（Oracle：用例文档 §3）
});
