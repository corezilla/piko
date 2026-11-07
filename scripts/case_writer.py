#!/usr/bin/env python3
"""写 UT Case 脚本的小工具。

Case 脚本的头部都是同一段 TS，body 由各批次给出。这里只做**标记替换**，
不做任何花括号处理——那正是此前反复出错的地方（HEADER 里的 `{{` 与 body 里的
`}` 互相干扰）。
"""
from pathlib import Path

CASES = Path('tests/unit/cases')

HEADER = '''/**
 * Case ID: __CID__  ·  STATUS: real
 *
 * 责任：__DUTY__
 * 维度坐标：`__SYM__` × `__TYPE__` × `__CELL__`（方案 §6.1A 分卷 `__MOD__`）
 * 用例文档：docs/70_verification/unit/cases/__CID__.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("__CID__ · __SYM__ · __TYPE__ × __CELL__", () => {
__BODY__
});
'''


def write(cid, duty, sym, type_, cell, body, module="MATRIX"):
    text = (HEADER
            .replace("__CID__", cid)
            .replace("__DUTY__", duty)
            .replace("__SYM__", sym)
            .replace("__TYPE__", type_)
            .replace("__CELL__", cell)
            .replace("__MOD__", module)
            .replace("__BODY__", body.rstrip() + "\n"))
    (CASES / f"{cid}.test.ts").write_text(text)
