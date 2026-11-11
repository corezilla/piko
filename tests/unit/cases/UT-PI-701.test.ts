/**
 * Case ID: UT-PI-701  ·  STATUS: real
 *
 * 责任：参数 `deps: SkillToolDeps` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:171）
 * 维度坐标：`createMem0RecordTool` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-701.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool } from "../../../src/skill-tools.js";
import { fakeMem0, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-701 · createMem0RecordTool · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("applies the context boundary values at construction time", async () => {  // applies the context boundary values at construction time
    const fake = fakeMem0();
    // 步骤 1：按 `边界(上/下/零/空/满)` 类构造 deps —— 边界取 context 两个字段的
    // 下界（空串）、单字符下界与无上界时的长值
    // 下界：role 为空串 → 构造期抛 "role required"
    expect(() =>
      createMem0RecordTool({ mem0: fake.mem0, context: skillContext({ role: "", projectName: "piko" }) }),
    ).toThrowError(new Error("role required"));
    // 下界：projectName 为空串 → 构造期抛 "projectName required"
    expect(() =>
      createMem0RecordTool({ mem0: fake.mem0, context: skillContext({ role: "tester", projectName: "" }) }),
    ).toThrowError(new Error("projectName required"));
    // 单字符下界：role / projectName 各一个字符 → 接受
    const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext({ role: "a", projectName: "a" }) });
    expect(tool.name).toBe("mem0_record");
    // 上界：两个字段都没有长度上限，长值照样接受
    const long = createMem0RecordTool({
      mem0: fake.mem0,
      context: skillContext({ role: "r".repeat(256), projectName: "p".repeat(256) }),
    });
    expect(long.name).toBe("mem0_record");
    // 步骤 2 / 3：边界取值不产生任何 mem0 调用
    expect(fake.calls.search).toHaveLength(0);
    expect(fake.calls.add).toHaveLength(0);
  });
});
