/**
 * Case ID: UT-PI-460  ·  STATUS: real
 *
 * 责任：返回站点 L272 值 `undefined` 逐值断言（pi-runtime.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-460.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools, sseResponse, toolCallSse, textResponseSse } from "./support/pi-runtime-fix.js";

describe("UT-PI-460 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns undefined from the tool gate when the call is admitted", async () => {  // returns undefined from the tool gate when the call is admitted
    // 步骤 1：正常工具调用 ⇒ before_tool 返回 undefined（放行）
    const fx = await piFixture({
      registry: piTools({ "workspace-standard": { read: { effect: "read_only", replay: "safe" } } as never }),
    });
    // 先在临时工作区里放一个可读文件
    await (await import("node:fs/promises")).writeFile(`${fx.root}/notes.txt`, "hello", "utf8");
    let n = 0;
    stubModelFetch(() => {
      n += 1;
      return n === 1
        ? sseResponse(toolCallSse("read", { path: "notes.txt" }))
        : sseResponse(textResponseSse("done reading"));
    });
    try {
      // 步骤 2：调用 execute(…)
      const task = piTask("task-1", { permissions: { read_paths: ["."], write_paths: [], tool_profile_ref: "workspace-standard" } });
      const res = await fx.runtime.execute("task-1", 1, task, fx.root, () => false);
      // 步骤 3：断言 —— 放行：工具被准入并执行，执行跑完
      expect(res.summary).toBe("done reading");
      expect(res.status).toBe("completed");
      expect(fx.facts.some((f) => f.kind === "reserveTool")).toBe(true);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
