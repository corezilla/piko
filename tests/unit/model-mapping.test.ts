import { describe, expect, it } from "vitest";
import { convertConfigToOMlx, isKnownTier, loadModelMapping, resolveTierModel, resolveTierModelStrict } from "../common/model-mapping.js";

describe("tier -> local oMLX model mapping", () => {
  it("maps every LLMTier service level to the local oMLX model", () => {
    const mapping = loadModelMapping();
    const tiers = ["Worker", "Senior", "Junior", "Associate", "Engineer"];
    for (const tier of tiers) {
      expect(isKnownTier(tier, mapping)).toBe(true);
      expect(resolveTierModelStrict(tier, mapping)).toBe("Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed");
    }
  });

  it("passes through a value that is already a concrete model id", () => {
    const mapping = loadModelMapping();
    expect(resolveTierModel("Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed", mapping)).toBe("Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed");
    expect(isKnownTier("Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed", mapping)).toBe(false);
  });

  it("rejects an unknown tier in strict mode", () => {
    expect(() => resolveTierModelStrict("NoSuchTier")).toThrow(/no oMLX model mapping/);
  });

  it("converts a tier-based config to the direct-oMLX path without touching secrets", () => {
    const mapping = loadModelMapping();
    const tierConfig = {
      instance_id: "piko-tier",
      agent: { model: "Worker", profile_ref: "workspace-standard" },
      llmtier: { base_url: "https://llmtier.example/v1/", api_key_secret_ref: "file:/tmp/key", models_timeout_ms: 1000 },
      matrix: { enabled: false },
    };
    const converted = convertConfigToOMlx(tierConfig, mapping);
    expect(converted.agent.model).toBe("Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed");
    expect(converted.llmtier.base_url).toBe("http://127.0.0.1:9000/v1/");
    expect(converted.llmtier.api_key_secret_ref).toBe("file:/tmp/key");
    // source object untouched
    expect(tierConfig.agent.model).toBe("Worker");
    expect(tierConfig.llmtier.base_url).toBe("https://llmtier.example/v1/");
  });
});
