/**
 * Case ID: UT-PI-528  ·  STATUS: real
 *
 * 责任：返回站点 L97 值 `base + parts.join("") + "\n"` 逐值断言（pi-runtime.ts）
 * 维度坐标：`buildSystemPrompt` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-528.md（脚本的唯一依据）
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

describe("UT-PI-528 · buildSystemPrompt · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the base with the parts appended", async () => {
const aTask = (over: Record<string, unknown> = {}) => ({
  task_id: "t-1",
  instruction: "do the thing",
  workspace_ref: "piko",
  permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
  output_paths: [],
  ...over,
});
    // 步骤 2：调用 buildSystemPrompt（带 identity）
    const prompt = buildSystemPrompt(aTask() as never, { role: "tester", name: "Tester" });

    // 步骤 3：断言返回值逐值对账——基础 ＋ 身份块 ＋ 结尾换行
    expect(prompt.startsWith("You are Piko")).toBe(true);
    expect(prompt).toContain("\n\nYou are acting as **tester**.");
    expect(prompt.endsWith("\n")).toBe(true);
  });

});
