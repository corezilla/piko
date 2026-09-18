import { describe,expect,it } from "vitest";
import { loadConfig } from "../../src/config.js";
import { TaskStore } from "../../src/store.js";
import { BearerAuth } from "../../src/auth.js";
import { MatrixRuntime } from "../../src/matrix.js";
import { ApiServer } from "../../src/server.js";

describe("HTTP task API",()=>{
  it("accepts, queries, cancels, and returns one stable result",async()=>{
    const {config}=await loadConfig("config/runtime.example.json");config.listen.port=20000+Math.floor(Math.random()*20000);
    const store=new TaskStore(":memory:",1000);const matrix=new MatrixRuntime(config,store);const server=await ApiServer.create(config,store,new BearerAuth("slinky",Buffer.from("test-token")),matrix);await server.listen();
    const headers={authorization:"Bearer test-token","content-type":"application/json"};const task={task_id:"http-task",instruction:"do it",workspace_ref:"piko",permissions:{read_paths:["src"],write_paths:["var"],tool_profile_ref:"workspace-standard"},limits:{deadline_at:new Date(Date.now()+60000).toISOString(),max_model_calls:2,max_tool_calls:2},output_paths:[]};
    try{
      const accepted=await fetch(`http://127.0.0.1:${config.listen.port}/runs`,{method:"POST",headers,body:JSON.stringify(task)});expect(accepted.status).toBe(202);const run:any=await accepted.json();
      expect((await fetch(`http://127.0.0.1:${config.listen.port}/runs/${run.run_id}`,{headers})).status).toBe(200);
      const cancelled=await fetch(`http://127.0.0.1:${config.listen.port}/runs/${run.run_id}:cancel`,{method:"POST",headers});expect(cancelled.status).toBe(200);
      const result=await fetch(`http://127.0.0.1:${config.listen.port}/runs/${run.run_id}/result`,{headers});expect(result.status).toBe(200);expect(await result.json()).toMatchObject({run_id:run.run_id,state:"Cancelled"});
    }finally{await server.close();store.close()}
  });
});
