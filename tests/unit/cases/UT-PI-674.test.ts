/**
 * Case ID: UT-PI-674  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #1：被调方 `deps.mem0.search(params.query, userId, {` 拒绝必须 typed 化上抛（skill-tools.t…
 * 维度坐标：`createMem0LookupTool` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-674.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0LookupTool } from "../../../src/skill-tools.js";
import { Mem0ApiError } from "../../../src/mem0-client.js";
import { fakeMem0, skillContext, runExecute } from "./support/c-skilltools-fix.js";

describe("UT-PI-674 · createMem0LookupTool · 错误路径 × 每个 typed 错误码", () => {
  it("degrades mem0 api errors and rethrows everything else from search", async () => {  // degrades mem0 api errors and rethrows everything else from search
    // 步骤 1：注入被调方 deps.mem0.search(...) 使其拒绝 —— 覆盖 Mem0ApiError 的
    // 每个语义错误码
    const codes = [
      { status: 401, code: "auth_invalid" },
      { status: 403, code: "auth_forbidden" },
      { status: 404, code: "not_found" },
      { status: 429, code: "rate_limited" },
      { status: 503, code: "server_error" },
      { status: 0, code: "network" },
    ];
    const observed: string[] = [];
    for (const { status, code } of codes) {
      const fake = fakeMem0({ searchError: new Mem0ApiError(status, code, "boom") });
      const tool = createMem0LookupTool({ mem0: fake.mem0, context: skillContext() });
      // 步骤 2：调用工具的 execute —— 工厂本身不 await，拒绝只能在 execute 里观测
      const result = await runExecute(tool, { query: "q" });
      observed.push(`${code}:${result.details.error}:${result.details.status}:${result.content[0].text}`);
      expect(fake.calls.search).toHaveLength(1);
    }
    // 步骤 3：逐值对账 —— 偏差记录：文档要求「typed 错误上抛」，实现对 Mem0ApiError
    // 是降级成 memory unavailable 结果（不吞错：code／status 保真进入 details）
    expect(observed).toEqual(codes.map(({ status, code }) => `${code}:${code}:${status}:memory unavailable: ${code}`));

    // 非 Mem0ApiError 的拒绝：原样上抛 —— 不吞错、不降级为成功、无半写状态
    const plain = new TypeError("mem0 exploded");
    const fake = fakeMem0({ searchError: plain });
    const tool = createMem0LookupTool({ mem0: fake.mem0, context: skillContext() });
    await expect(runExecute(tool, { query: "q" })).rejects.toBe(plain);
    expect(fake.calls.search).toHaveLength(1);
  });
});
