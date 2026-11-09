/**
 * Case ID: UT-PI-520  ·  STATUS: real
 *
 * 责任：参数 `skillContext: PrefetchedSkillContext` 的 `非法值` 类（pi-runtime.ts:55）
 * 维度坐标：`buildSystemPrompt` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-520.md（脚本的唯一依据）
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

describe("UT-PI-520 · buildSystemPrompt · 纯函数/无副作用 × 非法值", () => {
  it("does not validate the skill context", async () => {
const aTask = (over: Record<string, unknown> = {}) => ({
  task_id: "t-1",
  instruction: "do the thing",
  workspace_ref: "piko",
  permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
  output_paths: [],
  ...over,
});
    // 步骤 2：调用 buildSystemPrompt（skill context 是字符串）
    // 步骤 3：断言被拒——renderSkillContext 按对象读 context.memory，
    //         字符串没有这个字段，故抛 TypeError（该参数不校验）
    expect(() =>
      buildSystemPrompt(aTask() as never, { role: "r", name: "n" }, "not-a-context" as never),
    ).toThrow(TypeError);
  });

});
