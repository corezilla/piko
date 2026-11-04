/**
 * Case ID: UT-TRANSFER-106  ·  STATUS: skeleton
 *
 * 责任：throw L109 `ScopeDenied`（守卫 `if (allowedHosts.length > 0 && !allowed…`；remote-exec.ts）
 * 维度坐标：`execRemote` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-106.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-TRANSFER-106 · execRemote（remote-exec.ts:92）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：触发 remote-exec.ts:109 的 throw（code `ScopeDenied`，守卫 if (allowedHosts.length > 0 && !allowedHosts.includes(host))）
  // 观察点：typed 错误 code 逐值等于 `ScopeDenied`，消息可判别，无部分写入
  // 待实现：execRemote(/* 参数 */) 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）
});
