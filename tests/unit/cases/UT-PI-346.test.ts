/**
 * Case ID: UT-PI-346  ·  STATUS: real
 *
 * 责任：分支 L205 `remotePolicy.permissions?.remote_hosts`（?.；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-346.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-346 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the optional chaining on the remote policy permissions", async () => {  // takes the true side of the optional chaining on the remote policy permissions
    // 步骤 1：remote policy 带 permissions ⇒ 可选链取真
    const fx = await piFixture({
      registry: piTools({
        "workspace-standard": {
          remote_bash: { effect: "read_only", replay: "safe", permissions: { remote_hosts: ["host-a"], executables: ["ls"] } },
        } as never,
      }),
      transfer: { id: "t" },
    });
    const stub = stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧跑完
      expect(res.status).toBe("completed");
      const body = stub.calls[0]?.body as { tools?: { name?: string }[] } | undefined;
      expect((body?.tools ?? []).map((t) => t.name)).toContain("remote_bash");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
