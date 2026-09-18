import {afterEach,describe,expect,it} from "vitest";
import {mkdtemp,rm,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {loadConfig} from "../../src/config.js";
import {TaskStore} from "../../src/store.js";
import {RunWorker} from "../../src/worker.js";

describe("worker failure finalization",()=>{
  const temporary:string[]=[];
  afterEach(async()=>{for(const path of temporary.splice(0))await rm(path,{recursive:true,force:true})});

  it("publishes an output produced before an exception as partial",async()=>{
    const root=await mkdtemp(join(tmpdir(),"piko-partial-"));temporary.push(root);
    const {config}=await loadConfig("config/runtime.example.json");
    config.workspace.roots={test:root};config.workspace.staging_root=join(root,"staging");
    const store=new TaskStore(":memory:",1000);
    const task={task_id:"partial-output",instruction:"produce then fail",workspace_ref:"test",permissions:{read_paths:["partial.txt"],write_paths:["partial.txt"],tool_profile_ref:"workspace-standard"},limits:{deadline_at:new Date(Date.now()+60000).toISOString(),max_model_calls:1,max_tool_calls:1},output_paths:["partial.txt"]};
    const run=store.createOrGet(task,"slinky",10);
    const pi={execute:async()=>{await writeFile(join(root,"partial.txt"),"durable partial output\n");throw Object.assign(new Error("synthetic provider failure"),{pikoCode:"ModelUnavailable",cause:"Dependency"})}};
    const worker=new RunWorker(config,store,pi as any,{} as any);worker.start();
    try{
      for(let i=0;i<50&&!store.getRun(run.run_id).result_available;i++)await new Promise(resolve=>setTimeout(resolve,10));
      expect(store.result(run.run_id)).toMatchObject({state:"Failed",partial:true,outputs:[{path:"partial.txt",size_bytes:23}],failure:{code:"ModelUnavailable",cause_class:"Dependency"}});
    }finally{await worker.close();store.close()}
  });
});
