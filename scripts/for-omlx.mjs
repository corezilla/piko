#!/usr/bin/env node
/**
 * Convert a tier-based Piko runtime config into the direct-oMLX test config.
 *
 * When Piko is pointed at LLMTier, `agent.model` holds an LLMTier service level
 * (tier) such as "Worker". This script rewrites it to a real local oMLX model id
 * and points `llmtier.base_url` at the local oMLX endpoint, so the same config
 * can drive a test run that never calls LLMTier.
 *
 * Usage:
 *   node scripts/for-omlx.mjs --tier Worker
 *   node scripts/for-omlx.mjs --config config/runtime.tier.json --out config/runtime.omlx.json
 *   node scripts/for-omlx.mjs --config config/runtime.tier.json            # prints to stdout
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const mappingPath = resolve(root, "config/model-mapping.json");
const mapping = JSON.parse(readFileSync(mappingPath, "utf8"));

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
}

function resolveTier(tier) {
  const mapped = mapping.tiers[tier];
  if (!mapped) {
    console.error(`unknown tier '${tier}'. known tiers: ${Object.keys(mapping.tiers).join(", ")}`);
    process.exit(2);
  }
  return mapped;
}

const tier = arg("--tier");
const configPath = arg("--config");
const outPath = arg("--out");

if (!tier && !configPath) {
  console.error("usage: for-omlx.mjs --tier <name> | --config <file> [--out <file>]");
  process.exit(2);
}

if (tier) {
  console.log(resolveTier(tier));
  process.exit(0);
}

const config = JSON.parse(readFileSync(resolve(root, configPath), "utf8"));
const originalModel = config.agent?.model;
if (typeof originalModel !== "string" || originalModel.length === 0) {
  console.error("config.agent.model missing");
  process.exit(2);
}
config.agent.model = mapping.tiers[originalModel] ?? originalModel;
config.llmtier.base_url = mapping.target.base_url;
const out = JSON.stringify(config, null, 2) + "\n";
if (outPath) {
  writeFileSync(resolve(root, outPath), out);
  console.error(`tier '${originalModel}' -> oMLX model '${config.agent.model}' (base ${config.llmtier.base_url}) -> ${outPath}`);
} else {
  process.stdout.write(out);
}
