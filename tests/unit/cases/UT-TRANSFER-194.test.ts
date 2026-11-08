/**
 * Case ID: UT-TRANSFER-194  ·  STATUS: real
 *
 * 责任：参数 `target` 的 `非法值` 类（transfer.ts:198）
 * 维度坐标：`deliverArtifacts` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-194.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-194 · deliverArtifacts · 纯函数/无副作用 × 每等价类合法值", () => {
  it("reports the object_store method as not implemented", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 deliverArtifacts（object_store 方式；产物需先存在才会走到方法选择）
      await mkdir(`${staging}/t-1`, { recursive: true });
      await writeFile(`${staging}/t-1/out.txt`, "data", "utf8");
      const result = await transfer.deliverArtifacts("t-1", ["out.txt"], { method: "object_store", target: "/remote/allowed" });

      // 步骤 3：断言失败且错误逐值指出未实现
      expect(result.state).toBe("failed");
      expect(result.failed[0].error).toContain("object_store transport not implemented");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
