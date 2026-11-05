/**
 * Case ID: UT-OBS-109  ·  STATUS: real
 *
 * 责任：参数 `unit: string` 的 `每等价类合法值` 类（observability.ts:90）
 * 维度坐标：`metric` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-109.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-109 · metric · 纯函数/无副作用 × 每等价类合法值", () => {
  it("maps the known unit names to their canonical form", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：分别以 count／ms／bytes／seconds／ratio 调用
    obs.metric("m_count", "inc", 1, undefined, "count");
    obs.metric("m_ms", "inc", 1, undefined, "ms");
    obs.metric("m_bytes", "inc", 1, undefined, "bytes");
    obs.metric("m_seconds", "inc", 1, undefined, "seconds");
    obs.metric("m_ratio", "inc", 1, undefined, "ratio");

    // 步骤 3：断言单位逐值对账
    const metrics = obs.snapshot().metrics;
    expect(metrics.m_count.unit).toBe("count");
    expect(metrics.m_ms.unit).toBe("ms");
    expect(metrics.m_bytes.unit).toBe("bytes");
    expect(metrics.m_seconds.unit).toBe("seconds");
    expect(metrics.m_ratio.unit).toBe("ratio");
  });
});
