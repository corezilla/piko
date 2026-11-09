#!/usr/bin/env python3
"""写 PI 的 UT Case 脚本。

与其它 writer 同样的原则：只做标记替换，不参与花括号处理。
"""
from pathlib import Path

CASES = Path('tests/unit/cases')

HEADER = '''/**
 * Case ID: __CID__  ·  STATUS: real
 *
 * 责任：__DUTY__
 * 维度坐标：`__SYM__` × `__TYPE__` × `__CELL__`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/__CID__.md（脚本的唯一依据）
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

describe("__CID__ · __SYM__ · __TYPE__ × __CELL__", () => {
__BODY__
});
'''


def write(cid, duty, sym, type_, cell, body):
    text = (HEADER
            .replace("__CID__", cid)
            .replace("__DUTY__", duty)
            .replace("__SYM__", sym)
            .replace("__TYPE__", type_)
            .replace("__CELL__", cell)
            .replace("__BODY__", body.rstrip() + "\n"))
    (CASES / f"{cid}.test.ts").write_text(text)


def w(cid, duty, sym, type_, cell, body):
    write(cid, duty, sym, type_, cell, body)
