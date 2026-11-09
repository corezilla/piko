/**
 * Case ID: UT-PI-643  ·  STATUS: real
 *
 * 责任：分支 L251 `entry.metadata?.source`（?.；skill-prefetch.ts）
 * 维度坐标：`renderDocEntry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-643.md（脚本的唯一依据）
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
import { fakeFetch } from "./support/pi-fix.js";

describe("UT-PI-643 · renderDocEntry · 状态分支 × 合法迁移", () => {
  it("prefers the source over the path", async () => {
    // 步骤 2：调用 renderDocEntry（source 与 path 都有）
    const line = renderDocEntry({
      id: "d1",
      content: "body",
      metadata: { source: "src.md", path: "path.md" },
    } as never);

    // 步骤 3：断言返回值逐值对账——source 优先
    expect(line).toBe("- src.md: body");
  });

});
