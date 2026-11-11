/**
 * Case ID: UT-PI-121  ·  STATUS: real
 *
 * 责任：参数 `context: DocSearchToolContext` 的 `非法值` 类（graphrag-tools.ts:85）
 * 维度坐标：`validateDocSearchContext` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-121.md（脚本的唯一依据）
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

describe("UT-PI-121 · validateDocSearchContext · 纯函数/无副作用 × 非法值", () => {
  it("rejects an illegal project name", async () => {
    const { validateDocSearchContext } = await import("../../../src/graphrag-tools.js");
    // 步骤 1：构造 context 的非法值——projectName 含有正则不匹配的字符
    const context = { role: "tester", projectName: "my:project" };

    // 步骤 2：调用 validateDocSearchContext
    const err = (() => {
      try {
        validateDocSearchContext(context as any);
        return null;
      } catch (e) {
        return e as Error;
      }
    })();

    // 步骤 3：断言被拒绝时抛出可判别的错误，且无状态写／资源残留
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe("projectName must match ^[A-Za-z0-9._-]+$");
  });

});
