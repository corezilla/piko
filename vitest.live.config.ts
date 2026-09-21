import { defineConfig } from "vitest/config";

// Live end-to-end suites drive a shared external Piko + oMLX (+ Synapse) and
// some cases restart those processes. They are kept out of the default run and
// executed serially so they cannot clobber each other or the fast suites.
//
//   npm run test:live      # both live suites
//   npm run test:scenario  # scenario suite only
export default defineConfig({
  test: {
    include: [
      "tests/integration/scenario-e2e.test.ts",
      "tests/integration/matrix-acceptance.test.ts",
    ],
    fileParallelism: false,
    testTimeout: 300_000,
    hookTimeout: 120_000,
  },
});
