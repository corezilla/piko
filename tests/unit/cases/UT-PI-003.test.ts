/**
 * Case ID: UT-PI-003  ·  STATUS: real
 *
 * 责任：`initialPrompt` × `纯函数/无副作用` × `每等价类合法值`（波次一粗粒度登记；pi-runtime.ts:43）
 * 维度坐标：`initialPrompt` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-003.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { initialPrompt } from "../../../src/pi-runtime.js";
import type { TaskRequest } from "../../../src/types.js";

describe("UT-PI-003 · initialPrompt · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the instruction alone without a turn and the instruction plus the discussion turn with one", async () => {  // returns the instruction alone without a turn and the instruction plus the discussion turn with one
    const task: TaskRequest = {
      task_id: "task-1",
      instruction: "write the report",
      workspace_ref: "piko",
      permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
      output_paths: [],
    };

    // 步骤 2a：无 turn —— L43 ternary 的 falsy 侧，返回单条 user 指令消息
    const alone = initialPrompt(task, undefined, 1700000000000);
    expect(alone).toEqual({
      role: "user",
      content: [{ type: "text", text: "write the report" }],
      timestamp: 1700000000000,
    });

    // 步骤 2b：有 turn —— L43 ternary 的 truthy 侧，返回 [指令, discussion 消息]
    const withTurn = initialPrompt(
      task,
      { event_id: "evt-7", turn_seq: 1, status: "Pending", visible_content: "kick off" },
      1700000000000,
    );
    expect(Array.isArray(withTurn)).toBe(true);
    const pair = withTurn as unknown[];
    expect(pair).toHaveLength(2);
    expect(pair[0]).toEqual({
      role: "user",
      content: [{ type: "text", text: "write the report" }],
      timestamp: 1700000000000,
    });
    expect(pair[1]).toEqual({
      role: "custom",
      customType: "piko.discussion",
      content: "kick off",
      display: false,
      details: { event_id: "evt-7" },
      timestamp: 1700000000000,
    });

    // 步骤 3：默认值 —— timestamp 缺省时取 Date.now()（不抛错、返回数字）
    const defaulted = initialPrompt(task);
    expect(typeof (defaulted as { timestamp: unknown }).timestamp).toBe("number");
  });
});
