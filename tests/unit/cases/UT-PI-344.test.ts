/**
 * Case ID: UT-PI-344  ·  STATUS: real
 *
 * 责任：分支 L201 `this.transfer&&remotePolicy`（&&；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-344.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-344 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the transfer and remote policy conjunction", async () => {  // takes the true and the false side of the transfer and remote policy conjunction
    // 步骤 1a：transfer 真 且 remotePolicy 真 ⇒ remote_bash 进清单
    const both = await piFixture({
      registry: piTools({ "workspace-standard": { remote_bash: { effect: "read_only", replay: "safe", permissions: { remote_hosts: [], executables: [] } } } as never }),
      transfer: { id: "t" },
    });
    const stubA = stubModelFetch();
    try {
      await both.runtime.execute("run-1", 1, piTask("task-1"), both.root, () => false);
      const body = stubA.calls[0]?.body as { tools?: { name?: string }[] } | undefined;
      expect((body?.tools ?? []).map((t) => t.name)).toContain("remote_bash");
    } finally {
      vi.unstubAllGlobals();
      await both.close();
    }

    // 步骤 1b：transfer 假 ⇒ 合取为假，remote_bash 不进清单
    const noTransfer = await piFixture({
      registry: piTools({ "workspace-standard": { remote_bash: { effect: "read_only", replay: "safe", permissions: { remote_hosts: [], executables: [] } } } as never }),
    });
    const stubB = stubModelFetch();
    try {
      await noTransfer.runtime.execute("run-1", 1, piTask("task-1"), noTransfer.root, () => false);
      const body = stubB.calls[0]?.body as { tools?: { name?: string }[] } | undefined;
      expect((body?.tools ?? []).map((t) => t.name)).not.toContain("remote_bash");
    } finally {
      vi.unstubAllGlobals();
      await noTransfer.close();
    }
  });
});
