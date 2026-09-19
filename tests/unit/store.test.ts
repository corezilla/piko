import { afterEach,describe,expect,it } from "vitest";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TaskStore } from "../../src/store.js";
import type { TaskRequest } from "../../src/types.js";

const stores:TaskStore[]=[];
const tempRoots:string[]=[];
const make=()=>{const s=new TaskStore(":memory:",1000);stores.push(s);return s};
const task=(id="task-1"):TaskRequest=>({task_id:id,instruction:"do it",workspace_ref:"repo",permissions:{read_paths:["src"],write_paths:["out"],tool_profile_ref:"workspace-standard"},limits:{deadline_at:new Date(Date.now()+60000).toISOString(),max_model_calls:2,max_tool_calls:2},output_paths:[]});
const discussionTask=(id="discussion-1"):TaskRequest=>({...task(id),discussion:{room_id:"!room:test",trigger_event_id:"$trigger"}});
afterEach(()=>{for(const s of stores.splice(0))s.close();for(const root of tempRoots.splice(0))rmSync(root,{recursive:true,force:true})});

describe("TaskStore",()=>{
  it("creates a missing parent directory for a file-backed database",()=>{const root=mkdtempSync(join(tmpdir(),"piko-store-"));tempRoots.push(root);const path=join(root,"nested","task.sqlite");const s=new TaskStore(path,1000);stores.push(s);expect(existsSync(path)).toBe(true)});
  it("returns one run for the same task_id and rejects a conflicting definition",()=>{const s=make(),a=task();const first=s.createOrGet(a,"slinky",10);expect(s.createOrGet(a,"slinky",10).run_id).toBe(first.run_id);expect(()=>s.createOrGet({...a,instruction:"other"},"slinky",10)).toThrowError(/different definition/)});
  it("acquires the singleton slot and fences finalization",()=>{const s=make(),view=s.createOrGet(task(),"slinky",10);const claim=s.nextQueued("w","b")!;expect(claim.run_id).toBe(view.run_id);expect(s.nextQueued("w2","b2")).toBeNull();expect(()=>s.finish({run_id:view.run_id,task_id:view.task_id,generation:1,state:"Completed",partial:false,summary:"ok",outputs:[],known_actions:[],usage:{source:"PiModelResponses",quality:"Complete",input_tokens:0,output_tokens:0,total_tokens:0,cache_read_tokens:0,cache_write_tokens:0,reasoning_tokens:0,model_attempts:0,usage_observed_attempts:0,missing_fields:[]},failure:null,published_at:new Date().toISOString()},claim.lease_epoch+1)).toThrowError(/lease/)});
  it("cancels queued work atomically with a stable result",()=>{const s=make(),view=s.createOrGet(task(),"slinky",10);expect(s.cancel(view.run_id).outcome).toBe("CancelledBeforeStart");expect(s.result(view.run_id).state).toBe("Cancelled")});
  it("keeps a permanent Gone tombstone after detailed records are purged",()=>{const s=make(),definition=task("purged-task"),view=s.createOrGet(definition,"slinky",10);s.cancel(view.run_id);expect(s.purgeExpired(new Date(Date.now()+8*864e5).toISOString())).toBe(1);expect(()=>s.findExisting(definition)).toThrowError(/purged/);expect(()=>s.createOrGet(definition,"slinky",10)).toThrowError(/purged/)});
  it("counts each admitted provider and tool effect once",()=>{const s=make(),view=s.createOrGet(task(),"slinky",10);expect(s.reserveModel(view.run_id,"op","step",1)).toBe(true);expect(s.reserveModel(view.run_id,"op","step",1)).toBe(true);expect(s.reserveTool(view.run_id,"op","call","read","read_only","safe")).toBe("Admitted");expect(s.reserveTool(view.run_id,"op","call","read","read_only","safe")).toBe("Admitted");expect(s.getRun(view.run_id).progress).toMatchObject({model_calls:1,tool_calls:1})});
  it("fails closed when a never-replay tool effect is encountered again",()=>{const s=make(),view=s.createOrGet(task(),"slinky",10);expect(s.reserveTool(view.run_id,"op","call","external","external","never")).toBe("Admitted");expect(s.reserveTool(view.run_id,"op","call","external","external","never")).toBe("UnsafeRetryBlocked")});
  it("freezes the published result when usage arrives late",()=>{
    const s=make(),view=s.createOrGet(task(),"slinky",10),claim=s.nextQueued("w","b")!;
    expect(s.reserveModel(view.run_id,"op","step",1)).toBe(true);
    s.observeUsage(view.run_id,"op","step",1,{input:10,output:5,totalTokens:15,cacheRead:0,cacheWrite:0,reasoning:0});s.terminalModel(view.run_id,"op","step",1);
    const published={source:"PiModelResponses" as const,quality:"Complete" as const,input_tokens:10,output_tokens:5,total_tokens:15,cache_read_tokens:0,cache_write_tokens:0,reasoning_tokens:0,model_attempts:1,usage_observed_attempts:1,missing_fields:[]};
    s.finish({run_id:view.run_id,task_id:view.task_id,generation:1,state:"Completed",partial:false,summary:"ok",outputs:[],known_actions:[],usage:published,failure:null,published_at:new Date().toISOString()},claim.lease_epoch);
    const before=JSON.stringify(s.result(view.run_id));
    s.observeUsage(view.run_id,"op","step",1,{input:20,output:10,totalTokens:30,cacheRead:0,cacheWrite:0,reasoning:0});
    expect(JSON.stringify(s.result(view.run_id))).toBe(before);
    expect(s.usage(view.run_id)).toEqual([{input:20,output:10,totalTokens:30,cacheRead:0,cacheWrite:0,reasoning:0}]);
  });
  it("upgrades pre-raw-hook Pi usage to cache-inclusive input",()=>{const s=make(),view=s.createOrGet(task(),"slinky",10);s.reserveModel(view.run_id,"op","step",1);s.observeUsage(view.run_id,"op","step",1,{input:1580,output:35,totalTokens:5711,cacheRead:4096,cacheWrite:0,reasoning:7,cost:{}});expect(s.usage(view.run_id)[0]).toMatchObject({input:5676,output:35,totalTokens:5711,cacheRead:4096})});
  it("serializes Matrix ingestion against Open to Closing and advances the cursor atomically",()=>{
    const s=make(),view=s.createOrGet(discussionTask(),"slinky",10,"trigger body"),claim=s.nextQueued("w","b")!;s.markTurn(view.run_id,"$trigger","Consumed");
    s.ingestMatrixBatch([{room:"!room:test",event:"$before",sender:"@user:test",turns:[{run:view.run_id,visible:"before"}]}],"cursor-1");
    expect(s.matrixCursor()).toBe("cursor-1");expect(s.tryCloseIntake(view.run_id,claim.lease_epoch)).toBe(false);
    s.markTurn(view.run_id,"$before","Consumed");expect(s.tryCloseIntake(view.run_id,claim.lease_epoch)).toBe(true);expect(s.tryCloseIntake(view.run_id,claim.lease_epoch)).toBe(true);
    s.ingestMatrixBatch([{room:"!room:test",event:"$after",sender:"@user:test",turns:[{run:view.run_id,visible:"after"}]}],"cursor-2");
    expect(s.matrixCursor()).toBe("cursor-2");expect(s.pendingTurns(view.run_id)).toHaveLength(0);expect(s.hasMatrixEvent("!room:test","$after")).toBe(true);
  });
  it("does not complete a discussion before Closing and abandons turns on terminal failure",()=>{
    const s=make(),view=s.createOrGet(discussionTask(),"slinky",10,"trigger body"),claim=s.nextQueued("w","b")!;const base={run_id:view.run_id,task_id:view.task_id,generation:1,partial:false,summary:"x",outputs:[],known_actions:[],usage:{source:"PiModelResponses" as const,quality:"Complete" as const,input_tokens:0,output_tokens:0,total_tokens:0,cache_read_tokens:0,cache_write_tokens:0,reasoning_tokens:0,model_attempts:0,usage_observed_attempts:0,missing_fields:[]},published_at:new Date().toISOString()};
    expect(()=>s.finish({...base,state:"Completed",failure:null},claim.lease_epoch)).toThrow(/intake closes/);
    s.finish({...base,state:"Failed",failure:{code:"InternalError",cause_class:"Internal",message:"x"}},claim.lease_epoch);
    expect(s.db.prepare("SELECT status FROM discussion_turns WHERE run_id=?").all(view.run_id)).toEqual([{status:"Abandoned"}]);
  });
  it("abandons the trigger turn when a queued discussion is cancelled",()=>{const s=make(),view=s.createOrGet(discussionTask(),"slinky",10,"trigger");s.cancel(view.run_id);expect(s.db.prepare("SELECT status FROM discussion_turns WHERE run_id=?").get(view.run_id)).toEqual({status:"Abandoned"})});
  it("keeps Closing idempotent for the same recovered lease",()=>{const s=make(),view=s.createOrGet(discussionTask(),"slinky",10,"trigger"),claim=s.nextQueued("w","b")!;s.markTurn(view.run_id,"$trigger","Consumed");expect(s.tryCloseIntake(view.run_id,claim.lease_epoch)).toBe(true);expect(s.tryCloseIntake(view.run_id,claim.lease_epoch)).toBe(true);expect(s.db.prepare("SELECT discussion_intake_state FROM runs WHERE run_id=?").get(view.run_id)).toEqual({discussion_intake_state:"Closing"})});
});
