/**
 * Case ID: UT-OBS-097  ·  STATUS: real
 *
 * 责任：参数 `id: string` 的 `注入字符` 类（observability.ts:90）
 * 维度坐标：`metric` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-097.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-097 · metric · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected metric id as data", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric(注入串, "inc")
    // 步骤 3：断言原样保留、不执行
    const id = "$(id)`; DROP TABLE x;--";
    obs.metric(id, "inc");
    expect(obs.snapshot().metrics[id]).toBeDefined();
  });
});
