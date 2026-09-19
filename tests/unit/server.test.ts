import {afterEach,describe,expect,it} from "vitest";
import {loadConfig} from "../../src/config.js";
import {TaskStore} from "../../src/store.js";
import {BearerAuth} from "../../src/auth.js";
import {ApiServer} from "../../src/server.js";

const cleanups:(()=>Promise<void>)[]=[];
afterEach(async()=>{for(const cleanup of cleanups.splice(0).reverse())await cleanup()});

const task=(id="unit-http")=>({task_id:id,instruction:"do it",workspace_ref:"piko",permissions:{read_paths:["src"],write_paths:["var"],tool_profile_ref:"workspace-standard"},limits:{deadline_at:new Date(Date.now()+60000).toISOString(),max_model_calls:2,max_tool_calls:2},output_paths:[]});

async function fixture(capacity=10,matrix:any={verifyDiscussion:async()=>"trigger"}){
  const {config}=await loadConfig("config/runtime.example.json");config.listen.port=20000+Math.floor(Math.random()*20000);config.queue.capacity=capacity;
  const store=new TaskStore(":memory:",1000);const server=await ApiServer.create(config,store,new BearerAuth("slinky",Buffer.from("token")),matrix);await server.listen();
  cleanups.push(async()=>{await server.close();store.close()});return {base:`http://127.0.0.1:${config.listen.port}`,store};
}

describe("HTTP API failure boundaries",()=>{
  it("rejects missing and wrong bearer credentials while preserving a supplied request id",async()=>{const {base}=await fixture();for(const authorization of [undefined,"Basic token","Bearer wrong"]){const headers:Record<string,string>={"x-request-id":"req-auth"};if(authorization)headers.authorization=authorization;const response=await fetch(`${base}/runs/missing`,{headers});expect(response.status).toBe(401);expect(await response.json()).toEqual({error:{code:"Unauthorized",message:expect.any(String),request_id:"req-auth"}})}});
  it("rejects invalid JSON, unknown fields, and an external model selector",async()=>{const {base}=await fixture();const headers={authorization:"Bearer token","content-type":"application/json"};let response=await fetch(`${base}/runs`,{method:"POST",headers,body:"{"});expect(response.status).toBe(400);expect(await response.json()).toMatchObject({error:{code:"InvalidRequest"}});for(const extra of [{unknown:true},{model:"forbidden"}]){response=await fetch(`${base}/runs`,{method:"POST",headers,body:JSON.stringify({...task(),...extra})});expect(response.status).toBe(400);expect(await response.json()).toMatchObject({error:{code:"InvalidRequest"}})}});
  it("returns the original Run, rejects a changed definition, and withholds a nonterminal Result",async()=>{const {base}=await fixture();const headers={authorization:"Bearer token","content-type":"application/json"};const submit=async(body:any)=>fetch(`${base}/runs`,{method:"POST",headers,body:JSON.stringify(body)});const definition=task();const first=await submit(definition);const accepted:any=await first.json();const repeat:any=await (await submit(definition)).json();expect(repeat.run_id).toBe(accepted.run_id);const conflict=await submit({...definition,instruction:"changed"});expect(conflict.status).toBe(409);expect(await conflict.json()).toMatchObject({error:{code:"TaskConflict"}});const result=await fetch(`${base}/runs/${accepted.run_id}/result`,{headers});expect(result.status).toBe(409);expect(await result.json()).toMatchObject({error:{code:"RunNotTerminal"}})});
  it("marks admission and dependency failures retryable",async()=>{let x=await fixture(1);const headers={authorization:"Bearer token","content-type":"application/json"};await fetch(`${x.base}/runs`,{method:"POST",headers,body:JSON.stringify(task("queued"))});let response=await fetch(`${x.base}/runs`,{method:"POST",headers,body:JSON.stringify(task("overflow"))});expect(response.status).toBe(429);expect(response.headers.get("retry-after")).toBe("5");expect(await response.json()).toMatchObject({error:{code:"QueueFull"}});x=await fixture(10,{verifyDiscussion:async()=>{throw new Error("homeserver offline")}});response=await fetch(`${x.base}/runs`,{method:"POST",headers,body:JSON.stringify({...task("discussion"),discussion:{room_id:"!room:test",trigger_event_id:"$event"}})});expect(response.status).toBe(503);expect(response.headers.get("retry-after")).toBe("5");expect(await response.json()).toMatchObject({error:{code:"DependencyUnavailable"}})});
});
