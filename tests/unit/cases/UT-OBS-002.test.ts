/**
 * Case ID: UT-OBS-002  ·  STATUS: real
 *
 * 责任：`bump` × `纯函数/无副作用` × `每等价类合法值`（波次一粗粒度登记）
 * 维度坐标：`bump` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-002.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-002 · bump · 纯函数/无副作用 × 每等价类合法值", () => {
  it("bumps counters by the requested delta and accumulates", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：分别 bump 两个计数器，其中一个重复两次
    obs.bump("a", 3);
    obs.bump("b");
    obs.bump("a", 4);

    // 步骤 3：读回 snapshot().counters 逐值对账
    expect(obs.snapshot().counters).toEqual({ a: 7, b: 1 });
  });
});
