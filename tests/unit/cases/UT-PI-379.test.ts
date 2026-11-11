/**
 * Case ID: UT-PI-379  ·  STATUS: real
 *
 * 责任：分支 L259 `rel===""||(!rel.startsWith(`..${sep}`)&&rel!=…`（||；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-379.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools, sseResponse, toolCallSse, textResponseSse } from "./support/pi-runtime-fix.js";

describe("UT-PI-379 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the relative path emptiness check", async () => {  // takes the true and the false side of the relative path emptiness check
    // 步骤 1：模型请求读取 staging_root 之外的路径 ⇒ rel 不为空 ⇒ 合取取假
    const fx = await piFixture({
      registry: piTools({ "workspace-standard": { read: { effect: "read_only", replay: "safe" } } as never }),
    });
    let n = 0;
    stubModelFetch(() => {
      n += 1;
      return n === 1
        ? sseResponse(toolCallSse("read", { path: "../escape.txt" }))
        : sseResponse(textResponseSse("fallback text"));
    });
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取假侧：rel 非空 ⇒ 走 authorizePath ⇒ 路径越界被拒
      expect(res.status).toBe("failed");
      expect(res.failure?.code).toBe("ToolFailure");
      expect(res.failure?.message).toBe("path escapes workspace");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
