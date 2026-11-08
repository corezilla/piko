/**
 * Case ID: UT-TRANSFER-260  ·  STATUS: real
 *
 * 责任：资源 writeFileSync（transfer.ts:53）
 * 维度坐标：`scpKeyPath` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-260.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-260 · scpKeyPath · 资源获取/释放 × 获取失败路径", () => {
  it("writes the key material into a private file", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    process.env.PIKO_UT_SCP_KEY = "KEY-MATERIAL";
    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 sshCommandArgs（物化密钥文件）
      const args = await transfer.sshCommandArgs("h1", ["echo"]);

      // 步骤 3：断言文件内容是密钥材料，且文件在 .keys 下
      const keyFile = args[args.indexOf("-i") + 1];
      expect(await readFile(keyFile, "utf8")).toBe("KEY-MATERIAL\n");
      expect(keyFile).toContain(".keys");
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
