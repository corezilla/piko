/**
 * Case ID: UT-PI-392  ·  STATUS: real
 *
 * 责任：分支 L268 `? typeof event.args.command==="string" :`（ternary；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-392.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-392 · execute · 状态分支 × 合法迁移", () => {
  it("takes the false side of the command argument type check for a tool call without a command", async () => {  // takes the false side of the command argument type check for a tool call without a command
    // 步骤 1：read 工具没有 command ⇒ typeof 判断为假 ⇒ 不做可执行文件校验
    const fx = await piFixture({
      registry: piTools({
        "workspace-standard": { read: { effect: "read_only", replay: "safe", permissions: { executables: ["ls"] } } } as never,
      }),
    });
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取假侧跑完
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
