import { AgentHarness, type AgentLane } from "../upstream/pi/packages/agent/src/harness/agent-harness.ts";
import { BACKGROUND_CONTEXT } from "../upstream/pi/packages/agent/src/harness/context.ts";
import { JsonlSessionRepo } from "../upstream/pi/packages/agent/src/harness/session/jsonl/repo.ts";
import { createBashTool, createEditTool, createReadTool, createWriteTool } from "../upstream/pi/packages/agent/src/harness/tools/index.ts";
import { createCustomMessage } from "../upstream/pi/packages/agent/src/harness/messages.ts";
import type { AgentMessage } from "../upstream/pi/packages/agent/src/types.ts";
import { createModels, createProvider } from "../upstream/pi/packages/ai/src/models.ts";
import { openAIResponsesApi } from "../upstream/pi/packages/ai/src/api/openai-responses.lazy.ts";
import { envApiKeyAuth } from "../upstream/pi/packages/ai/src/auth/helpers.ts";
import type { Model } from "../upstream/pi/packages/ai/src/types.ts";
import type { AgentResult, DocSearchConfig, MemoryConfig, RuntimeConfig, TaskRequest } from "./types.js";
import { Mem0Adapter } from "./mem0-client.js";
import { GraphRAGAdapter } from "./graphrag-client.js";
import { createMem0LookupTool, createMem0RecordTool, type SkillToolDeps } from "./skill-tools.js";
import { createGraphragSearchTool, type DocSearchToolDeps } from "./graphrag-tools.js";
import { installNetworkPolicy, restoreNetworkPolicy } from "./tool-host-policy.js";
import { appendFileSync } from "node:fs";
import { PikoError } from "./types.js";
import type { TaskStore } from "./store.js";
import type { Channel, Fact } from "./ipc.js";
import type { ToolRegistry } from "./config.js";
import { DurableNodeExecutionEnv } from "./durable-fs.js";
import { authorizePath } from "./workspace.js";
import { applyToolRecoveryPolicy } from "./tool-recovery.js";
import { relative,resolve,sep } from "node:path";

export type PiExecution={status:"completed"|"failed"|"cancelled";summary:string;failure?:NonNullable<AgentResult["failure"]>};

/** Provider-availability failures (gateway 502/503, provider unreachable) map to
 *  the contract's ModelUnavailable/Dependency, not ModelProtocol. Pi folds the
 *  HTTP status into the message text, so classification is message-based. */
export function isProviderUnavailableMessage(message:string):boolean{
  return /\((?:502|503)\)|provider_unavailable|model_unavailable|ECONNREFUSED|connection refused|connection error|fetch failed|network error|socket disconnected|terminated/i.test(message);
}
type DiscussionTurn={event_id:string;turn_seq:number;status:string;visible_content:string;pi_operation_id?:string|null};

export function discussionMessage(turn:DiscussionTurn,timestamp=Date.now()):AgentMessage{return createCustomMessage("piko.discussion",turn.visible_content,false,{event_id:turn.event_id},timestamp)}
export function initialPrompt(task:TaskRequest,turn?:DiscussionTurn,timestamp=Date.now()):AgentMessage|AgentMessage[]{const instruction:AgentMessage={role:"user",content:[{type:"text",text:task.instruction}],timestamp};return turn?[instruction,discussionMessage(turn,timestamp)]:instruction}
export function normalizeRawUsage(value:unknown){const raw=value as any,input=raw?.input_tokens_details,output=raw?.output_tokens_details;return {input:typeof raw?.input_tokens==="number"?raw.input_tokens:undefined,output:typeof raw?.output_tokens==="number"?raw.output_tokens:undefined,totalTokens:typeof raw?.total_tokens==="number"?raw.total_tokens:undefined,cacheRead:typeof input?.cached_tokens==="number"?input.cached_tokens:undefined,cacheWrite:typeof input?.cache_write_tokens==="number"?input.cache_write_tokens:undefined,reasoning:typeof output?.reasoning_tokens==="number"?output.reasoning_tokens:undefined}}

/** Build the full system prompt for a task with role/identity/memory injection.
 *  Role/identity/memory configuration comes from RuntimeConfig
 *  (loaded at startup), not from the task.  This function only
 *  appends what the task itself declares (std_templates). */
