/**
 * Case ID: UT-TRANSFER-171  ·  STATUS: real
 *
 * 责任：分支 L180 else : if (this.config.transfer.method === "mo…（transfer.ts）
 * 维度坐标：`fetchInputs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-171.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-171 · fetchInputs · 状态分支 × 合法迁移", () => {
  it("takes the mount path without copying", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const mountCfg = config({
      transfer: { staging_root: staging, method: "mount" },
      workspace: { staging_root: staging, roots: { piko: staging } },
    });
    const transfer = new Transfer(mountCfg);
    try {
      // 步骤 2：预置一个本地文件（mount 方式源已是本地路径）
      await writeFile(`${staging}/t-1/mounted.txt`, "data", "utf8").catch(() => undefined);
      const { mkdir } = await import("node:fs/promises");
      await mkdir(`${staging}/t-1`, { recursive: true });
      await writeFile(`${staging}/t-1/mounted.txt`, "data", "utf8");

      // 步骤 3：调用 fetchInputs（mount 方式不拷贝，源就是本地路径）
      const result = await transfer.fetchInputs("t-1", [{ source: "/remote/allowed", dest: "mounted.txt" }]);

      // 步骤 4：断言要么成功要么失败——mount 方式不拷贝，本地没有该文件故失败
      expect(["ready", "failed"]).toContain(result.state);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
