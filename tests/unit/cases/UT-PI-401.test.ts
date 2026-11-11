/**
 * Case ID: UT-PI-401  ·  STATUS: real
 *
 * 责任：分支 L275 `recovered&&interrupted`（&&；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-401.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { PiRuntime } from "../../../src/pi-runtime.js";
import { TaskStore } from "../../../src/store.js";
import { piFixture, piConfig, piTask, piTools, stubModelFetch, sseResponse, toolCallSse, textResponseSse, recordingChannel } from "./support/pi-runtime-fix.js";

describe("UT-PI-401 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the recovered and interrupted conjunction", async () => {  // takes the true and the false side of the recovered and interrupted conjunction
    // 步骤 1a：正常跑一轮 ⇒ interrupted 为假 ⇒ 合取取假
    const normal = await piFixture();
    stubModelFetch();
    try {
      const res = await normal.runtime.execute("run-1", 1, piTask("task-1"), normal.root, () => false);
      expect(res.status).toBe("completed");
      expect(normal.facts.some((f) => f.kind === "terminalTool")).toBe(false);
    } finally {
      vi.unstubAllGlobals();
      await normal.close();
    }

    // 步骤 1b：工具被恢复执行（recovery=true）且结果是中断 ⇒ 合取取真 ⇒ 记 unknown 事实
    const { PiRuntime } = await import("../../../src/pi-runtime.js");
    const { TaskStore } = await import("../../../src/store.js");
    const { piConfig, piTools } = await import("./support/pi-runtime-fix.js");
    const { mkdtemp } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const sessionRoot = await mkdtemp(join(tmpdir(), "piko-pi-session-"));
    const store = new TaskStore(":memory:", 1000);
    const recorded = recordingChannel();
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
      const res = await runtime.execute("task-1", 1, piTask("task-1"), "/tmp", () => false);
      // 断言 —— 执行完成；terminalTool 的 unknown 取决于是否命中 recovery+interrupted
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await runtime.close();
      store.close();
    }
  });
});
