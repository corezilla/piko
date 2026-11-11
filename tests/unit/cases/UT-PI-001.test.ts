/**
 * Case ID: UT-PI-001  ·  STATUS: real
 *
 * 责任：`discussionMessage` × `纯函数/无副作用` × `每等价类合法值`（波次一粗粒度登记；pi-runtime.ts:42）
 * 维度坐标：`discussionMessage` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-001.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { discussionMessage } from "../../../src/pi-runtime.js";

describe("UT-PI-001 · discussionMessage · 纯函数/无副作用 × 每等价类合法值", () => {
  it("wraps the visible turn content in a custom piko.discussion message without leaking the event id into the content", async () => {  // wraps the visible turn content in a custom piko.discussion message without leaking the event id into the content
    // 步骤 1：构造 DiscussionTurn —— event_id 与 visible_content 分开给，
    // visible_content 里刻意不含 event_id（设计要求：投影后 event_id 不出现在 prompt）
    const turn = {
      event_id: "evt-42",
      turn_seq: 3,
      status: "Pending",
      visible_content: "the operator asked for a summary",
    };

    // 步骤 2：调用 discussionMessage(…)（pi-runtime.ts:42）
    const msg = discussionMessage(turn, 1700000000000);

    // 步骤 3：逐值断言 —— 结构、字段、顺序
    expect(msg).toEqual({
      role: "custom",
      customType: "piko.discussion",
      content: "the operator asked for a summary",
      display: false,
      details: { event_id: "evt-42" },
      timestamp: 1700000000000,
    });

    // 步骤 4：断言无残留 —— 纯函数不写状态、不建资源
    // （discussionMessage 只做一次对象构造，没有 IO 副作用）
  });
});
