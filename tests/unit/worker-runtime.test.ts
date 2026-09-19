import {afterEach,describe,expect,it} from "vitest";
import {mkdtemp,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {TaskStore} from "../../src/store.js";
import {RunWorker} from "../../src/worker.js";
import type {RuntimeConfig,TaskRequest} from "../../src/types.js";

const stores:TaskStore[]=[];const roots:string[]=[];
afterEach(async()=>{for(const store of stores.splice(0))store.close();for(const root of roots.splice(0))await rm(root,{recursive:true,force:true})});
const task=(id:string,root:string):TaskRequest=>({task_id:id,instruction:"run",workspace_ref:"test",permissions:{read_paths:[],write_paths:[],tool_profile_ref:"workspace-standard"},limits:{deadline_at:new Date(Date.now()+60000).toISOString(),max_model_calls:1,max_tool_calls:1},output_paths:[]});
async function fixture(id:string,execute:any){const root=await mkdtemp(join(tmpdir(),"piko-worker-"));roots.push(root);const store=new TaskStore(":memory:",1000);stores.push(store);const definition=task(id,root);const view=store.createOrGet(definition,"slinky",10);const claim=store.nextQueued("worker","boot")!;const config={workspace:{roots:{test:root},staging_root:join(root,"staging")}} as unknown as RuntimeConfig;const worker=new RunWorker(config,store,{execute} as any,{} as any);return {store,view,claim,worker,definition}};

describe("worker terminal failure semantics",()=>{
  it("does not call Pi when the durable task deadline has elapsed",async()=>{let calls=0;const x=await fixture("deadline",async()=>{calls++;return {status:"completed",summary:"bad"}});x.definition.limits.deadline_at=new Date(Date.now()-1000).toISOString();x.store.db.prepare("UPDATE tasks SET task_json=? WHERE run_id=?").run(JSON.stringify(x.definition),x.view.run_id);await (x.worker as any).run(x.view.run_id,x.claim.lease_epoch);expect(calls).toBe(0);expect(x.store.result(x.view.run_id)).toMatchObject({state:"Failed",failure:{code:"DeadlineExceeded",cause_class:"TaskDeadline"}})});
  it("gives an accepted cancellation precedence over a concurrent execution error",async()=>{const x=await fixture("cancel",async()=>{throw Object.assign(new Error("provider failed"),{pikoCode:"ModelUnavailable",cause:"Dependency"})});expect(x.store.cancel(x.view.run_id).outcome).toBe("StopRequested");await (x.worker as any).run(x.view.run_id,x.claim.lease_epoch);expect(x.store.result(x.view.run_id)).toMatchObject({state:"Cancelled",failure:{code:"CancelledByRequest",cause_class:"Cancellation"}})});
  it("maps a non-string Error.cause to the legal Internal cause class",async()=>{const x=await fixture("cause",async()=>{throw Object.assign(new Error("boom"),{cause:{nested:true}})});await (x.worker as any).run(x.view.run_id,x.claim.lease_epoch);expect(x.store.result(x.view.run_id)).toMatchObject({state:"Failed",failure:{code:"InternalError",cause_class:"Internal",message:"boom"}})});
});
