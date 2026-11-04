/**
 * Case ID: UT-BOOT-172  ·  STATUS: skeleton
 *
 * 责任：await 拒绝传播 #3：被调方 `this.sync(destination,true` 拒绝必须 typed 化上抛（durable-fs.ts:98）
 * 维度坐标：`renameFile` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-172.md（脚本的唯一依据）
 *
 * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、
 * 不判定，禁止改成会通过的空断言冒充 Implemented。
 */
import { describe, test } from "vitest";

describe("UT-BOOT-172 · renameFile（durable-fs.ts:98）", () => {
  test.todo("错误路径 × 每个 typed 错误码");
  // 输入构造：注入第 3 个被调方（renameFile 的 await 目标）拒绝
  // 观察点：拒绝按设计声明的 typed 错误上抛，不吞错、不降级为成功
  // 待实现：注入拒绝 → 调用 → 断言上抛（Oracle：用例文档 §3）
});
