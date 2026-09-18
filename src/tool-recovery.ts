import { createHash } from "node:crypto";
import type { Context } from "../upstream/pi/packages/agent/src/harness/context.ts";
import type {
  AgentHarnessTool,
  AgentHarnessToolInvocation,
} from "../upstream/pi/packages/agent/src/harness/types.ts";
import type { JsonValue } from "../upstream/pi/packages/agent/src/harness/session/types.ts";
import {
  applyEditsToNormalizedContent,
  detectLineEnding,
  normalizeToLF,
  restoreLineEndings,
  stripBom,
} from "../upstream/pi/packages/agent/src/harness/tools/edit-diff.ts";
import { resolveToolPath } from "../upstream/pi/packages/agent/src/harness/tools/path-utils.ts";
import type { ExecutionToolContext } from "../upstream/pi/packages/agent/src/harness/tools/tool-context.ts";
import type { ToolPolicy, ToolRegistry } from "./config.js";

type RecoveryPlan = {
  version: 1;
  before: string;
  after: string;
  result: JsonValue;
};

const PLAN_MEMO = "workspace-write-plan";
const digest = (content:string) => `sha256:${createHash("sha256").update(content).digest("hex")}`;

async function fileState(env:ExecutionToolContext["env"], path:string, context:Context):Promise<{fingerprint:string;content?:string}> {
  const info=await env.fileInfo(path,context);
  if(!info.ok){
    if(info.error.code==="not_found")return {fingerprint:"missing"};
    throw info.error;
  }
  if(info.value.kind!=="file"&&info.value.kind!=="symlink")throw new Error(`Workspace write target is not a file: ${path}`);
  const read=await env.readTextFile(path,context);
  if(!read.ok)throw read.error;
  return {fingerprint:digest(read.value),content:read.value};
}

function isPlan(value:JsonValue|undefined):value is RecoveryPlan {
  if(!value||typeof value!=="object"||Array.isArray(value))return false;
  const plan=value as Record<string,unknown>;
  return plan.version===1&&typeof plan.before==="string"&&typeof plan.after==="string"&&"result" in plan;
}

async function executeRecoverable(
  base:AgentHarnessTool<ExecutionToolContext>,
  toolCallId:string,
  params:any,
  onUpdate:any,
  toolContext:ExecutionToolContext,
  invocation:AgentHarnessToolInvocation,
  context:Context,
){
  const absolutePath=await resolveToolPath(toolContext.env,params.path,context);
  let planValue=await invocation.getMemo(PLAN_MEMO);
  if(planValue!==undefined&&!isPlan(planValue))throw new Error(`Invalid durable recovery plan for ${base.name}`);
  let plan=planValue as RecoveryPlan|undefined;
  if(!plan){
    const before=await fileState(toolContext.env,absolutePath,context);
    let afterContent:string;
    let result:JsonValue;
    if(base.name==="write"){
      afterContent=params.content;
      result={content:[{type:"text",text:`Successfully wrote to ${params.path}`}]};
    }else if(base.name==="edit"){
      if(!Array.isArray(params.edits)||params.edits.length===0)throw new Error("Edit tool input is invalid. edits must contain at least one replacement.");
      if(before.content===undefined)throw new Error(`Could not edit missing file: ${params.path}`);
      const {bom,text}=stripBom(before.content);
      const ending=detectLineEnding(text);
      const normalized=normalizeToLF(text);
      const applied=applyEditsToNormalizedContent(normalized,params.edits,params.path);
      afterContent=bom+restoreLineEndings(applied.newContent,ending);
      result={
        content:[{type:"text",text:`Successfully replaced ${params.edits.length} block(s) in ${params.path}.`}],
      };
    }else throw new Error(`Recovery contract is not implemented for tool ${base.name}`);
    plan={version:1,before:before.fingerprint,after:digest(afterContent),result};
    await invocation.setMemo(PLAN_MEMO,plan);
  }else{
    const current=await fileState(toolContext.env,absolutePath,context);
    if(current.fingerprint===plan.after)return plan.result as any;
    if(current.fingerprint!==plan.before)throw new Error(`Workspace write recovery is ambiguous for ${params.path}; target state differs from both the recorded pre-state and post-state.`);
  }
  return base.execute(toolCallId,params,onUpdate,toolContext,invocation,context);
}

export function applyToolRecoveryPolicy(
  base:AgentHarnessTool<ExecutionToolContext>,
  policy:ToolPolicy,
  registry:ToolRegistry,
):AgentHarnessTool<ExecutionToolContext>{
  if(policy.replay==="never")return {...base,replay:"never"};
  if(policy.effect==="read_only")return {...base,replay:"safe"};
  const contract=policy.recovery_contract_ref&&registry.recovery_contracts[policy.recovery_contract_ref];
  if(!contract||contract.implementation_ref!=="builtin:workspace-atomic-write")throw new Error(`Safe replay for ${base.name} has no executable recovery contract`);
  if(base.name!=="write"&&base.name!=="edit")throw new Error(`builtin:workspace-atomic-write does not support ${base.name}`);
  return {...base,replay:"safe",execute:(id,params,update,context,invocation,runContext)=>executeRecoverable(base,id,params,update,context,invocation,runContext)};
}
