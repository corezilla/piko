/**
 * Case ID: UT-PI-697  ·  STATUS: real
 *
 * 责任：throw L155 `reject`（守卫 `catch`；skill-tools.ts）
 * 维度坐标：`execute` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-697.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0LookupTool } from "../../../src/skill-tools.js";
import { Mem0ApiError } from "../../../src/mem0-client.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-697 · execute · 错误路径 × 每个 typed 错误码", () => {
  it("rethrows a non mem0 error unchanged", async () => {  // rethrows a non mem0 error unchanged
    // 步骤 1：构造触发 skill-tools.ts:155 处 throw 的输入
    //   —— search 抛出一个非 Mem0ApiError 的异常
    const boom = new TypeError("mem0 exploded");
    const fake = fakeMem0({ searchError: boom });
    const tool = createMem0LookupTool({ mem0: fake.mem0, context: skillContext() });
    // 步骤 2：调用 execute(…)
    let caught: unknown;
    try {
      await runExecute(tool, { query: "q" });
    } catch (e) {
      caught = e;
    }
    // 步骤 3：断言错误原样上抛（同一实例、同一消息、同一类型），无部分写入
    expect(caught).toBe(boom);
    expect((caught as Error).message).toBe("mem0 exploded");
    expect((caught as Error).name).toBe("TypeError");
    expect(fake.calls.search).toHaveLength(1);
    // 步骤 4：断言内部错误不上抛为客户端码 —— 没有 code／status 字段，也不是 Mem0ApiError
    expect(caught).not.toBeInstanceOf(Mem0ApiError);
    expect((caught as any).code).toBeUndefined();
    expect((caught as any).status).toBeUndefined();
    // 降级路径没有发生：没有产出 memory unavailable 结果
    expect(fake.calls.search).toHaveLength(1);
  });
});
