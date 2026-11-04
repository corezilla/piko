/**
 * Case ID: UT-TAPI-125  ·  STATUS: skeleton
 *
 * 责任：throw L71 `InvalidRequest`（守卫 `if (!this.validateTask(task))`；server.ts）
 * 维度坐标：`route` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-125.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-TAPI-125 · route（server.ts:62）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 server.ts:71 的 throw（code `InvalidRequest`，守卫 if (!this.validateTask(task))）
  // 观察点：typed 错误 code 逐值等于 `InvalidRequest`，消息可判别，无部分写入
  // 待实现：route(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
