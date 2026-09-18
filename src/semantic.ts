import type { TokenUsage } from "./types.js";
const fields = ["input_tokens","output_tokens","total_tokens","cache_read_tokens","cache_write_tokens","reasoning_tokens"] as const;
export function validateUsage(u: TokenUsage): void {
  if (u.usage_observed_attempts > u.model_attempts) throw new Error("usage observed attempts exceed model attempts");
  const known = fields.filter((f)=>u[f] !== null); const missing = new Set(u.missing_fields);
  for (const f of fields) if ((u[f] === null) !== missing.has(f)) throw new Error(`usage missing mismatch: ${f}`);
  if (u.quality === "Complete" && (known.length !== 6 || u.usage_observed_attempts !== u.model_attempts)) throw new Error("invalid Complete usage");
  if (u.quality === "Partial" && (known.length === 0 || known.length === 6 || u.usage_observed_attempts === 0)) throw new Error("invalid Partial usage");
  if (u.quality === "Unknown" && known.length !== 0) throw new Error("invalid Unknown usage");
  if (u.input_tokens !== null && u.output_tokens !== null && u.total_tokens !== null && u.total_tokens !== u.input_tokens + u.output_tokens) throw new Error("usage total mismatch");
  if (u.input_tokens !== null && ((u.cache_read_tokens ?? 0)>u.input_tokens || (u.cache_write_tokens ?? 0)>u.input_tokens)) throw new Error("cache usage exceeds input");
  if (u.output_tokens !== null && (u.reasoning_tokens ?? 0)>u.output_tokens) throw new Error("reasoning usage exceeds output");
}
export function emptyUsage(): TokenUsage { return {source:"PiModelResponses",quality:"Complete",input_tokens:0,output_tokens:0,total_tokens:0,cache_read_tokens:0,cache_write_tokens:0,reasoning_tokens:0,model_attempts:0,usage_observed_attempts:0,missing_fields:[]}; }
