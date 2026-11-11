/**
 * Case ID: UT-PI-669  ·  STATUS: real
 *
 * 责任：throw L106 `projectName required`（守卫 `if (!context.projectName || context.pro…`；skill-too…
 * 维度坐标：`validateContext` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-669.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateContext } from "../../../src/skill-tools.js";
import type { SkillToolContext } from "../../../src/skill-tools.js";
import { Mem0ApiError } from "../../../src/mem0-client.js";

describe("UT-PI-669 · validateContext · 错误路径 × 每个 typed 错误码", () => {
  it("throws the project name required error verbatim", async () => {  // throws the project name required error verbatim
    // 步骤 1：构造触发 skill-tools.ts:106 处 throw 的输入
    //   —— projectName 为空串／只含空白（role 合法，否则被前一守卫拦下）
    // 步骤 2：调用 validateContext(…)
    // 步骤 3：断言消息可判别（含建议动作）且无部分写入
    const context = { role: "tester", projectName: "   " };
    let caught: unknown;
    try {
      validateContext(context);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toBe("projectName required");
    expect((caught as Error).name).toBe("Error");
    // 消息可判别：与另外两条守卫消息互不相同
    expect((caught as Error).message).not.toBe("role required");
    expect((caught as Error).message).not.toBe("projectName must match ^[A-Za-z0-9._-]+$");
    // 无部分写入：入参不被改写
    expect(context).toEqual({ role: "tester", projectName: "   " });
    // 步骤 4：断言内部错误不上抛为客户端码 —— 不是 Mem0ApiError，也没有 code／status 字段
    expect(caught).not.toBeInstanceOf(Mem0ApiError);
    expect((caught as any).code).toBeUndefined();
    expect((caught as any).status).toBeUndefined();
  });
});
