import { describe, expect, it, vi } from "vitest";
import { fakeFetch } from "./support/pi-fix.js";

describe("probe", () => {
  it("dynamic import resolves", async () => {
    const mod = await import("../../../src/pi-runtime.js");
    expect(typeof mod.PiRuntime).toBe("function");
    const g = await import("../../../src/graphrag-tools.js");
    expect(typeof g.createGraphragSearchTool).toBe("function");
  });
});
