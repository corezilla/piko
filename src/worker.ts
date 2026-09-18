import { randomUUID } from "node:crypto";
import type { RuntimeConfig, TokenUsage, AgentResult } from "./types.js";
import type { TaskStore } from "./store.js";
import type { PiRuntime } from "./pi-runtime.js";
import { collectOutputs, resolveWorkspace } from "./workspace.js";
import type { MatrixRuntime } from "./matrix.js";

const fields=["input_tokens","output_tokens","total_tokens","cache_read_tokens","cache_write_tokens","reasoning_tokens"] as const;
export function aggregateUsage(rows:any[],attempts:number):TokenUsage{
  if(attempts===0)return {source:"PiModelResponses",quality:"Complete",input_tokens:0,output_tokens:0,total_tokens:0,cache_read_tokens:0,cache_write_tokens:0,reasoning_tokens:0,model_attempts:0,usage_observed_attempts:0,missing_fields:[]};
  const map:any={input_tokens:"input",output_tokens:"output",total_tokens:"totalTokens",cache_read_tokens:"cacheRead",cache_write_tokens:"cacheWrite",reasoning_tokens:"reasoning"};
  const sums:any={};const missing:string[]=[];
  for(const field of fields){const key=map[field];if(rows.length!==attempts||rows.some(r=>typeof r[key]!=="number")) {sums[field]=null;missing.push(field)} else sums[field]=rows.reduce((n,r)=>n+r[key],0)}
  const observed=rows.length;const quality=missing.length===fields.length?"Unknown":missing.length===0&&observed===attempts?"Complete":"Partial";
  if(quality==="Unknown")for(const f of fields){sums[f]=null;if(!missing.includes(f))missing.push(f)}
  return {source:"PiModelResponses",quality,...sums,model_attempts:attempts,usage_observed_attempts:observed,missing_fields:missing};
}
export class RunWorker {
  private stopped=false;private loopPromise?:Promise<void>;private readonly owner=`worker-${randomUUID()}`;private readonly boot=randomUUID();
  private lastPurge=0;
  constructor(private config:RuntimeConfig,private store:TaskStore,private pi:PiRuntime,private matrix:MatrixRuntime){}
  start(){this.loopPromise=this.loop()}
  private async loop(){let recovery=this.store.recoverOrphaned(this.owner,this.boot);while(!this.stopped){if(Date.now()-this.lastPurge>3600000){this.store.purgeExpired();this.lastPurge=Date.now()}const claim=recovery??this.store.nextQueued(this.owner,this.boot);recovery=null;if(!claim){await new Promise(r=>setTimeout(r,200));continue}await this.run(claim.run_id,claim.lease_epoch)}}
  private async run(runId:string,epoch:number){
    const task=this.store.getTask(runId);let timer:NodeJS.Timeout|undefined;
    try{
      const workspace=await resolveWorkspace(task.workspace_ref,this.config.workspace.roots);
      timer=setInterval(()=>this.store.heartbeat(runId,epoch),1000);
      if(Date.parse(task.limits.deadline_at)<=Date.now())throw Object.assign(new Error("task deadline elapsed"),{pikoCode:"DeadlineExceeded",cause:"TaskDeadline"});
      const outcome=await this.pi.execute(runId,epoch,task,workspace,()=>this.store.cancelRequested(runId)||Date.parse(task.limits.deadline_at)<=Date.now(),task.discussion?async(event,turn,body)=>{await this.matrix.sendDiscussionReply(runId,task.discussion!.room_id,event,turn,body)}:undefined);
      const view=this.store.getRun(runId);const attempts=view.progress.model_calls;const usage=aggregateUsage(this.store.usage(runId),attempts);const outputs=await collectOutputs(task,workspace);const published_at=new Date().toISOString();
      const deadline=Date.parse(task.limits.deadline_at)<=Date.now()&&!this.store.cancelRequested(runId);
      const state=outcome.status==="completed"?"Completed":outcome.status==="cancelled"&&!deadline?"Cancelled":"Failed";
      const failure=state==="Completed"?null:deadline?{code:"DeadlineExceeded",cause_class:"TaskDeadline",message:"Task deadline elapsed."}:outcome.failure??{code:"InternalError",cause_class:"Internal",message:outcome.summary};
      this.store.finish({run_id:runId,task_id:task.task_id,generation:this.store.generation(runId),state,partial:state!=="Completed"&&outputs.length>0,summary:outcome.summary,outputs,known_actions:this.store.knownActions(runId),usage,failure,published_at} as AgentResult,epoch);
    }catch(error){
      const e=error as any;const published_at=new Date().toISOString();const cancelled=this.store.cancelRequested(runId);const budget=e.message==="ModelCallLimitExceeded"||e.message==="ToolCallLimitExceeded";const code=cancelled?"CancelledByRequest":budget?"BudgetExceeded":typeof e.pikoCode==="string"?e.pikoCode:"InternalError";const cause=cancelled?"Cancellation":budget?"Budget":typeof e.cause==="string"?e.cause:"Internal";
      const usage=aggregateUsage(this.store.usage(runId),this.store.getRun(runId).progress.model_calls);let outputs:AgentResult["outputs"]=[];try{outputs=await collectOutputs(task,await resolveWorkspace(task.workspace_ref,this.config.workspace.roots))}catch{/* preserve the primary failure */}
      try{this.store.finish({run_id:runId,task_id:task.task_id,generation:this.store.generation(runId),state:cancelled?"Cancelled":"Failed",partial:outputs.length>0,summary:e.message??String(e),outputs,known_actions:this.store.knownActions(runId),usage,failure:{code,cause_class:cause,message:e.message??String(e)},published_at} as AgentResult,epoch)}catch(finalize){console.error("run finalization failed",runId,finalize)}
    }finally{if(timer)clearInterval(timer)}
  }
  async close(){this.stopped=true;await this.loopPromise}
}
