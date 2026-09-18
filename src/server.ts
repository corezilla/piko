import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import Ajv, {type ValidateFunction} from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import type { TaskRequest, RuntimeConfig } from "./types.js";
import { PikoError } from "./types.js";
import type { TaskStore } from "./store.js";
import type { BearerAuth } from "./auth.js";
import type { MatrixRuntime } from "./matrix.js";

async function body(req:IncomingMessage,max=2*1024*1024){let size=0;const chunks:Buffer[]=[];for await(const c of req){const b=Buffer.from(c);size+=b.length;if(size>max)throw new PikoError("InvalidRequest",400,"request body too large");chunks.push(b)}try{return JSON.parse(Buffer.concat(chunks).toString("utf8"))}catch{throw new PikoError("InvalidRequest",400,"invalid JSON body")}}
function send(res:ServerResponse,status:number,value:unknown,headers:Record<string,string>={}){const json=JSON.stringify(value);res.writeHead(status,{"content-type":"application/json; charset=utf-8","content-length":Buffer.byteLength(json),...headers});res.end(json)}

export class ApiServer {
  private server;private validateTask!:ValidateFunction;
  private constructor(private config:RuntimeConfig,private store:TaskStore,private auth:BearerAuth,private matrix:MatrixRuntime){this.server=createServer((req,res)=>void this.route(req,res))}
  static async create(config:RuntimeConfig,store:TaskStore,auth:BearerAuth,matrix:MatrixRuntime){const x=new ApiServer(config,store,auth,matrix);const schema=JSON.parse(await readFile(new URL("../interfaces/schemas/agent-runtime-v0.3.schema.json",import.meta.url),"utf8"));const AjvCtor:any=(Ajv as any).default??Ajv;const formats:any=(addFormats as any).default??addFormats;const ajv=new AjvCtor({strict:false,allErrors:true});formats(ajv);ajv.addSchema(schema);x.validateTask=ajv.getSchema(`${schema.$id}#/$defs/AgentTaskRequest`);if(!x.validateTask)throw new Error("task schema entrypoint not found");return x}
  private async route(req:IncomingMessage,res:ServerResponse){
    const requestId=typeof req.headers["x-request-id"]==="string"?req.headers["x-request-id"]:randomUUID();
    try{
      const principal=this.auth.authenticate(req.headers.authorization);
      const url=new URL(req.url??"/","http://localhost");
      if(req.method==="POST"&&url.pathname==="/runs"){
        const task=await body(req) as TaskRequest;if(!this.validateTask(task))throw new PikoError("InvalidRequest",400,this.validateTask.errors?.map(x=>`${x.instancePath} ${x.message}`).join("; ")??"invalid task");
        const existing=this.store.findExisting(task);if(existing)return send(res,202,existing);
        let trigger:string|undefined;if(task.discussion)trigger=await this.matrix.verifyDiscussion(task.discussion.room_id,task.discussion.trigger_event_id);
        return send(res,202,this.store.createOrGet(task,principal,this.config.queue.capacity,trigger));
      }
      const cancel=url.pathname.match(/^\/runs\/([^/]+):cancel$/);if(req.method==="POST"&&cancel){const run=decodeURIComponent(cancel[1]!);const receipt=this.store.cancel(run);return send(res,receipt.outcome==="StopRequested"?202:200,{run_id:run,...receipt})}
      const result=url.pathname.match(/^\/runs\/([^/]+)\/result$/);if(req.method==="GET"&&result)return send(res,200,this.store.result(decodeURIComponent(result[1]!)));
      const get=url.pathname.match(/^\/runs\/([^/]+)$/);if(req.method==="GET"&&get)return send(res,200,this.store.getRun(decodeURIComponent(get[1]!)));
      throw new PikoError("NotFound",404,"route not found");
    }catch(error){const e=error instanceof PikoError?error:new PikoError("DependencyUnavailable",503,error instanceof Error?error.message:String(error));const headers:Record<string,string>=e.status===429||e.status===503?{"retry-after":"5"}:{};send(res,e.status,{error:{code:e.code,message:e.message,request_id:requestId}},headers)}
  }
  async listen(){await new Promise<void>((resolve,reject)=>{this.server.once("error",reject);this.server.listen(this.config.listen.port,this.config.listen.host,()=>{this.server.off("error",reject);resolve()})})}
  async close(){await new Promise<void>((resolve,reject)=>this.server.close(e=>e?reject(e):resolve()))}
}
