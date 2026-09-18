import {afterEach,describe,expect,it} from "vitest";
import {MatrixRuntime} from "../../src/matrix.js";
import {TaskStore} from "../../src/store.js";
import type {RuntimeConfig,TaskRequest} from "../../src/types.js";

const stores:TaskStore[]=[];afterEach(()=>{for(const store of stores.splice(0))store.close()});
const config={instance_id:"piko-test",matrix:{enabled:false}} as RuntimeConfig;
const task:TaskRequest={task_id:"t",instruction:"x",workspace_ref:"repo",permissions:{read_paths:[],write_paths:[],tool_profile_ref:"workspace-standard"},limits:{deadline_at:new Date(Date.now()+60000).toISOString(),max_model_calls:1,max_tool_calls:1},output_paths:[],discussion:{room_id:"!room:test",trigger_event_id:"$event"}};

class FakeMatrix extends MatrixRuntime{
  calls:{room:string;txn:string;body:string;reply?:string}[]=[];fail=true;
  override async send(room:string,txn:string,body:string,reply?:string){this.calls.push({room,txn,body,...(reply?{reply}:{})});if(this.fail){this.fail=false;throw new Error("uncertain send")}return {event_id:"$reply"} as any}
}

describe("Matrix stable sends",()=>{
  it("reuses one transaction id after an uncertain send and suppresses a sent retry",async()=>{const store=new TaskStore(":memory:",1000);stores.push(store);const run=store.createOrGet(task,"slinky",10,"trigger");const matrix=new FakeMatrix(config,store);await expect(matrix.sendDiscussionReply(run.run_id,"!room:test","$event",1,"answer")).rejects.toThrow(/uncertain/);await expect(matrix.sendDiscussionReply(run.run_id,"!room:test","$event",1,"answer")).resolves.toBe("$reply");await expect(matrix.sendDiscussionReply(run.run_id,"!room:test","$event",1,"answer")).resolves.toBe("$reply");expect(matrix.calls).toHaveLength(2);expect(matrix.calls[0]).toEqual(matrix.calls[1]);expect(matrix.calls[0]?.reply).toBe("$event")});
});
