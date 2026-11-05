/**
 * Case ID: UT-BOOT-173  ·  STATUS: real
 *
 * 责任：`renameFile` × `错误路径` × `每个 typed 错误码`（粗粒度登记）
 * 维度坐标：`renameFile` × `错误路径` × `每个 typed 错误码`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-173.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";

describe("UT-BOOT-173 · renameFile · 错误路径 × 每个 typed 错误码", () => {
  it("returns a typed error instead of throwing when the rename fails", async () => {
    // 步骤 1：构造一个会失败的改名（源不存在）
    const { DurableNodeExecutionEnv } = await import("../../../src/durable-fs.js");
    const { mkdtemp, rm } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = await mkdtemp(join(tmpdir(), "piko-rn-"));
    try {
      const env = new DurableNodeExecutionEnv({ cwd: dir });

      // 步骤 2：调用 renameFile("missing.txt", "dst.txt", context)
      // 步骤 3：断言返回失败（Result.error），不是抛出
      const result = await env.renameFile("missing.txt", "dst.txt", { abortSignal: undefined } as never);
      expect(result.ok).toBe(false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
