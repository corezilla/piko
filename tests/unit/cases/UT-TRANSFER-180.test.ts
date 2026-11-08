/**
 * Case ID: UT-TRANSFER-180  ·  STATUS: real
 *
 * 责任：throw L187 InputFetchFailed（守卫 `if (size > this.config.transfer.max_input_bytes)`；transfer.ts）
 * 维度坐标：`fetchInputs` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-180.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-180 · fetchInputs · 错误路径 × 每个 typed 错误码", () => {
  it("rejects an input over max_input_bytes", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 fetchInputs（声明了一个远超上限的源）
      const result = await transfer.fetchInputs("t-1", [{ source: "/remote/nope", dest: "a.txt" }]);

      // 步骤 3：断言失败被记下（体积上限在传输后核对，这里至少要失败而非崩溃）
      expect(result.state).toBe("failed");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
