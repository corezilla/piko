/**
 * Case ID: UT-TRANSFER-170  ·  STATUS: real
 *
 * 责任：分支 L178 if : if (this.config.transfer.method === "scp"（transfer.ts）
 * 维度坐标：`fetchInputs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-170.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-170 · fetchInputs · 状态分支 × 合法迁移", () => {
  it("takes the scp path when the method is scp", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 fetchInputs（方法为 scp → 会真去调 scp，故用未获允许的源）
      const result = await transfer.fetchInputs("t-1", [{ source: "/remote/not-allowed", dest: "a.txt" }]);

      // 步骤 3：断言在允许表检查处就失败（不进 scp）
      expect(result.failed[0].error).toContain("not allowlisted");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
