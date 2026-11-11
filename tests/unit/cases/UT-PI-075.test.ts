/**
 * Case ID: UT-PI-075  ·  STATUS: real
 *
 * 责任：参数 `status: number` 的 `恰好通过` 类（graphrag-client.ts:93）
 * 维度坐标：`mapStatusToCode` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-075.md（脚本的唯一依据）
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

describe("UT-PI-075 · mapStatusToCode · 数值/长度上限参数 × 恰好通过", () => {
  it("maps the boundary status 500 to server_error", async () => {
    // 步骤 1：构造参数 status——源码比较常量里的下边界 500
    const status = 500;

    // 步骤 2：调用 mapStatusToCode
    const code = mapGraphragStatus(status);

    // 步骤 3：断言返回值逐值对账
    expect(code).toBe("server_error");
    expect(typeof code).toBe("string");
  });

});
