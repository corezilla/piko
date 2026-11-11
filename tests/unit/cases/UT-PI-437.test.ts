/**
 * Case ID: UT-PI-437  ·  STATUS: real
 *
 * 责任：分支 L315 `!(await this.channel.report({kind:"closeIntak…`（!；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-437.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { PiRuntime } from "../../../src/pi-runtime.js";
import { TaskStore } from "../../../src/store.js";
import { piConfig, piTask, piTools, stubModelFetch, recordingChannel } from "./support/pi-runtime-fix.js";

describe("UT-PI-437 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the negation on the close intake outcome", async () => {  // takes the true and the false side of the negation on the close intake outcome
    // 步骤 1a：closeIntake 一次放行 ⇒ 整个取值为真 ⇒ 不重入
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
    const recorded = recordingChannel({ closeIntake: true }, store);
    const runtime = new PiRuntime(
      piConfig({ pi: { version: "0.85.1", commit: "0".repeat(40), session_root: sessionRoot } }),
      piTools(),
      store,
      recorded.channel,
      "k",
    );
    stubModelFetch();
    try {
      const res = await runtime.execute("task-1", 1, piTask("task-1", { discussion: { room_id: "!room:piko", trigger_event_id: "evt-1" } }), "/tmp", () => false);
      expect(res.status).toBe("completed");
      expect(recorded.facts.filter((f) => f.kind === "closeIntake")).toHaveLength(1);
    } finally {
      vi.unstubAllGlobals();
      await runtime.close();
      store.close();
    }
  });
});
