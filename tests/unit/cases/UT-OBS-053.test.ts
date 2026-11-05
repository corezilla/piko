/**
 * Case ID: UT-OBS-053  ·  STATUS: real
 *
 * 责任：分支 L129 ??: this.counters.get(counter) ?? 0（observability.ts）
 * 维度坐标：`bump` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-053.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-053 · bump · 状态分支 × 合法迁移", () => {
  it("takes the right side for a new counter (starts at zero)", () => {
    // 步骤 1：构造实例（counter 尚不存在）
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 bump("fresh", 4)
    // 步骤 3：断言从 0 起累加得 4
    obs.bump("fresh", 4);
    expect(obs.snapshot().counters.fresh).toBe(4);
  });

  it("takes the left side for an existing counter", () => {
    // 步骤 1：先建一个计数
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    obs.bump("c", 10);

    // 步骤 2：再次 bump("c", 5)
    // 步骤 3：断言在旧值上累加得 15
    obs.bump("c", 5);
    expect(obs.snapshot().counters.c).toBe(15);
  });
});
