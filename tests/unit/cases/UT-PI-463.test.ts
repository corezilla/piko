/**
 * Case ID: UT-PI-463  ·  STATUS: real
 *
 * 责任：返回站点 L302 值 `{status:"failed",summary:"Unsafe tool r…` 逐值断言（pi-runtime.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-463.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { PiRuntime } from "../../../src/pi-runtime.js";
import { TaskStore } from "../../../src/store.js";
import { piConfig, piTask, piTools, stubModelFetch, sseResponse, toolCallSse, textResponseSse, recordingChannel } from "./support/pi-runtime-fix.js";

describe("UT-PI-463 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the failed result with the unsafe replay summary", async () => {  // returns the failed result with the unsafe replay summary
    // 步骤 1：准入被拒 ⇒ 走 L302 的 unsafeRetry 返回站点
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
      // 步骤 3：断言 —— 返回值逐值对账
      expect(res).toEqual({
        status: "failed",
        summary: "Unsafe tool replay was blocked.",
        failure: {
          code: "UnsafeRetryBlocked",
          cause_class: "ExecutionUnknown",
          message: "A non-replayable tool call was encountered again.",
        },
        executions: [],
      });
    } finally {
      vi.unstubAllGlobals();
      await runtime.close();
      store.close();
    }
  });
});
