/**
 * Case ID: UT-PI-130  ·  STATUS: real
 *
 * 责任：throw L87 `role required`（守卫 `if (!context.role || context.role.trim(…`；graphrag-tools.ts）
 * 维度坐标：`validateDocSearchContext` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-130.md（脚本的唯一依据）
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

describe("UT-PI-130 · validateDocSearchContext · 错误路径 × 每个 typed 错误码", () => {
  it("throws a role-required error", async () => {
    const { validateDocSearchContext } = await import("../../../src/graphrag-tools.js");
    // 步骤 1：构造触发 graphrag-tools.ts:87 处 throw 的输入——role 为空串
    const context = { role: "", projectName: "piko" };

    // 步骤 2：调用 validateDocSearchContext
    const err = (() => {
      try {
        validateDocSearchContext(context as any);
        return null;
      } catch (e) {
        return e as Error;
      }
    })();

    // 步骤 3：断言消息可判别，且无部分写入——校验函数不做任何状态写
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe("role required");

    // 步骤 4：断言内部错误不上抛为客户端码——它是普通 Error，没有 code 字段
    expect((err as any).code).toBeUndefined();
    expect((err as any).status).toBeUndefined();
  });

});
