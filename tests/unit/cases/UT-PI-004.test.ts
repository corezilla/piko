/**
 * Case ID: UT-PI-004  ·  STATUS: real
 *
 * 责任：`isProviderUnavailableMessage` × `错误路径` × `每个 typed 错误码`（波次一粗粒度登记；pi-runtime.ts:37）
 * 维度坐标：`isProviderUnavailableMessage` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-004.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { isProviderUnavailableMessage } from "../../../src/pi-runtime.js";

describe("UT-PI-004 · isProviderUnavailableMessage · 错误路径 × 每个 typed 错误码", () => {
  it("classifies each provider-unavailable signal as unavailable and leaves protocol errors unclassified", async () => {  // classifies each provider-unavailable signal as unavailable and leaves protocol errors unclassified
    // 步骤 1：逐个等价类 —— 每个 typed 错误信号各一个代表值
    const unavailable = [
      "gateway returned (502)",
      "gateway returned (503)",
      "provider_unavailable",
      "model_unavailable",
      "connect ECONNREFUSED 127.0.0.1:8080",
      "connection refused",
      "connection error",
      "fetch failed",
      "network error",
      "socket disconnected",
      "terminated",
    ];
    for (const message of unavailable) {
      expect(isProviderUnavailableMessage(message)).toBe(true);
    }

    // 步骤 2：协议类/普通错误 —— 不得被误判为 provider 不可达
    // （否则会错误归类为 ModelUnavailable/Dependency 而不是 ModelResponseInvalid/ModelProtocol）
    const protocol = [
      "unexpected end of stream",
      "invalid JSON in response body",
      "missing required field 'output'",
      "rate limit exceeded",
      "internal server error",
      "",
    ];
    for (const message of protocol) {
      expect(isProviderUnavailableMessage(message)).toBe(false);
    }

    // 步骤 3：断言无残留 —— 纯函数不写状态、不建资源
  });
});
