/**
 * Case ID: UT-BOOT-068  ·  STATUS: real
 *
 * 责任：分支 L76 !: !ajv.validate(schema, value)（config.ts）
 * 维度坐标：`validated` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-068.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../../src/config.js";
import { mkdtemp, rm, mkdir, writeFile, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();

/**
 * 构造一个 root：内含两份 schema 与一份工具注册表，并带一个 detached HEAD 的
 * git 目录与一个 harness 文件——使 loadConfig 的每一步（schema → gitHead →
 * harness）都有机会被执行到。
 */
async function makeRoot(harnessText: string, sha: string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "piko-root-"));
  await mkdir(join(root, "interfaces/schemas"), { recursive: true });
  for (const f of ["piko-runtime-config-v0.3.schema.json", "piko-tool-profile-v0.3.schema.json"]) {
    await copyFile(join(ROOT, "interfaces/schemas", f), join(root, "interfaces/schemas", f));
  }
  await copyFile(join(ROOT, "config/tool-profiles.json"), join(root, "tool-profiles.json"));
  const piRoot = join(root, "upstream/pi");
  await mkdir(join(piRoot, ".git"), { recursive: true });
  await writeFile(join(piRoot, ".git/HEAD"), `${sha}\n`, "utf8");
  await mkdir(join(piRoot, "packages/agent/src/harness"), { recursive: true });
  await writeFile(join(piRoot, "packages/agent/src/harness/agent-harness.ts"), harnessText, "utf8");
  return root;
}

describe("UT-BOOT-068 · validated · 状态分支 × 合法迁移", () => {
  it("takes the rejection side: the shipped config does not validate", async () => {
    // 步骤 1：调用 loadConfig（真实配置）
    // 步骤 2：读回错误
    // 步骤 3：断言校验失败并逐值指出违规（!ajv.validate 为真）
    await expect(loadConfig(join(ROOT, "config/runtime.json"), ROOT)).rejects.toThrow(/transfer/);
  });});
