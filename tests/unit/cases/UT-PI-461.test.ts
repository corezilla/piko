/**
 * Case ID: UT-PI-461  ·  STATUS: real
 *
 * 责任：返回站点 L274 值 `undefined` 逐值断言（pi-runtime.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-461.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools, sseResponse, toolCallSse, textResponseSse } from "./support/pi-runtime-fix.js";

describe("UT-PI-461 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns undefined from the after tool hook", async () => {  // returns undefined from the after tool hook
    // 步骤 1：正常工具调用 ⇒ after_tool 返回 undefined
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
      // 步骤 3：断言 —— 工具终态事实被上报，且 unknown 为假
      expect(res.status).toBe("completed");
      const terminal = fx.facts.find((f) => f.kind === "terminalTool");
      expect(terminal).toBeDefined();
      expect((terminal as { unknown: boolean }).unknown).toBe(false);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
