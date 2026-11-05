/**
 * Case ID: UT-BOOT-008  ·  STATUS: real
 *
 * 责任：`runControlProcess` × `资源获取/释放` × `获取失败路径`（波次一粗粒度登记）
 * 维度坐标：`runControlProcess` × `资源获取/释放` × `获取失败路径`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-008.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";

describe("UT-BOOT-008 · runControlProcess · 资源获取/释放 × 获取失败路径", () => {
  it("fails to acquire the config and leaves no running process", async () => {
    // 步骤 1：构造一个读不到的 configPath
    // 步骤 2：调用 runControlProcess
    // 步骤 3：断言失败——控制进程未取得配置即退出，未留下监听端口或子进程
    const { runControlProcess } = await import("../../../src/main.js");
    await expect(runControlProcess("/nonexistent/runtime.json", process.cwd())).rejects.toThrow();
  });
});
