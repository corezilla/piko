/**
 * Case ID: UT-PI-349  ·  STATUS: real
 *
 * 责任：分支 L212 `available[name]&&applyToolRecoveryPolicy(avai…`（&&；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-349.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-349 · execute · 状态分支 × 合法迁移", () => {
  it("takes the false side of the tool availability conjunction for a tool the profile does not declare", async () => {  // takes the false side of the tool availability conjunction for a tool the profile does not declare
    // 步骤 1：profile 声明了一个不存在的实现名 ⇒ available[name] 为 undefined ⇒ 过滤掉
    const fx = await piFixture({
      registry: piTools({
        "workspace-standard": {
          nonexistent_tool: { effect: "read_only", replay: "safe" },
        } as never,
      }),
    });
    const stub = stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取假侧：工具被过滤掉，执行照常完成
      expect(res.status).toBe("completed");
      const body = stub.calls[0]?.body as { tools?: { name?: string }[] } | undefined;
      expect((body?.tools ?? []).map((t) => t.name)).not.toContain("nonexistent_tool");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
