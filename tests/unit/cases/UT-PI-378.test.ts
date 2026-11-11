/**
 * Case ID: UT-PI-378  ·  STATUS: real
 *
 * 责任：分支 L259 `!write`（!；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-378.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-378 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the negation on the write flag", async () => {  // takes the true and the false side of the negation on the write flag
    // 步骤 1a：read（非写）⇒ !write 为真
    const readFx = await piFixture({
      registry: piTools({ "workspace-standard": { read: { effect: "read_only", replay: "safe" } } as never }),
    });
    stubModelFetch();
    try {
      const res = await readFx.runtime.execute("run-1", 1, piTask("task-1"), readFx.root, () => false);
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await readFx.close();
    }

    // 步骤 1b：write（写）⇒ !write 为假 ⇒ 走 write_paths 授权
    const writeFx = await piFixture({
      registry: piTools({ "workspace-standard": { write: { effect: "read_only", replay: "safe" } } as never }),
    });
    stubModelFetch();
    try {
      const res = await writeFx.runtime.execute("run-1", 1, piTask("task-1"), writeFx.root, () => false);
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await writeFx.close();
    }
  });
});
