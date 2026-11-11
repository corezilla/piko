/**
 * Case ID: UT-PI-431  ·  STATUS: real
 *
 * 责任：分支 L302 `if (unsafeRetry)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-431.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { PiRuntime } from "../../../src/pi-runtime.js";
import { TaskStore } from "../../../src/store.js";
import { piConfig, piTask, piTools, stubModelFetch, sseResponse, toolCallSse, textResponseSse, recordingChannel } from "./support/pi-runtime-fix.js";

describe("UT-PI-431 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the unsafe retry check and returns the typed UnsafeRetryBlocked", async () => {  // takes the true side of the unsafe retry check and returns the typed UnsafeRetryBlocked
    // 步骤 1：准入被拒 ⇒ unsafeRetry 被置上
    const { mkdtemp } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const sessionRoot = await mkdtemp(join(tmpdir(), "piko-pi-session-"));
    const store = new TaskStore(":memory:", 1000);
    const recorded = recordingChannel({ reserveTool: "UnsafeRetryBlocked" });
    const runtime = new PiRuntime(
      piConfig({ pi: { version: "0.85.1", commit: "0".repeat(40), session_root: sessionRoot } }),
      piTools({ "workspace-standard": { bash: { effect: "read_only", replay: "safe" } } as never }),
      store,
      recorded.channel,
      "k",
    );
    let n = 0;
    stubModelFetch(() => {
      n += 1;
      return n === 1
        ? sseResponse(toolCallSse("bash", { command: "ls" }))
        : sseResponse(textResponseSse("fallback"));
    });
    try {
      // 步骤 2：调用 execute(…)
      const res = await runtime.execute("task-1", 1, piTask("task-1"), "/tmp", () => false);
      // 步骤 3：断言 —— 取真侧：返回 UnsafeRetryBlocked 而不是 ToolFailure
      expect(res.status).toBe("failed");
      expect(res.failure?.code).toBe("UnsafeRetryBlocked");
      expect(res.failure?.cause_class).toBe("ExecutionUnknown");
    } finally {
      vi.unstubAllGlobals();
      await runtime.close();
      store.close();
    }
  });
});
