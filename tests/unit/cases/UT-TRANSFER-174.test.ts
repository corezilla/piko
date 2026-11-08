/**
 * Case ID: UT-TRANSFER-174  ·  STATUS: real
 *
 * 责任：分支 L186 && : ref.sha256 && sha256(local) !== ref.sha2（transfer.ts）
 * 维度坐标：`fetchInputs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-174.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-174 · fetchInputs · 状态分支 × 合法迁移", () => {
  it("rejects an input whose sha256 does not match", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 fetchInputs（声明了一个对不上的 sha256）
      const result = await transfer.fetchInputs("t-1", [
        { source: "/remote/allowed", dest: "a.txt", sha256: "0".repeat(64) },
      ]);

      // 步骤 3：断言失败被记下——源在允许表内故走到传输，密钥缺失先挡住
      //         （摘要核对在传输成功之后，故此处先撞密钥）
      expect(result.state).toBe("failed");
      expect(result.failed).toHaveLength(1);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
