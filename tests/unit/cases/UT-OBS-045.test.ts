/**
 * Case ID: UT-OBS-045  ·  STATUS: real
 *
 * 责任：返回站点 L117 值 `counters` 逐值断言（observability.ts）
 * 维度坐标：`snapshot` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-045.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-045 · snapshot · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns a snapshot that does not share the live counter map", () => {
    // 步骤 1：bump 一个计数器后取快照
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    obs.bump("c", 7);
    const snap = obs.snapshot();

    // 步骤 2：再 bump 一次
    obs.bump("c", 1);

    // 步骤 3：断言旧快照里的计数未被改写（是拷贝，不是视图）
    expect(snap.counters.c).toBe(7);
    expect(obs.snapshot().counters.c).toBe(8);
  });
});
