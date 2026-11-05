/**
 * Case ID: UT-BOOT-198  ·  STATUS: real
 *
 * 责任：分支 L56 `argv[2] ?? env.PIKO_CONFIG`（??；main.ts）
 * 维度坐标：`main` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-198.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-198 · main · 状态分支 × 合法迁移", () => {
  it("takes the env.PIKO_CONFIG side when argv[2] is absent", async () => {
    // 步骤 1：构造无 argv[2] 且带 PIKO_CONFIG 的 env（指向 tier 配置）
    const env = { PIKO_CONFIG: join(ROOT, "config/runtime.tier.json") };

    // 步骤 2：调用 main
    // 步骤 3：断言因该配置的 schema 违规而失败——证明第二段 ?? 的左侧被采用
    await expect(main(["node", "piko"], env)).rejects.toThrow(/transfer/);
  });
});
