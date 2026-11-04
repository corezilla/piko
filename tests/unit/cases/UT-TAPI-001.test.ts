/**
 * Case ID: UT-TAPI-001  ·  STATUS: skeleton
 *
 * 责任：`create` × `错误路径` × `每个 typed 错误码`（粗粒度登记）
 * 维度坐标：`create` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-001.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-TAPI-001 · create（server.ts:49）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：按 `错误路径` × `每个 typed 错误码` 展开规则构造（server.ts:49）
  // 观察点：返回值、typed 错误码、持久化副作用与资源释放
  // 待实现：create(/* 参数 */) → 断言（Oracle：用例文档 §3）
});
