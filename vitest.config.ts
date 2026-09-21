import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {alias: {
    "@earendil-works/chord/context": resolve("upstream/pi/packages/chord/src/context/index.ts"),
    "@earendil-works/chord": resolve("upstream/pi/packages/chord/src/index.ts"),
    "@earendil-works/pi-telemetry": resolve("upstream/pi/packages/telemetry/src/index.ts"),
    "@earendil-works/pi-ai/utils/uuid": resolve("upstream/pi/packages/ai/src/utils/uuid.ts"),
    "@earendil-works/pi-ai": resolve("upstream/pi/packages/ai/src/index.ts"),
    "typebox/compile": resolve("upstream/pi/node_modules/typebox/build/compile/index.mjs"),
    "typebox/error": resolve("upstream/pi/node_modules/typebox/build/error/index.mjs"),
    "typebox/value": resolve("upstream/pi/node_modules/typebox/build/value/index.mjs"),
    "typebox": resolve("upstream/pi/node_modules/typebox")
  }},
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts", "tests/fault/**/*.test.ts"],
    exclude: ["upstream/**", "node_modules/**"],
    // Live integration/acceptance tests drive a real model and process; unit
    // tests still finish in milliseconds, so a generous ceiling is safe.
    testTimeout: 300_000,
    hookTimeout: 120_000
  }
});
