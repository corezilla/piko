/**
 * Tier -> local oMLX model resolution for the direct-oMLX test path.
 *
 * When Piko talks to LLMTier, `config.agent.model` carries an LLMTier service
 * level (tier) name such as "Worker". For tests that call the local oMLX
 * endpoint directly (no LLMTier), the tier must be converted to a real oMLX
 * model id. This module is the single resolver used by tests and tooling.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface ModelMapping {
  mapping_version: string;
  target: { provider: string; base_url: string };
  tiers: Record<string, string>;
  default_model: string;
}

const here = dirname(fileURLToPath(import.meta.url));
const DEFAULT_MAPPING_PATH = resolve(here, "../../config/model-mapping.json");

export function loadModelMapping(path = DEFAULT_MAPPING_PATH): ModelMapping {
  return JSON.parse(readFileSync(path, "utf8")) as ModelMapping;
}

/**
 * Resolve a configured model value to an oMLX model id.
 * - Known tier name -> mapped oMLX model.
 * - Unknown value -> returned unchanged (already a concrete model id, or the
 *   caller is not in the direct-oMLX path). Callers that require a tier hit
 *   should use `resolveTierModelStrict`.
 */
export function resolveTierModel(value: string, mapping = loadModelMapping()): string {
  return mapping.tiers[value] ?? value;
}

export function resolveTierModelStrict(value: string, mapping = loadModelMapping()): string {
  const mapped = mapping.tiers[value];
  if (!mapped) throw new Error(`no oMLX model mapping for tier '${value}' (known tiers: ${Object.keys(mapping.tiers).join(", ")})`);
  return mapped;
}

export function isKnownTier(value: string, mapping = loadModelMapping()): boolean {
  return Object.prototype.hasOwnProperty.call(mapping.tiers, value);
}

/**
 * Convert a runtime config object from tier semantics to the direct-oMLX test
 * path: `agent.model` is mapped and `llmtier.base_url` is pointed at the local
 * oMLX target. Secrets refs and every other field are preserved.
 */
export function convertConfigToOMlx<T extends { agent: { model: string }; llmtier: { base_url: string } }>(
  config: T,
  mapping = loadModelMapping(),
): T {
  const converted = structuredClone(config);
  converted.agent.model = resolveTierModel(config.agent.model, mapping);
  converted.llmtier.base_url = mapping.target.base_url;
  return converted;
}
