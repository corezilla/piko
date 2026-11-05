/**
 * Case ID: UT-OBS-054  ·  STATUS: real
 *
 * 责任：分支 L130 catch: catch ()（observability.ts）
 * 维度坐标：`bump` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-054.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-054 · bump · 错误路径 × 每个 typed 错误码", () => {
  it("fails open: a throwing counter map does not break the caller", () => {
    // 步骤 1：构造实例并把内部计数器换成会抛错的 Map
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    // 注入一个 get/set 都会抛错、但仍可迭代的 Map：bump 的读与写都落在它上面，
    // snapshot 的遍历仍可工作（它只迭代，不读值）
    const hostile = new Map<string, number>();
    hostile.get = () => { throw new Error("counter store exploded"); };
    hostile.set = () => { throw new Error("counter store exploded"); };
    // @ts-expect-error — 注入一个读写都会抛错的 Map 以触发 catch 分支
    (obs as unknown as { counters: Map<string, number> }).counters = hostile;

    // 步骤 2：调用 bump —— 不得抛出
    expect(() => obs.bump("x")).not.toThrow();

    // 步骤 3：断言未产生半写状态（x 不在计数里）
    expect(obs.snapshot().counters.x).toBeUndefined();
  });
});
