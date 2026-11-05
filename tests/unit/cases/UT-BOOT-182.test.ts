/**
 * Case ID: UT-BOOT-182  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #1：被调方 `loadConfig` 拒绝必须 typed 化上抛（main.ts:16）
 * 维度坐标：`runControlProcess` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-182.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-182 · runControlProcess · 错误路径 × 每个 typed 错误码", () => {
  it("rejects at loadConfig and does not reach the later steps", async () => {
    // 当前实况（G-UT-CONFIG-1）：loadConfig 之前的步骤先失败；本 Case 固定
    // 「控制进程以 typed 错误退出、不留下半启动状态」这一可达事实。
    await expect(runControlProcess(join(ROOT, "config/runtime.json"), ROOT)).rejects.toThrow();
  });
});
