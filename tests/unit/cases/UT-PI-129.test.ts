/**
 * Case ID: UT-PI-129  ·  STATUS: real
 *
 * 责任：分支 L92 `!/^[A-Za-z0-9._-]+$/.test(context.projectName)`（!；graphrag-tools.ts）
 * 维度坐标：`validateDocSearchContext` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-129.md（脚本的唯一依据）
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

describe("UT-PI-129 · validateDocSearchContext · 状态分支 × 合法迁移", () => {
  it("takes the negation branch only when the charset test fails", async () => {
    const { validateDocSearchContext } = await import("../../../src/graphrag-tools.js");
    // 步骤 1：构造使 ! 取真的输入——正则不匹配（projectName 含冒号）
    const notMatching = { role: "tester", projectName: "a:b" };

    // 步骤 2：调用 validateDocSearchContext，断言取真侧
    expect(() => validateDocSearchContext(notMatching as any)).toThrow(
      "projectName must match ^[A-Za-z0-9._-]+$",
    );

    // 步骤 3：构造使该分支取假的输入——正则匹配
    const matching = { role: "tester", projectName: "abc" };

    // 步骤 4：再次调用 validateDocSearchContext，断言取假侧——不抛错
    expect(validateDocSearchContext(matching as any)).toBeUndefined();
  });

});
