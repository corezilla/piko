/**
 * Case ID: UT-BOOT-004  ·  STATUS: real
 *
 * 责任：`main` × `错误路径` × `每个 typed 错误码`（波次一粗粒度登记）
 * 维度坐标：`main` × `错误路径` × `每个 typed 错误码`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-004.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { join } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-004 · main · 错误路径 × 每个 typed 错误码", () => {
  it("propagates the control-process failure", async () => {
    // 当前实况（G-UT-CONFIG-1）：控制进程在 schema 步失败，错误被上抛给调用方
    const { main } = await import("../../../src/main.js");
    await expect(main(["node", "piko", join(ROOT, "config/runtime.json")], {})).rejects.toThrow(/transfer/);
  });
});
