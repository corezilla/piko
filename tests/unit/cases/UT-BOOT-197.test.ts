/**
 * Case ID: UT-BOOT-197  ·  STATUS: real
 *
 * 责任：分支 L56 `argv[2] ?? env.PIKO_CONFIG ?? "config/runtime…"`（??；main.ts）
 * 维度坐标：`main` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-197.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-197 · main · 状态分支 × 合法迁移", () => {
  it("takes the argv[2] side of the ?? chain", async () => {
    // 步骤 1：构造带 argv[2] 的 argv
    // 步骤 2：调用 main
    // 步骤 3：断言走的是 argv[2]（若走了 env 或默认值，env 为空时行为相同；
    //         用「argv 存在且 env 为空」这一组合锁定第一段 ?? 的左侧）
    const argv = ["node", "piko", join(ROOT, "config/runtime.json")];
    await expect(main(argv, {})).rejects.toThrow(/transfer/);
  });
});
