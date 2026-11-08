#!/usr/bin/env python3
"""写 TRANSFER 的 UT Case 脚本。

与 case_writer 同样的原则：只做标记替换，不参与花括号处理。
"""
from pathlib import Path

CASES = Path('tests/unit/cases')

HEADER = '''/**
 * Case ID: __CID__  ·  STATUS: real
 *
 * 责任：__DUTY__
 * 维度坐标：`__SYM__` × `__TYPE__` × `__CELL__`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/__CID__.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { DurableNodeExecutionEnv } from "../../../src/durable-fs.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer, textOf } from "./support/transfer-fix.js";

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
