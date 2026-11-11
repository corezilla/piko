import { describe, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, textResponseSse, sseResponse, toolCallSse, piTools, recordingChannel } from "./support/pi-runtime-fix.js";

describe("p", () => {
  it("unsafe retry blocked", async () => {
    const { PiRuntime } = await import("../../../src/pi-runtime.js");
    const { TaskStore } = await import("../../../src/store.js");
    const { piConfig, piTools: pt } = await import("./support/pi-runtime-fix.js");
    const store = new TaskStore(":memory:", 1000);
    const rec = recordingChannel({ reserveTool: "UnsafeRetryBlocked" });
    const rt = new PiRuntime(piConfig(), pt({ "workspace-standard": { bash: { effect: "read_only", replay: "safe" } } as any }), store, rec.channel, "k");
    let n = 0;
    stubModelFetch(() => { n++; return n === 1 ? sseResponse(toolCallSse("bash", { command: "ls" })) : sseResponse(textResponseSse("fallback")); });
    try {
      const res = await rt.execute("run-1", 1, piTask("task-1"), "/tmp", () => false);
      console.log("UNSAFE:", JSON.stringify(res));
      console.log("FACTS:", JSON.stringify(rec.facts.map(f=>f.kind)));
    } finally { vi.unstubAllGlobals(); await rt.close(); store.close(); }
  }, 30000);

  it("aborted outcome", async () => {
    const fx = await piFixture();
    stubModelFetch(() => sseResponse(textResponseSse("x"), 200));
    try {
      // isCancelled 恒 true ⇒ cancelTimer 会 requestAbort
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => true);
      console.log("ABORT:", JSON.stringify(res));
    } finally { vi.unstubAllGlobals(); await fx.close(); }
  }, 30000);
});
