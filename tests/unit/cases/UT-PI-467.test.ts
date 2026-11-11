/**
 * Case ID: UT-PI-467  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #1：被调方 `this.repo.close(BACKGROUND_CONTEXT` 拒绝必须 typed 化上抛（pi-runtime.ts:326）
 * 维度坐标：`close` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-467.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { PiRuntime } from "../../../src/pi-runtime.js";
import { TaskStore } from "../../../src/store.js";
import { piConfig, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-467 · close · 错误路径 × 每个 typed 错误码", () => {
  it("propagates a rejected session repository close without swallowing it", async () => {  // propagates a rejected session repository close without swallowing it
    // 步骤 1：构造一个 repo.close 恒拒绝的 runtime
    const { mkdtemp } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const sessionRoot = await mkdtemp(join(tmpdir(), "piko-pi-session-"));
    const store = new TaskStore(":memory:", 1000);
    const runtime = new PiRuntime(
      piConfig({ pi: { version: "0.85.1", commit: "0".repeat(40), session_root: sessionRoot } }),
      piTools(),
      store,
      { async report(): Promise<{ ok: boolean }> { return { ok: true }; } },
      "k",
    );
    // 让 repo.close 拒绝
    const repo = (runtime as unknown as { repo: { close: (ctx: unknown) => Promise<void> } }).repo;
    repo.close = () => Promise.reject(new Error("session store closed unexpectedly"));
    try {
      // 步骤 2：调用 close()
      let error: unknown;
      try {
        await runtime.close();
      } catch (e) {
        error = e;
      }
      // 步骤 3：断言 —— 拒绝被保真上抛（不吞错、不降级）
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe("session store closed unexpectedly");
    } finally {
      store.close();
    }
  });
});
