/**
 * Case ID: UT-OBS-107  ·  STATUS: real
 *
 * 责任：参数 `labels: Record<string, string>` 的 `注入字符` 类（observability.ts:90）
 * 维度坐标：`metric` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-107.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-107 · metric · 纯函数/无副作用 × 每等价类合法值", () => {
  it("treats an injected label value as data", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：构造含注入串的标签并调用 metric
    obs.metric("m", "inc", 1, { host: "$(id)`; rm -rf /" });

    // 步骤 3：断言原样保留、不执行
    const key = Object.keys(obs.snapshot().metrics).find((k) => k.startsWith("m{"));
    expect(obs.snapshot().metrics[key!].labels?.host).toBe("$(id)`; rm -rf /");
  });
});
