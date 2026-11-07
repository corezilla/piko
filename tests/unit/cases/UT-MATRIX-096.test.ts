/**
 * Case ID: UT-MATRIX-096  ·  STATUS: real
 *
 * 责任：参数 `store` 的 `非法值` 类（matrix.ts:14）
 * 维度坐标：`MatrixRuntime.constructor` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-096.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-096 · MatrixRuntime.constructor · 纯函数/无副作用 × 非法值", () => {
  it("binds a closed store without validating it", () => {
    // 步骤 1：构造并关闭一个 store
    const store = newStore();
    store.close();

    // 步骤 2：构造 runtime —— 该参数无校验
    const matrix = new MatrixRuntime(config, store);

    // 步骤 3：断言构造成功（问题在用到时才暴露）
    expect((matrix as unknown as { store: unknown }).store).toBe(store);
  });

});
