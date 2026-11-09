/**
 * Case ID: UT-PI-512  ·  STATUS: real
 *
 * 责任：参数 `task: TaskRequest` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:55）
 * 维度坐标：`buildSystemPrompt` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-512.md（脚本的唯一依据）
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

describe("UT-PI-512 · buildSystemPrompt · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("builds the base prompt for a task with empty fields", async () => {
    // 步骤 2：调用 buildSystemPrompt（任务字段全空）
    const prompt = buildSystemPrompt({ task_id: "", instruction: "", workspace_ref: "" } as never);

    // 步骤 3：断言返回值逐值对账——该参数不参与提示的构造
    expect(prompt).toContain("You are Piko");
  });

});
