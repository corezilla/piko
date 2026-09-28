import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { hostname } from "node:os";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import type { RuntimeConfig } from "./types.js";

export type RecoveryContract = {
  kind: "stable_deduplication" | "external_status_query";
  implementation_ref: string;
  verification_timeout_ms?: number;
};
export type ToolPolicy = {
  effect: string;
  replay: "never" | "safe";
  recovery_contract_ref?: string;
  permissions?: Record<string, string[]>;
};
export type BoundToolProfile = { tools: Record<string, ToolPolicy> };
export type ToolRegistry = {
  profile_version: string;
  recovery_contracts: Record<string, RecoveryContract>;
  profiles: Record<string, BoundToolProfile>;
};

export function validateToolRegistry(tools: ToolRegistry) {
  const supported = new Set(["builtin:matrix-txn", "builtin:workspace-atomic-write", "builtin:external-status"]);
  const knownTools = new Set(["read", "write", "edit", "bash"]);
  for (const c of Object.values(tools.recovery_contracts)) {
    if (!supported.has(c.implementation_ref)) throw new Error(`unregistered recovery implementation: ${c.implementation_ref}`);
  }
  for (const p of Object.values(tools.profiles)) {
    for (const [name, t] of Object.entries(p.tools)) {
      if (!knownTools.has(name)) throw new Error(`unregistered tool implementation: ${name}`);
      const contract = t.recovery_contract_ref ? tools.recovery_contracts[t.recovery_contract_ref] : undefined;
      if (t.recovery_contract_ref && !contract) throw new Error(`tool ${name} has unbound recovery contract`);
      if (t.replay === "safe" && t.effect !== "read_only" && !contract) throw new Error(`unsafe replay declaration: ${name}`);
      if (contract?.implementation_ref === "builtin:workspace-atomic-write" && (!["write", "edit"].includes(name) || t.effect !== "workspace_write")) {
        throw new Error(`workspace atomic recovery is not applicable to tool ${name}`);
      }
      if (contract?.implementation_ref !== "builtin:workspace-atomic-write" && t.replay === "safe" && t.effect !== "read_only") {
        throw new Error(`recovery implementation ${contract?.implementation_ref} is not available for local tool ${name}`);
      }
    }
  }
}

async function gitHead(repo: string): Promise<string> {
  const head = (await readFile(`${repo}/.git/HEAD`, "utf8")).trim();
  if (!head.startsWith("ref: ")) return head;
  const ref = head.slice(5);
  try {
    return (await readFile(`${repo}/.git/${ref}`, "utf8")).trim();
  } catch {
    const packed = await readFile(`${repo}/.git/packed-refs`, "utf8");
    const line = packed.split("\n").find((x) => x.endsWith(` ${ref}`));
    if (!line) throw new Error("cannot resolve pinned Pi HEAD");
    return line.split(" ")[0]!;
  }
}

async function validated<T>(value: unknown, schemaPath: string): Promise<T> {
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  const AjvCtor: any = (Ajv as any).default ?? Ajv;
  const formats: any = (addFormats as any).default ?? addFormats;
  const ajv = new AjvCtor({ allErrors: true, strict: false });
  formats(ajv);
  if (!ajv.validate(schema, value)) throw new Error(ajv.errorsText(ajv.errors));
  return value as T;
}

/**
 * Load and validate runtime config + tool registry, then verify the pinned Pi revision
 * exists. Per notes/pi-integration.md, Piko uses Pi's *native* extension surface
 * (onRawUsage callback + before_request hook), so S6 verifies the Pi revision/hooks
 * rather than "adapter patch" source markers.
 */
export async function loadConfig(path: string, root = process.cwd()): Promise<{ config: RuntimeConfig; tools: ToolRegistry }> {
  const config = await validated<RuntimeConfig>(
    JSON.parse(await readFile(path, "utf8")),
    `${root}/interfaces/schemas/piko-runtime-config-v0.3.schema.json`,
  );
  const tools = await validated<ToolRegistry>(
    JSON.parse(await readFile(config.tools.profile_registry_path, "utf8")),
    `${root}/interfaces/schemas/piko-tool-profile-v0.3.schema.json`,
  );
  validateToolRegistry(tools);
  const piRoot = `${root}/upstream/pi`;
  if ((await gitHead(piRoot)) !== config.pi.commit) throw new Error("Pi checkout commit mismatch");
  // Verify the native extension surface Piko depends on exists at this revision.
  const harness = await readFile(`${piRoot}/packages/agent/src/harness/agent-harness.ts`, "utf8");
  if (!harness.includes("onRawUsage")) throw new Error("Pi revision lacks onRawUsage extension point");
  return { config, tools };
}

export async function resolveSecret(ref: string): Promise<string> {
  const [kind, ...rest] = ref.split(":");
  const key = rest.join(":");
  if (kind === "env") {
    const v = process.env[key];
    if (!v) throw new Error(`missing env secret ${key}`);
    return v;
  }
  if (kind === "file") return (await readFile(key, "utf8")).trim();
  throw new Error(`secret provider ${kind} is not available in this build`);
}

export const _internal = { createHash, hostname };
