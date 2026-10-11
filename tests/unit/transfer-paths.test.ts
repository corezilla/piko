import { describe, expect, it } from "vitest";
import { safeJoin } from "../../src/transfer.js";

/**
 * UT-TRANSFER · staging path containment.
 * safeJoin is the only thing standing between a task-supplied relative path
 * and the filesystem, so its escape check is asserted directly.
 */
describe("UT-TRANSFER-001 · safeJoin", () => {
  const root = "/staging";
  const id = "task-1";

  it("resolves a plain relative path under the task's staging dir", () => {
    expect(safeJoin(root, id, "in/seed.md")).toBe("/staging/task-1/in/seed.md");
  });

  it("allows a path that walks down and back up but stays inside", () => {
    expect(safeJoin(root, id, "in/../out/x.txt")).toBe("/staging/task-1/out/x.txt");
  });

  it("rejects traversal that escapes the task staging dir", () => {
    expect(() => safeJoin(root, id, "../../etc/passwd")).toThrow(/escapes staging/);
  });

  it("rejects a deep traversal back into a sibling task", () => {
    expect(() => safeJoin(root, id, "../task-2/secret")).toThrow(/escapes staging/);
  });

  it("rejects an absolute path", () => {
    expect(() => safeJoin(root, id, "/etc/passwd")).toThrow(/escapes staging/);
  });
});
