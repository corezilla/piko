/**
 * Case ID: UT-BOOT-003  ·  STATUS: real
 *
 * 责任：`loadConfig` × `错误路径` × `每个 typed 错误码`（波次一粗粒度登记）
 * 维度坐标：`loadConfig` × `错误路径` × `每个 typed 错误码`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-003.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../../src/config.js";
import { join } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-003 · loadConfig · 错误路径 × 每个 typed 错误码", () => {
  it("rejects the shipped runtime config at the schema step", async () => {
    // 当前实况（G-UT-CONFIG-1）：config/ 下全部运行时配置都不满足 v0.3 schema
    // （缺 transfer 必填段、pi 多两个字段），loadConfig 的 schema 校验必然拒绝。
    // 本 Case 断言这个真实行为；成功路径待该裁决关闭后才可覆盖。
    await expect(loadConfig(join(ROOT, "config/runtime.json"), ROOT)).rejects.toThrow(/transfer/);
  });
});
