/**
 * Case ID: UT-BOOT-106  ·  STATUS: real
 *
 * 责任：`sync` × `错误路径` × `每个 typed 错误码`（粗粒度登记）
 * 维度坐标：`sync` × `错误路径` × `每个 typed 错误码`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-106.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";

describe("UT-BOOT-106 · sync · 错误路径 × 每个 typed 错误码", () => {
  it("rejects when the file cannot be opened", async () => {
    // 步骤 1：构造一个不存在的路径
    // 步骤 2：调用 private sync(missing)
    // 步骤 3：断言拒绝被上抛（无句柄残留）
    const { DurableNodeExecutionEnv } = await import("../../../src/durable-fs.js");
    const env = new DurableNodeExecutionEnv({ cwd: "/tmp" });
    const sync = (env as unknown as { sync(path: string, directory?: boolean): Promise<void> }).sync.bind(env);
    await expect(sync("/nonexistent/piko-missing/file.txt")).rejects.toThrow(/ENOENT|no such file/i);
  });
});
