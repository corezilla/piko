/**
 * Case ID: UT-MATRIX-093  ·  STATUS: real
 *
 * 责任：参数 `config` 的 `非法值` 类（matrix.ts:14）
 * 维度坐标：`MatrixRuntime.constructor` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-093.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-093 · MatrixRuntime.constructor · 纯函数/无副作用 × 非法值", () => {
  it("binds a config without a matrix section", () => {
    // 步骤 1：构造没有 matrix 段的 config
    const store = newStore();
    try {
      const matrix = new MatrixRuntime({ instance_id: "i" } as unknown as RuntimeConfig, store);

      // 步骤 2：断言构造成功（该参数无校验）
      expect((matrix as unknown as { started: boolean }).started).toBe(false);
    } finally {
      store.close();
    }
  });

});
