import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import type { RuntimeConfig } from "./types.js";

export type RecoveryContract = {kind:"stable_deduplication"|"external_status_query";implementation_ref:string;verification_timeout_ms?:number};
export type ToolPolicy = {effect:string;replay:"never"|"safe";recovery_contract_ref?:string;permissions:Record<string,string[]>};
export type ToolRegistry = {profile_version:"0.3";recovery_contracts:Record<string,RecoveryContract>;profiles:Record<string,{tools:Record<string,ToolPolicy>}>};

export function validateToolRegistry(tools:ToolRegistry){
  const supported=new Set(["builtin:matrix-txn","builtin:workspace-atomic-write","builtin:external-status"]);
  const knownTools=new Set(["read","write","edit","bash"]);
  for(const c of Object.values(tools.recovery_contracts))if(!supported.has(c.implementation_ref))throw new Error(`unregistered recovery implementation: ${c.implementation_ref}`);
  for(const p of Object.values(tools.profiles))for(const [name,t] of Object.entries(p.tools)){
    if(!knownTools.has(name))throw new Error(`unregistered tool implementation: ${name}`);
    const contract=t.recovery_contract_ref?tools.recovery_contracts[t.recovery_contract_ref]:undefined;
    if(t.recovery_contract_ref&&!contract)throw new Error(`tool ${name} has unbound recovery contract`);
    if(t.replay==="safe"&&t.effect!=="read_only"&&!contract)throw new Error(`unsafe replay declaration: ${name}`);
    if(contract?.implementation_ref==="builtin:workspace-atomic-write"&&(!["write","edit"].includes(name)||t.effect!=="workspace_write"))throw new Error(`workspace atomic recovery is not applicable to tool ${name}`);
    if(contract?.implementation_ref!=="builtin:workspace-atomic-write"&&t.replay==="safe"&&t.effect!=="read_only")throw new Error(`recovery implementation ${contract?.implementation_ref} is not available for local tool ${name}`);
  }
}

async function gitHead(repo:string):Promise<string>{
  const head=(await readFile(`${repo}/.git/HEAD`,"utf8")).trim();if(!head.startsWith("ref: "))return head;
  const ref=head.slice(5);try{return (await readFile(`${repo}/.git/${ref}`,"utf8")).trim()}catch{const packed=await readFile(`${repo}/.git/packed-refs`,"utf8");const line=packed.split("\n").find(x=>x.endsWith(` ${ref}`));if(!line)throw new Error("cannot resolve pinned Pi HEAD");return line.split(" ")[0]!}
}

async function validated<T>(value:unknown, schemaPath:string):Promise<T>{
  const schema=JSON.parse(await readFile(schemaPath,"utf8")); const AjvCtor:any=(Ajv as any).default??Ajv;const formats:any=(addFormats as any).default??addFormats;const ajv=new AjvCtor({allErrors:true,strict:false}); formats(ajv);
  if(!ajv.validate(schema,value)) throw new Error(ajv.errorsText(ajv.errors)); return value as T;
}
export async function loadConfig(path:string, root=process.cwd()):Promise<{config:RuntimeConfig;tools:ToolRegistry}>{
  const config=await validated<RuntimeConfig>(JSON.parse(await readFile(path,"utf8")),`${root}/interfaces/schemas/piko-runtime-config-v0.3.schema.json`);
  const tools=await validated<ToolRegistry>(JSON.parse(await readFile(config.tools.profile_registry_path,"utf8")),`${root}/interfaces/schemas/piko-tool-profile-v0.3.schema.json`);
  validateToolRegistry(tools);
  const patch=await readFile(config.pi.adapter_patch_manifest_path); const digest=createHash("sha256").update(patch).digest("hex");
  if(digest!==config.pi.adapter_patch_sha256) throw new Error("Pi adapter patch manifest hash mismatch");
  const manifest=JSON.parse(patch.toString("utf8"));if(manifest.pi_version!==config.pi.version||manifest.pi_commit!==config.pi.commit)throw new Error("Pi adapter manifest pin mismatch");
  const piRoot=`${root}/upstream/pi`;if((await gitHead(piRoot))!==config.pi.commit)throw new Error("Pi checkout commit mismatch");
  const markers=[
    [`${piRoot}/packages/agent/src/harness/agent-harness.ts`,"stepId: string;"],
    [`${piRoot}/packages/agent/src/harness/runtime/drive/generation.ts`,"stepId: generation.generationContext.stepId"],
    [`${piRoot}/packages/agent/src/harness/runtime/drive/deferred.ts`,"stepId: expected.stepId"],
    [`${piRoot}/packages/agent/src/harness/runtime/drive/structural.ts`,"stepId: effect.task.taskId"],
    [`${piRoot}/packages/ai/src/api/openai-responses-shared.ts`,"options?.onRawUsage?.(response.usage)"],
    [`${piRoot}/packages/ai/src/api/openai-responses.ts`,"onRawUsage: (usage) => options?.onRawUsage?.(usage, model)"],
	[`${piRoot}/packages/ai/src/api/simple-options.ts`,"onRawUsage: options?.onRawUsage"],
    [`${piRoot}/packages/agent/src/harness/agent-harness.ts`,"onRawUsage?: (usage: unknown, context: Context) => void;"]
  ] as const;for(const [file,marker] of markers)if(!(await readFile(file,"utf8")).includes(marker))throw new Error(`Pi adapter patch is not applied: ${marker}`);
  return {config,tools};
}
export async function resolveSecret(ref:string):Promise<string>{
  const [kind,...rest]=ref.split(":"); const key=rest.join(":");
  if(kind==="env"){const v=process.env[key];if(!v)throw new Error(`missing env secret ${key}`);return v}
  if(kind==="file") return (await readFile(key,"utf8")).trim();
  throw new Error(`secret provider ${kind} is not available in this build`);
}
