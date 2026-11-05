/**
 * Case ID: UT-BOOT-199  ·  STATUS: real
 *
 * 责任：分支 L57 `import.meta.dirname ?? "."`（??；main.ts）
 * 维度坐标：`main` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-199.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-199 · main · 状态分支 × 合法迁移", () => {
  it("resolves the root from import.meta.dirname", async () => {
    // 步骤 1：构造一个只会在某个 root 下成立的配置路径
    const env = { PIKO_CONFIG: join(ROOT, "config/runtime.json") };

    // 步骤 2：调用 main
    // 步骤 3：断言以该配置路径失败（root 由 import.meta.dirname 推出，
    //         拼出的 schema 路径能读到，因而失败点是 schema 违规而非文件缺失）
    await expect(main(["node", "piko"], env)).rejects.toThrow(/transfer/);
  });
});
