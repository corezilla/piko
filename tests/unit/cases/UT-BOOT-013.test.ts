/**
 * Case ID: UT-BOOT-013  ·  STATUS: real
 *
 * 责任：参数 `ref: string` 的 `注入字符` 类（config.ts:132）
 * 维度坐标：`resolveSecret` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-013.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { resolveSecret } from "../../../src/config.js";

describe("UT-BOOT-013 · resolveSecret · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected reference as a provider name, not a command", async () => {
    // 步骤 1：构造注入形态的 ref（provider 名为 "shell; rm -rf /"）
    const ref = "shell; rm -rf /:KEY";

    // 步骤 2：调用 resolveSecret(ref)
    // 步骤 3：断言只按 provider 分派，不执行任何命令
    await expect(resolveSecret(ref)).rejects.toThrow(/secret provider shell; rm -rf \/ is not available/);
  });
});
