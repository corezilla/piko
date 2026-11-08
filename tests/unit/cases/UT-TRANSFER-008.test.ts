/**
 * Case ID: UT-TRANSFER-008  ·  STATUS: real
 *
 * 责任：被测符号 `sync`（TRANSFER）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`sync` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-008.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { DurableNodeExecutionEnv } from "../../../src/durable-fs.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-008 · sync · 状态分支 × 合法迁移", () => {
  it("syncs the file itself and its parent directory", async () => {
    // 步骤 1：造一个临时目录与其中的文件
    const { mkdtemp, rm, writeFile } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = await mkdtemp(join(tmpdir(), "piko-sync-"));
    try {
      await writeFile(join(dir, "d.txt"), "data", "utf8");
      const env = new DurableNodeExecutionEnv({ cwd: dir });
      const sync = (env as unknown as { sync(path: string, directory?: boolean): Promise<void> }).sync.bind(env);

      // 步骤 2：调用 private sync(file, false) 与 sync(file, true)
      // 步骤 3：断言两条合法迁移都成功——文件本身与其父目录都能 fsync
      await expect(sync(join(dir, "d.txt"), false)).resolves.toBeUndefined();
      await expect(sync(join(dir, "d.txt"), true)).resolves.toBeUndefined();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

});