export function buildSystemPrompt(
  task:TaskRequest,
  identity?:{role:string;name:string;memory?:MemoryConfig;doc_search?:DocSearchConfig},
):string{
  const base="You are Piko, executing one durable task. Work only inside the configured workspace and pass workspace-relative paths to tools. Produce requested outputs and finish with a concise result summary.\n";
  if (!identity) return base;

  const parts:string[]=[
    `\n\nYou are acting as **${identity.role}**.`,
    `\nYour identity: ${identity.name}.`,
  ];

  if (identity.memory) {
    parts.push(
      `\nYou have access to two skill-experience tools (role-scoped external memory):\n` +
      `  - mem0_lookup(query): search past experience for this role in this project\n` +
      `  - mem0_record(content, tags?): record a lesson when you encounter a pitfall, ` +
      `surprising behavior, or repeated mistake\n` +
      `Use mem0_lookup when starting work that might have known pitfalls. ` +
      `Use mem0_record when you discover something worth remembering for next time. ` +
      `Skip routine successes.`,
    );
  }

  if (identity.doc_search) {
    parts.push(
      `\nYou have access to a document search tool (project-wide corpus):\n` +
      `  - graphrag_search(query, scope?, max_results?): search the project's ` +
      `design docs / STD corpus for relevant content\n` +
      `Use graphrag_search when you need to recall what the project's specs say ` +
      `before making changes, when verifying a design choice against the existing ` +
      `docs, or when asked about a topic that may be documented. Indexing is ` +
      `operator-managed; you can only search what is already indexed.`,
    );
  }

  return base + parts.join("") + "\n";
}

const finalText=async(lane:AgentLane)=>{
  const entries=await lane.findEntries({type:"message",order:"newestFirst"},BACKGROUND_CONTEXT);
  for(const entry of entries){
    if(entry.type!=="message"||entry.message.role!=="assistant")continue;
    const text=entry.message.content.filter((x:any)=>x.type==="text").map((x:any)=>x.text).join("\n").trim();
    if(text)return text;
  }
  return "Task completed without a textual final response.";
};

