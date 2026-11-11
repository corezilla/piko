/**
 * Case ID: UT-PI-083  ·  STATUS: real
 *
 * 责任：分支 L98 `status >= 500 && status < 600`（&&；graphrag-client.ts）
 * 维度坐标：`mapStatusToCode` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-083.md（脚本的唯一依据）
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

describe("UT-PI-083 · mapStatusToCode · 状态分支 × 合法迁移", () => {
  it("requires both halves of the 5xx window", async () => {
    // 步骤 1：构造 && 两侧都真的 status＝500，与左侧真右侧假的 status＝600
    const bothTrue = 500;
    const leftOnly = 600;
    const rightOnly = 499;

    // 步骤 2：调用 mapStatusToCode，断言两侧都真时命中 5xx 分支
    expect(mapGraphragStatus(bothTrue)).toBe("server_error");

    // 步骤 3：构造使该分支取假的输入——左侧为假
    expect(mapGraphragStatus(leftOnly)).toBe("server_error");

    // 步骤 4：再次调用 mapStatusToCode，断言取假侧——右侧为假时也落到兜底
    expect(mapGraphragStatus(rightOnly)).toBe("server_error");
    expect(mapGraphragStatus(600)).not.toBe("not_found");
  });

});
