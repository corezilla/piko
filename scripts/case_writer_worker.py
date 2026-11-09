#!/usr/bin/env python3
"""写 WORKER 的 UT Case 脚本。

与 case_writer_transfer 同样的原则：只做标记替换，不参与花括号处理。
"""
from pathlib import Path

CASES = Path('tests/unit/cases')

HEADER = '''/**
 * Case ID: __CID__  ·  STATUS: real
 *
 * 责任：__DUTY__
 * 维度坐标：`__SYM__` × `__TYPE__` × `__CELL__`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/__CID__.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { ExecutionFactCollector, statusFromErrorCode } from "../../../src/execution-facts.js";
import { buildRawResultRef, isExecutionFailure } from "../../../src/test-evidence.js";
import { RunWorker, aggregateUsage, buildStats, sendDiscussionReplyWithRetry } from "../../../src/worker.js";
import { applyToolRecoveryPolicy, executeRecoverable, fileState, isPlan } from "../../../src/tool-recovery.js";
import { TaskStore } from "../../../src/store.js";
import type { ExecutionFact } from "../../../src/execution-facts.js";
import {
  config,
  fakeChannel,
  fakeMatrix,
  fakePi,
  fakeTransfer,
  rejectingChannel,
  task,
  throwingChannel,
  workerFixture,
} from "./support/worker-fix.js";
import {
  context,
  emptyRegistry,
  envAt,
  fakeEnv,
  invocation,
  neverPolicy,
  readPolicy,
  registry,
  toolContext,
  writePolicy,
} from "./support/recovery-fix.js";
import { execDeps, runtimeConfig } from "./support/exec-process-fix.js";

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