export class PiRuntime {
  private readonly repo:JsonlSessionRepo;
  private readonly mem0Adapter:Mem0Adapter|undefined;
  private readonly graphragAdapter:GraphRAGAdapter|undefined;
  constructor(private config:RuntimeConfig,private registry:ToolRegistry,private store:TaskStore,private channel:Channel,apiKey:string,mem0ApiKey?:string,graphragApiKey?:string){
    process.env.PIKO_LLM_API_KEY=apiKey;

    // V0.1: 启动时一次性构造 Mem0Adapter（对齐 LLM/Matrix token resolve 模式）
    if (config.identity?.memory && mem0ApiKey) {
      const baseUrl = config.identity.memory.base_url ?? "https://api.mem0.ai";
      this.mem0Adapter = new Mem0Adapter(baseUrl, mem0ApiKey);
    } else if (config.identity?.memory && !mem0ApiKey) {
      // 配了 memory 但缺 key → fail-fast（构造时即报错）
      throw new Error("mem0ApiKey required when identity.memory configured");
    } else {
      this.mem0Adapter = undefined;
    }

    // V0.1: 同模式构造 GraphRAGAdapter（项目级文档语料，与 memory 并列）
    if (config.identity?.doc_search && graphragApiKey) {
      this.graphragAdapter = new GraphRAGAdapter(
        config.identity.doc_search.base_url,
        graphragApiKey,
        config.identity.doc_search.default_scope,
      );
    } else if (config.identity?.doc_search && !graphragApiKey) {
      // 配了 doc_search 但缺 key → fail-fast
      throw new Error("graphragApiKey required when identity.doc_search configured");
    } else {
      this.graphragAdapter = undefined;
    }

    const root=Object.values(config.workspace.roots)[0]??process.cwd();
    this.repo=new JsonlSessionRepo({fileSystem:new DurableNodeExecutionEnv({cwd:root}),sessionsRoot:config.pi.session_root});

    // V0.1.1 (H2 fix): install per-instance network host policy wrapper
    // so `tool.profile.permissions.network_hosts` allowlist is enforced
    // at fetch time. Idempotent; restored in `close()` below.
    installNetworkPolicy();
  }
  private model(){
    const model:Model<"openai-responses">={id:this.config.agent.model,name:this.config.agent.model,api:"openai-responses",provider:"llmtier",baseUrl:this.config.llmtier.base_url,reasoning:true,input:["text","image"],cost:{input:0,output:0,cacheRead:0,cacheWrite:0},contextWindow:262144,maxTokens:32768};
    const provider=createProvider({id:"llmtier",name:"LLMTier",baseUrl:this.config.llmtier.base_url,auth:{apiKey:envApiKeyAuth("Piko LLMTier API key",["PIKO_LLM_API_KEY"])},models:[model],api:openAIResponsesApi()});
    const models=createModels();models.setProvider(provider);return {models,model};
  }
  async execute(runId:string,epoch:number,task:TaskRequest,workspace:string,isCancelled:()=>boolean,onDiscussionReply?:(event:string,turn:number,body:string)=>Promise<void>):Promise<PiExecution>{
    const fileSystem=new DurableNodeExecutionEnv({cwd:workspace});
    const existing=(await this.repo.list({cwd:workspace},BACKGROUND_CONTEXT)).find(x=>x.id===runId);
    const session=existing?await this.repo.open(existing,BACKGROUND_CONTEXT):await this.repo.create({cwd:workspace,id:runId},BACKGROUND_CONTEXT);
    const profile=this.registry.profiles[task.permissions.tool_profile_ref];
    if(!profile)throw new PikoError("UnknownToolProfile",422,`unknown tool profile ${task.permissions.tool_profile_ref}`);

    // V0.1: per-task skillDeps（Mem0Adapter 已在构造时缓存）
    let skillDeps:SkillToolDeps|undefined;
    if (this.config.identity?.memory && this.mem0Adapter) {
      skillDeps = {
        mem0: this.mem0Adapter,
        context: {
          role: this.config.identity.role,
          projectName: task.workspace_ref,
          taskId: task.task_id,
        },
      };
    }

    // V0.1: per-task docSearchDeps（GraphRAGAdapter 已在构造时缓存；与 skillDeps 并列）
    let docSearchDeps:DocSearchToolDeps|undefined;
    if (this.config.identity?.doc_search && this.graphragAdapter) {
      docSearchDeps = {
        graphrag: this.graphragAdapter,
        context: {
          role: this.config.identity.role,
          projectName: task.workspace_ref,
          taskId: task.task_id,
        },
      };
    }

    const available:Record<string,any>={read:createReadTool(),write:createWriteTool(),edit:createEditTool(),bash:createBashTool()};
    if (skillDeps) {
      available.mem0_lookup = createMem0LookupTool(skillDeps);
      available.mem0_record = createMem0RecordTool(skillDeps);
    }
    if (docSearchDeps) {
      available.graphrag_search = createGraphragSearchTool(docSearchDeps);
    }
    const tools=Object.entries(profile.tools).map(([name,policy])=>available[name]&&applyToolRecoveryPolicy(available[name],policy,this.registry)).filter(Boolean);
    const {models,model}=this.model();
    const identity=this.config.identity?{role:this.config.identity.role,name:this.config.identity.name,
      memory:this.config.identity.memory,doc_search:this.config.identity.doc_search}:undefined;
    const systemPrompt=buildSystemPrompt(task,identity);
    let active:{op:string;step:string;attempt:number}|undefined;let activeTurn:{event:string;seq:number}|undefined;let unsafeRetry=false;let toolFailure:string|undefined;let latestUsage:any=undefined;
    const created=await AgentHarness.create({session,models,model,tools,toolContext:{env:fileSystem},activeToolNames:tools.map((x:any)=>x.name),streamOptions:{maxRetries:0,timeoutMs:this.config.llmtier.models_timeout_ms,cacheRetention:"none"},retry:{enabled:true,maxRetries:2,baseDelayMs:1000},systemPrompt,onRawUsage:usage=>{if(active)void this.channel.report({kind:"observeUsage",task_id:runId,operation:active.op,step:active.step,attempt:active.attempt,raw:normalizeRawUsage(usage)});latestUsage=usage}},BACKGROUND_CONTEXT);
    const lane=await created.harness.lane("main",BACKGROUND_CONTEXT);
    created.harness.hooks.on("before_request",event=>{
      const step=event.stepId;active={op:event.runId,step,attempt:event.attempt};
      void this.channel.report({kind:"reserveModel",task_id:runId,operation:event.runId,step,attempt:event.attempt})
      return {streamOptions:{maxRetries:0,headers:{"X-Correlation-ID":runId}}};
    });
    const providerDebug=process.env.PIKO_PROVIDER_DEBUG==="1";
    const debugFile=process.env.PIKO_PROVIDER_DEBUG_FILE??`${this.config.pi.session_root}/provider-debug.jsonl`;
    const debugLine=(obj:Record<string,unknown>)=>{if(!providerDebug)return;try{appendFileSync(debugFile,JSON.stringify({ts:new Date().toISOString(),task_id:runId,...obj})+"\n")}catch{/* debug writes must not break execution */}};
    let payloadSentAt=0;
    created.harness.hooks.on("before_payload",event=>{payloadSentAt=Date.now();if(providerDebug){const payload=(event as {payload?:unknown}).payload;debugLine({kind:"request",model,bytes:JSON.stringify(payload??null).length})}return undefined;});
    created.harness.hooks.on("after_response",event=>{
      if(active)void this.channel.report({kind:"terminalModel",task_id:runId,operation:active.op,step:active.step,attempt:active.attempt,unknown:false});
      const ev=event as {runId?:string;status?:number;headers?:Record<string,string>};
      const requestId=ev.headers?.["x-request-id"]??ev.headers?.["X-Request-ID"]??null;
      const latencyMs=payloadSentAt?Date.now()-payloadSentAt:null;payloadSentAt=0;
      const note=latestUsage?.source==="injected"?"injected":"";latestUsage=undefined;try{void this.channel.report({kind:"providerCall",task_id:runId,operation:ev.runId??runId,status:ev.status??null,request_id:requestId,note,latency_ms:latencyMs})}catch{/* observability must not break execution */}
      debugLine({kind:"response",operation_id:ev.runId??runId,status:ev.status??null,request_id:requestId,latency_ms:latencyMs});
      return undefined;
    });
    created.harness.hooks.on("before_tool",async event=>{
      const policy=profile.tools[event.toolName];
      if(!policy){toolFailure=`tool ${event.toolName} is not enabled`;return {block:{reason:toolFailure,terminate:true}}}
      const path=typeof event.args.path==="string"?event.args.path:undefined;
      if(path){
        const write=event.toolName==="write"||event.toolName==="edit";
        const staging=resolve(this.config.workspace.staging_root,runId),candidate=resolve(path),rel=relative(staging,candidate),stagedRead=!write&&(rel===""||(!rel.startsWith(`..${sep}`)&&rel!==".."&&!rel.startsWith(sep)));
        if(!stagedRead)try{await authorizePath(workspace,path,write?task.permissions.write_paths:task.permissions.read_paths,write)}catch(error){toolFailure=error instanceof Error?error.message:String(error);return {block:{reason:toolFailure,terminate:true}}}
      }
      const admission=(await this.channel.report({kind:"reserveTool",task_id:runId,operation:event.runId,tool_call_id:event.toolCallId,name:event.toolName,effect:policy.effect,replay:policy.replay,contract:policy.recovery_contract_ref})).value as "Admitted"|"UnsafeRetryBlocked";
      if(admission==="UnsafeRetryBlocked"){unsafeRetry=true;return {block:{reason:"UnsafeRetryBlocked",terminate:true}}}return undefined;
    });
    created.harness.hooks.on("after_tool",event=>{void this.channel.report({kind:"terminalTool",task_id:runId,operation:event.runId,tool_call_id:event.toolCallId,unknown:false});return undefined});
    created.harness.events.on("tool_end",event=>{const recovered=(event as any).recovery===true;const interrupted=event.isError&&event.result.content.some((x:any)=>x.type==="text"&&typeof x.text==="string"&&x.text.includes("Tool execution was interrupted"));if(recovered&&interrupted){unsafeRetry=true;void this.channel.report({kind:"terminalTool",task_id:runId,operation:event.runId,tool_call_id:event.toolCallId,unknown:true})}});
    let operation=created.open.find(x=>x.lane==="main");let recoveredOutcome:any;
    const queuedTurn=this.store.pendingTurns(runId).find(x=>x.status==="QueuedInPi");
    if(queuedTurn){
      const turnOperation=queuedTurn.pi_operation_id??`${runId}:turn:${queuedTurn.turn_seq}`;
      if(operation?.operationId===turnOperation)activeTurn={event:queuedTurn.event_id,seq:queuedTurn.turn_seq};
      else if(!operation){
        const result=await lane.getResult(turnOperation,BACKGROUND_CONTEXT);
        if(result){operation={lane:"main",operationId:turnOperation,kind:"run",startedAt:result.startedAt};recoveredOutcome=result;activeTurn={event:queuedTurn.event_id,seq:queuedTurn.turn_seq}}
        else {const prompt=queuedTurn.turn_seq===1&&turnOperation===`${runId}:initial`?initialPrompt(task,queuedTurn):discussionMessage(queuedTurn);const accepted=await lane.accept({kind:"prompt",operationId:turnOperation,prompt},BACKGROUND_CONTEXT);if(!accepted.ok)throw accepted.error;operation={lane:"main",operationId:accepted.value.operationId,kind:"run",startedAt:accepted.value.startedAt};activeTurn={event:queuedTurn.event_id,seq:queuedTurn.turn_seq}}
      }
    }
    if(!operation){
      const initialId=`${runId}:initial`;const prior=await lane.getResult(initialId,BACKGROUND_CONTEXT);
      if(prior){operation={lane:"main",operationId:initialId,kind:"run",startedAt:prior.startedAt};recoveredOutcome=prior}
      else {const initialTurn=task.discussion?this.store.pendingTurns(runId).find(x=>x.turn_seq===1):undefined;if(initialTurn){void this.channel.report({kind:"turn",task_id:runId,event_id:initialTurn.event_id,status:"QueuedInPi",operation:initialId});activeTurn={event:initialTurn.event_id,seq:initialTurn.turn_seq}}const accepted=await lane.accept({kind:"prompt",operationId:initialId,prompt:initialPrompt(task,initialTurn)},BACKGROUND_CONTEXT);if(!accepted.ok)throw accepted.error;operation={lane:"main",operationId:accepted.value.operationId,kind:"run",startedAt:accepted.value.startedAt}}
    }
    const cancelTimer=setInterval(()=>{if(isCancelled())void lane.requestAbort(operation!.operationId,BACKGROUND_CONTEXT)},250);
    try{
      for(;;){
        let outcome=recoveredOutcome;recoveredOutcome=undefined;
        if(!outcome){const driven=await lane.drive({operationId:operation.operationId,waitForRetry:true,pollDeferred:true},BACKGROUND_CONTEXT);if(!driven.ok)throw driven.error;if(driven.value.kind==="waiting")continue;outcome=driven.value.outcome}
        if(activeTurn){const turn=activeTurn;if(outcome.status==="completed"&&onDiscussionReply)await onDiscussionReply(turn.event,turn.seq,await finalText(lane));void this.channel.report({kind:"turn",task_id:runId,event_id:turn.event,status:"Consumed",operation:operation.operationId});activeTurn=undefined}
        if(toolFailure)return {status:"failed",summary:toolFailure,failure:{code:"ToolFailure",cause_class:"Tool",message:toolFailure}};
        if(unsafeRetry)return {status:"failed",summary:"Unsafe tool replay was blocked.",failure:{code:"UnsafeRetryBlocked",cause_class:"ExecutionUnknown",message:"A non-replayable tool call was encountered again."}};
        if(outcome.status==="completed"){
          if(task.discussion){
            const pending=this.store.pendingTurns(runId);
            if(pending.length){
              const turn=pending[0];const nextId=`${runId}:turn:${turn.turn_seq}`;
              void this.channel.report({kind:"turn",task_id:runId,event_id:turn.event_id,status:"QueuedInPi",operation:nextId});
              const accepted=await lane.accept({kind:"prompt",operationId:nextId,prompt:discussionMessage(turn)},BACKGROUND_CONTEXT);
              if(!accepted.ok)throw accepted.error;
              operation={lane:"main",operationId:accepted.value.operationId,kind:"run",startedAt:accepted.value.startedAt};
              activeTurn={event:turn.event_id,seq:turn.turn_seq};
              continue;
            }
            if(!(await this.channel.report({kind:"closeIntake",task_id:runId,lease_epoch:epoch})).value)continue;
          }
          return {status:"completed",summary:await finalText(lane)};
        }
        if(outcome.status==="aborted")return {status:"cancelled",summary:"Execution cancelled.",failure:{code:"CancelledByRequest",cause_class:"Cancellation",message:"Cancellation was acknowledged by Pi."}};
        const message=outcome.error?.message??`Pi operation ${outcome.status}.`;
        const unavailable=outcome.error?.code==="model_unavailable"||isProviderUnavailableMessage(message);
        return {status:"failed",summary:message,failure:{code:unavailable?"ModelUnavailable":"ModelResponseInvalid",cause_class:unavailable?"Dependency":"ModelProtocol",message}};
      }
    } finally {clearInterval(cancelTimer);await created.harness.close(BACKGROUND_CONTEXT)}
  }
  async close(){
    await this.repo.close(BACKGROUND_CONTEXT);
    delete process.env.PIKO_LLM_API_KEY;
    // V0.1.1 (H2 fix): restore globalThis.fetch to the value prior to
    // this PiRuntime's installation. Idempotent.
    restoreNetworkPolicy();
  }
}
