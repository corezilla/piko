/**
 * Case ID: UT-TRANSFER-256  ·  STATUS: real
 *
 * 责任：throw L59 InputFetchFailed（守卫 `if (!material)`；transfer.ts:53）
 * 维度坐标：`scpKeyPath` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-256.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-256 · scpKeyPath · 错误路径 × 每个 typed 错误码", () => {
  it("reports the declared empty-material error", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    // 步骤 1：写一个空的密钥文件并让凭据指向它（env: 指向空值会被
    //         resolveSecret 先拒，故用 file: 才能走到「材料为空」这一条）
    const keyFile = `${staging}/empty-key`;
    await writeFile(keyFile, "", "utf8");
    const fileCred = config({ transfer: { staging_root: staging, credential_ref: `file:${keyFile}` } });
    const transfer = new Transfer(fileCred);
    try {
      // 步骤 2：调用 sshCommandArgs
      // 步骤 3：断言错误消息逐值对账
      await expect(transfer.sshCommandArgs("h1", ["echo"])).rejects.toThrow(
        "transfer credential resolved to empty material",
      );
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
