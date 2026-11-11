/**
 * Case ID: UT-PI-863  ·  STATUS: real
 *
 * 责任：throw L90 `host_not_allowed`（守卫 `if (!allowlist.includes(host))`；tool-host-policy.ts）
 * 维度坐标：`makePolicyFetch` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-863.md（脚本的唯一依据）
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

describe("UT-PI-863 · makePolicyFetch · 错误路径 × 每个 typed 错误码", () => {
  it("raises the host_not_allowed error code for a foreign host", async () => {  // raises the host_not_allowed error code for a foreign host
    // 步骤 1：构造触发 L90 的输入——不在允许列表里的主机
    enterNetworkScope(["a.com"]);
    const base = vi.fn(async () => new Response("ok", { status: 200 }));
    const policy = makePolicyFetch(base as unknown as typeof fetch);
    // 步骤 2：调用
    let caught: unknown;
    try {
      await policy("https://b.com/x");
    } catch (error) {
      caught = error;
    }
    // 步骤 3：断言消息可判别、含建议动作，且无部分写入
    expect(caught).toBeInstanceOf(PolicyViolationError);
    const typed = caught as PolicyViolationError;
    expect(typed.code).toBe("host_not_allowed");
    expect(typed.message).toBe("host b.com not in policy allowlist");
    expect(typed.host).toBe("b.com");
    expect(base).not.toHaveBeenCalled();
  });
});
