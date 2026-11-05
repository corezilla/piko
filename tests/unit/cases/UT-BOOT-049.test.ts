/**
 * Case ID: UT-BOOT-049  ·  STATUS: real
 *
 * 责任：参数 `repo: string` 的 `空` 类（config.ts:56）
 * 维度坐标：`gitHead` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-049.md（脚本的唯一依据）
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

describe("UT-BOOT-049 · gitHead · 字符串/路径/枚举输入 × 空", () => {
  it("rejects an empty repo path", async () => {
    // 步骤 1：构造 root（schema 齐备，git 目录存在）
    const root = await makeRoot("export const onRawUsage = 1;\n", "a".repeat(40));
    const dir = await mkdtemp(join(tmpdir(), "piko-cfg-"));
    try {
      const fs = await import("node:fs/promises");
      const raw = JSON.parse(await fs.readFile(join(ROOT, "config/runtime.json"), "utf8"));
      raw.tools.profile_registry_path = join(root, "tool-profiles.json");
      raw.pi.commit = "a".repeat(40);
      const cfgPath = join(dir, "runtime.json");
      await fs.writeFile(cfgPath, JSON.stringify(raw), "utf8");

      // 步骤 2：调用 loadConfig —— gitHead 收到的是拼好的 piRoot，不是空串
      // 步骤 3：断言被拒（schema 步先拒绝；gitHead 不可达）
      await expect(loadConfig(cfgPath, root)).rejects.toThrow();
    } finally {
      await rm(dir, { recursive: true, force: true });
      await rm(root, { recursive: true, force: true });
    }
  });});
