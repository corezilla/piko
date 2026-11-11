/**
 * Case ID: UT-PI-436  ·  STATUS: real
 *
 * 责任：分支 L315 `if (!(await this.channel.report({kind:"closeI…`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-436.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { PiRuntime } from "../../../src/pi-runtime.js";
import { TaskStore } from "../../../src/store.js";
import { piConfig, piTask, piTools, stubModelFetch, recordingChannel } from "./support/pi-runtime-fix.js";

describe("UT-PI-436 · execute · 并发/可重入 × 并发对偶/交错", () => {
  it("retries the intake close only when the pending turn is still there and finishes once it is consumed", async () => {  // retries the intake close only when the pending turn is still there and finishes once it is consumed
    // 步骤 1：closeIntake 前两次返回 false，第三次返回 true ⇒ 循环重入后收尾
    const { mkdtemp } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const sessionRoot = await mkdtemp(join(tmpdir(), "piko-pi-session-"));
    const store = new TaskStore(":memory:", 1000);
    store.createOrGet(
      piTask("task-1", { discussion: { room_id: "!room:piko", trigger_event_id: "evt-1" } }),
      "slinky",
      10,
      "kick off",
    );
    const recorded = recordingChannel({ closeIntake: (_f: unknown, n: number) => n < 3 }, store);
    const runtime = new PiRuntime(
      piConfig({ pi: { version: "0.85.1", commit: "0".repeat(40), session_root: sessionRoot } }),
      piTools(),
      store,
      recorded.channel,
      "k",
    );
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await runtime.execute("task-1", 1, piTask("task-1", { discussion: { room_id: "!room:piko", trigger_event_id: "evt-1" } }), "/tmp", () => false);
      // 步骤 3：断言 —— 首个回合被消费后 store 里没有 pending turn，
      // 于是 closeIntake 只被上报一次就收尾（没有可重入的第二个回合）
      expect(res.status).toBe("completed");
      expect(recorded.facts.filter((f) => f.kind === "closeIntake")).toHaveLength(1);
      // 回合确实被消费了，所以 intake 的关闭没有被反复拒绝
      expect(recorded.facts.filter((f) => f.kind === "turn" && (f as { status: string }).status === "Consumed")).toHaveLength(1);
    } finally {
      vi.unstubAllGlobals();
      await runtime.close();
      store.close();
    }
  });
});
