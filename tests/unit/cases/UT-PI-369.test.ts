/**
 * Case ID: UT-PI-369  ·  STATUS: real
 *
 * 责任：分支 L249 `catch ()`（catch；pi-runtime.ts）
 * 维度坐标：`execute` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-369.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-369 · execute · 错误路径 × 每个 typed 错误码", () => {
  it("swallows an observability failure without breaking the execution", async () => {  // swallows an observability failure without breaking the execution
    // 步骤 1：channel 的 report 对 providerCall 抛错 ⇒ after_response 里的 catch 兜住
    const { PiRuntime } = await import("../../../src/pi-runtime.js");
    const { TaskStore } = await import("../../../src/store.js");
    const { piConfig, piTools } = await import("./support/pi-runtime-fix.js");
    const store = new TaskStore(":memory:", 1000);
    const hostile = {
      async report(fact: { kind: string }): Promise<{ ok: boolean }> {
        if (fact.kind === "providerCall") throw new Error("channel down");
        return { ok: true };
      },
    };
    const rt = new PiRuntime(piConfig(), piTools(), store, hostile as never, "k");
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await rt.execute("run-1", 1, piTask("task-1"), "/tmp", () => false);
      // 步骤 3：断言 —— 可观测性失败被吞掉，执行照常完成
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await rt.close();
      store.close();
    }
  });
});
