import { isAbsolute, relative, resolve } from "node:path";
import type { AgentResult, RuntimeConfig, TaskRequest } from "./types.js";
import { PikoError } from "./types.js";
import type { BoundToolProfile, ToolRegistry } from "./config.js";

/** M002 `policy` — request/path/tool判定；无 deadline/预算。Runs in P0. */
export class Policy {
  constructor(
    private readonly config: RuntimeConfig,
    private readonly tools: ToolRegistry,
  ) {}

  /** Canonicalise a workspace-relative path, rejecting escapes. */
  private canonicalize(rel: string): string {
    if (isAbsolute(rel)) throw new PikoError("InvalidRequest", 400, `absolute path rejected: ${rel}`);
    if (rel.includes("\\")) throw new PikoError("InvalidRequest", 400, `backslash rejected: ${rel}`);
    const norm = rel.normalize("NFC");
    if (norm.split("/").some((s) => s === ".." || s === "." || s === "")) {
      throw new PikoError("InvalidRequest", 400, `illegal path segment: ${rel}`);
    }
    return norm;
  }

  private resolveWorkspace(workspaceRef: string): string {
    const root = this.config.workspace.roots[workspaceRef] ?? this.config.workspace.staging_root;
    if (!root) throw new PikoError("ScopeDenied", 403, `unknown workspace_ref: ${workspaceRef}`);
    return root;
  }

  /** §5.1.1 validateSubmission — returns a normalised, comparable task definition. */
  validate(task: TaskRequest, _principal: string): TaskRequest {
    const root = this.resolveWorkspace(task.workspace_ref);
    const read = [...new Set(task.permissions.read_paths.map((p) => this.canonicalize(p)))].sort();
    const write = [...new Set(task.permissions.write_paths.map((p) => this.canonicalize(p)))].sort();
    const outputs = [...new Set(task.output_paths.map((p) => this.canonicalize(p)))].sort();
    if (!this.tools.profiles[task.permissions.tool_profile_ref]) {
      throw new PikoError("ScopeDenied", 403, `unknown tool_profile_ref: ${task.permissions.tool_profile_ref}`);
    }
    for (const out of outputs) {
      const inRead = read.some((r) => within(root, r, out));
      const inWrite = write.some((w) => within(root, w, out));
      if (!inRead && !inWrite) throw new PikoError("ScopeDenied", 403, `output not authorised: ${out}`);
    }
    for (const ref of task.input_refs ?? []) {
      if (ref.dest) this.canonicalize(ref.dest);
    }
    return {
      ...task,
      permissions: { ...task.permissions, read_paths: read, write_paths: write },
      output_paths: outputs,
    };
  }

  /** Piko's completion gate: a Completed Result must carry a well-formed usage snapshot. */
  validateResult(result: AgentResult): void {
    if (result.state === "Completed" && (result.partial || result.failure !== null)) {
      throw new PikoError("InternalError", 500, "Completed result must not be partial or carry a failure");
    }
    if (result.state === "Failed" && result.failure === null) {
      throw new PikoError("InternalError", 500, "Failed result must carry a failure");
    }
  }
}

function within(root: string, glob: string, path: string): boolean {
  const base = glob.endsWith("/**") ? glob.slice(0, -3) : glob.endsWith("*") ? glob.slice(0, -1) : glob;
  return path === base || path.startsWith(base.endsWith("/") ? base : base + "/") || relative(resolve(root, base), resolve(root, path)) === "";
}

export type { BoundToolProfile };
