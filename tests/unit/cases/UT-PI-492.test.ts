/**
 * Case ID: UT-PI-492  ·  STATUS: real
 *
 * 责任：返回站点 L43 值 `turn?[instruction,discussionMessage(tur…` 逐值断言（pi-runtime.ts）
 * 维度坐标：`initialPrompt` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-492.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import {
  PolicyViolationError,
  currentAllowlist,
  enterNetworkScope,
  exitNetworkScope,
  installNetworkPolicy,
  makePolicyFetch,
  restoreNetworkPolicy,
} from "../../../src/tool-host-policy.js";
import {
  ExecPolicyViolationError,
  assertExecutablesAllowed,
  assertRemoteExecutableAllowed,
  parseExecutable,
  parseExecutables,
  splitCommands,
  tokenize,
} from "../../../src/tool-exec-policy.js";
import {
  buildSystemPrompt,
  discussionMessage,
  initialPrompt,
  isProviderUnavailableMessage,
  normalizeRawUsage,
} from "../../../src/pi-runtime.js";
import { fakeFetch } from "./support/pi-fix.js";

describe("UT-PI-492 · initialPrompt · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the pair it built", async () => {
    // 步骤 1：造一条讨论轮次
const turn = (over: Record<string, unknown> = {}) => ({
  event_id: "$e1",
  turn_seq: 1,
  status: "Pending",
  visible_content: "the visible content",
  ...over,
});
    // 步骤 2：调用 initialPrompt（带轮次）
    const prompt = initialPrompt({ instruction: "do the thing" } as never, turn() as never, 1000) as { content: { text: string }[] }[];

    // 步骤 3：断言返回值逐值对账——第一条是指令，第二条是讨论
    expect(prompt[0]?.content[0]?.text).toBe("do the thing");
    expect(JSON.stringify(prompt[1])).toContain("$e1");
  });

});
