import { createHash } from "node:crypto";
import { mkdirSync, rmSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { execFile } from "node:child_process";
import type { ArtifactDelivery, ArtifactTarget, InputRef, InputStaging, OutputArtifact, RuntimeConfig } from "./types.js";
import { PikoError } from "./types.js";

/** M010 `transfer` — data-plane搬运，运行于 P1；不写库、不改执行终态。 */

export type StagingResult = InputStaging;
export type DeliveryResult = ArtifactDelivery;

const sha256 = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");

function run(cmd: string, args: string[], signal?: AbortSignal): Promise<{ stdout: string; stderr: string }> {
  return new Promise((res, rej) => {
    execFile(cmd, args, { signal, timeout: 600_000, maxBuffer: 8 << 20 }, (err, stdout, stderr) => {
      if (err) rej(err);
      else res({ stdout, stderr });
    });
  });
}

/** Resolve a path inside the task staging root; reject escapes. */
function safeJoinIn(base: string, rel: string): string {
  const target = resolve(base, rel);
  const relCheck = relative(resolve(base), target);
  if (relCheck.startsWith("..") || isAbsolute(relCheck)) throw new PikoError("InvalidRequest", 400, `path escapes workspace: ${rel}`);
  return target;
}
export function safeJoin(stagingRoot: string, taskId: string, rel: string): string {
  const base = resolve(stagingRoot, taskId);
  const target = resolve(base, rel);
  const relCheck = relative(base, target);
  if (relCheck.startsWith("..") || isAbsolute(relCheck)) throw new PikoError("InvalidRequest", 400, `path escapes staging: ${rel}`);
  return target;
}

export class Transfer {
  private keyPath?: string;
  constructor(private readonly config: RuntimeConfig) {}

  /** Resolve the scp identity file from the credential reference (e.g. `env:PIKO_SCP_KEY`). */
  private async scpKeyPath(): Promise<string | undefined> {
    const ref = this.config.transfer.credential_ref;
    if (!ref) return undefined;
    if (this.keyPath) return this.keyPath;
    const { resolveSecret } = await import("./config.js");
    this.keyPath = await resolveSecret(ref);
    return this.keyPath;
  }

  private get stagingRoot() {
    return this.config.workspace.staging_root;
  }

  private assertAllowed(target: string) {
    const allow = this.config.transfer.target_allowlist ?? [];
    if (!allow.some((a) => target.startsWith(a))) {
      throw new PikoError("InputFetchFailed", 422, `transfer target not allowlisted: ${target}`);
    }
  }

  private async scpArgs(remote: string, local: string, direction: "pull" | "push") {
    const args: string[] = ["-B", "-q", "-o", "BatchMode=yes", "-o", "StrictHostKeyChecking=yes"];
    if (this.config.transfer.known_hosts) args.push("-o", `UserKnownHostsFile=${this.config.transfer.known_hosts}`);
    const key = await this.scpKeyPath();
    if (key) args.push("-i", key);
    if (direction === "pull") args.push("--", remote, local);
    else args.push("--", local, remote);
    return args;
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    const { max_attempts, base_delay_ms } = this.config.transfer.retry ?? { max_attempts: 3, base_delay_ms: 500 };
    let last: unknown;
    for (let attempt = 1; attempt <= max_attempts; attempt++) {
      try {
        return await fn();
      } catch (e) {
        last = e;
        if (attempt < max_attempts) await new Promise((r) => setTimeout(r, base_delay_ms * attempt));
      }
    }
    throw last;
  }

  /** P-INPUT: fetch declared inputs into local staging, verifying sha256. Never runs under a lease. */
  async fetchInputs(taskId: string, refs: InputRef[], signal?: AbortSignal): Promise<StagingResult> {
    if (!refs.length) return { state: "none", fetched: [], failed: [] };
    const base = resolve(this.stagingRoot, taskId);
    mkdirSync(base, { recursive: true });
    const fetched: InputRef[] = [];
    const failed: { source: string; error: string }[] = [];
    for (const ref of refs) {
      const dest = ref.dest ?? ref.source.split("/").pop() ?? "input";
      try {
        this.assertAllowed(ref.source);
        const local = safeJoin(this.stagingRoot, taskId, dest);
        mkdirSync(resolve(local, ".."), { recursive: true });
        if (this.config.transfer.method === "scp") {
          await this.withRetry(() => this.scpArgs(ref.source, local, "pull").then((args) => run("scp", args, signal)));
        } else if (this.config.transfer.method === "mount") {
          // mount: source is already a local path; copy is handled by the OS mount.
        } else {
          throw new PikoError("InputFetchFailed", 422, "object_store transport not implemented in this build");
        }
        const size = statSync(local).size;
        if (ref.sha256 && sha256(local) !== ref.sha256) throw new PikoError("InputFetchFailed", 422, `sha256 mismatch for ${ref.source}`);
        if (size > this.config.transfer.max_input_bytes) throw new PikoError("InputFetchFailed", 422, `input exceeds max_input_bytes: ${ref.source}`);
        fetched.push(ref);
      } catch (e) {
        failed.push({ source: ref.source, error: e instanceof Error ? e.message : String(e) });
      }
    }
    return { state: failed.length ? "failed" : "ready", fetched, failed };
  }

  /** P-ARTIFACT: deliver declared outputs to the artifact target. Does not touch the execution terminal state.
   *  `baseDir` is the resolved workspace root, so delivery reads exactly where execution wrote. */
  async deliverArtifacts(taskId: string, outputPaths: string[], target: ArtifactTarget, signal?: AbortSignal, baseDir?: string): Promise<DeliveryResult> {
    if (!outputPaths.length || !target) return { state: "none", delivered: [], failed: [] };
    this.assertAllowed(target.target);
    const delivered: OutputArtifact[] = [];
    const failed: { path: string; error: string }[] = [];
    for (const rel of outputPaths) {
      try {
        const local = baseDir ? safeJoinIn(baseDir, rel) : safeJoin(this.stagingRoot, taskId, rel);
        const st = statSync(local);
        const digest = sha256(local);
        const remote = `${target.target.replace(/\/+$/, "")}/${rel}`;
        if (target.method === "scp") {
          await this.withRetry(() => this.scpArgs(remote, local, "push").then((args) => run("scp", args, signal)));
        } else if (target.method === "mount") {
          // mounted target: write directly.
        } else {
          throw new PikoError("InternalError", 500, "object_store transport not implemented in this build");
        }
        delivered.push({ path: rel, sha256: digest, size_bytes: st.size });
      } catch (e) {
        failed.push({ path: rel, error: e instanceof Error ? e.message : String(e) });
      }
    }
    const state = failed.length === 0 ? "delivered" : delivered.length === 0 ? "failed" : "partial";
    return { state, delivered, failed };
  }

  clearStaging(taskId: string) {
    try {
      rmSync(join(this.stagingRoot, taskId), { recursive: true, force: true });
    } catch {
      /* best effort */
    }
  }
}

export const _internal = { sep, sha256 };
