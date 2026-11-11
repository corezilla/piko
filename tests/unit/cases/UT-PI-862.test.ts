/**
 * Case ID: UT-PI-862  ·  STATUS: real
 *
 * 责任：throw L83 `invalid_request`（守卫 `catch`；tool-host-policy.ts）
 * 维度坐标：`makePolicyFetch` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-862.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import {
  PolicyViolationError,
  currentAllowlist,
  enterNetworkScope,
  exitNetworkScope,
  installNetworkPolicy,
  makePolicyFetch,
  restoreNetworkPolicy,
} from "../../../src/tool-host-policy.js";

describe("UT-PI-862 · makePolicyFetch · 错误路径 × 每个 typed 错误码", () => {
  it("raises the invalid_request error code for an unparsable URL", async () => {  // raises the invalid_request error code for an unparsable URL
    // 步骤 1：构造触发 L83 的输入——不是 URL 的字符串
    enterNetworkScope(["a.com"]);
    const base = vi.fn(async () => new Response("ok", { status: 200 }));
    const policy = makePolicyFetch(base as unknown as typeof fetch);
    // 步骤 2：调用 makePolicyFetch 包装出来的 fetch
    let caught: unknown;
    try {
      await policy("not a url");
    } catch (error) {
      caught = error;
    }
    // 步骤 3：断言消息可判别、含建议动作，且无部分写入（base 未被调用）
    expect(caught).toBeInstanceOf(PolicyViolationError);
    const typed = caught as PolicyViolationError;
    expect(typed.code).toBe("invalid_request");
    expect(typed.message).toBe("not a URL: not a url");
    expect(typed.host).toBeUndefined();
    expect(base).not.toHaveBeenCalled();
  });
});
