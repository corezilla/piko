/**
 * Case ID: UT-PI-125  ·  STATUS: real
 *
 * 责任：分支 L89 `if (!context.projectName || context.projectNa…`（if；graphrag-tools.ts）
 * 维度坐标：`validateDocSearchContext` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-125.md（脚本的唯一依据）
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
import {
  cacheKey,
  clearPrefetchCache,
  prefetchCacheSize,
  prefetchSkillContext,
  renderDocEntry,
  renderMemoryEntry,
  renderSkillContext,
  withTimeout,
} from "../../../src/skill-prefetch.js";
import {
  Mem0Adapter,
  Mem0ApiError,
  mapStatusToCode as mapMem0Status,
} from "../../../src/mem0-client.js";
import {
  GraphRAGAdapter,
  GraphRAGApiError,
  mapStatusToCode as mapGraphragStatus,
} from "../../../src/graphrag-client.js";
import { fakeFetch } from "./support/pi-fix.js";

describe("UT-PI-125 · validateDocSearchContext · 状态分支 × 合法迁移", () => {
  it("throws on an empty project name and passes a non-empty one", async () => {
    const { validateDocSearchContext } = await import("../../../src/graphrag-tools.js");
    // 步骤 1：构造使守卫取真的输入——projectName 为空串与纯空白串（role 合法）
    const empty = { role: "tester", projectName: "" };
    const blank = { role: "tester", projectName: "  " };

    // 步骤 2：调用 validateDocSearchContext，断言取真侧——错误被抛出
    expect(() => validateDocSearchContext(empty as any)).toThrow("projectName required");
    expect(() => validateDocSearchContext(blank as any)).toThrow("projectName required");

    // 步骤 3：构造使该分支取假的输入——projectName 非空
    const ok = { role: "tester", projectName: "piko" };

    // 步骤 4：再次调用 validateDocSearchContext，断言取假侧——不抛错
    expect(validateDocSearchContext(ok as any)).toBeUndefined();
  });

});
