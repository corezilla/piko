/**
 * Case ID: UT-OBS-060  ·  STATUS: real
 *
 * 责任：分支 L47 if: if (FORBIDDEN_KEYS.test(k))（observability.ts）
 * 维度坐标：`redact` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-060.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";

describe("UT-OBS-060 · redact · 状态分支 × 合法迁移", () => {
  it("redacts a forbidden key name", () => {
    // 步骤 1：构造含敏感键的记录
    const out = redact({ api_key: "sk-live-123", task_id: "t1" });

    // 步骤 2：调用 redact
    // 步骤 3：断言敏感键被替换为 [redacted]，普通键原样保留
    expect(out.api_key).toBe("[redacted]");
    expect(out.task_id).toBe("t1");
  });

  it("redacts every forbidden key form (credential/secret/token/password/...)", () => {
    // 步骤 1：构造各类敏感键
    const out = redact({
      credential: 1, secret: 2, token: 3, password: 4, authorization: 5, content: 6, apiKey: 7,
    });

    // 步骤 2：调用 redact
    // 步骤 3：断言逐键被遮蔽
    for (const key of ["credential", "secret", "token", "password", "authorization", "content", "apiKey"]) {
      expect(out[key]).toBe("[redacted]");
    }
  });

  it("keeps a non-forbidden key verbatim (the false side)", () => {
    // 取假侧
    const out = redact({ duration_ms: 12 });
    expect(out.duration_ms).toBe(12);
  });
});
