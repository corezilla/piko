import { createClient, ClientEvent, RoomEvent, type MatrixClient, type MatrixEvent } from "matrix-js-sdk";
import { createHash } from "node:crypto";
import { mkdir,rename,writeFile } from "node:fs/promises";
import { basename,join } from "node:path";
import type { RuntimeConfig } from "./types.js";
import type { TaskStore } from "./store.js";

/** Native Matrix Client-Server discussion intake; it never creates a Piko task. */
export class MatrixRuntime {
  private client?:MatrixClient;
  private started=false;
  private pendingEvents:MatrixEvent[]=[];
  private syncWork:Promise<void>=Promise.resolve();
  constructor(private config:RuntimeConfig,private store:TaskStore,private token?:string){}
  async start(){
    if(!this.config.matrix.enabled)return;
    this.client=createClient({baseUrl:this.config.matrix.homeserver!,accessToken:this.token!,userId:this.config.matrix.user_id!});
    const who=await this.client.whoami();if(who.user_id!==this.config.matrix.user_id)throw new Error("Matrix credential identity mismatch");
    const cursor=this.store.matrixCursor();if(cursor)this.client.store.setSyncToken(cursor);
    this.client.on(RoomEvent.Timeline,(event:MatrixEvent)=>{this.pendingEvents.push(event)});
    let readyResolve!:()=>void,readyReject!:(error:unknown)=>void;const ready=new Promise<void>((resolve,reject)=>{readyResolve=resolve;readyReject=reject});let readySettled=false;
    this.client.on(ClientEvent.Sync,(state)=>{if(state!=="PREPARED"&&state!=="SYNCING")return;const next=this.client?.getSyncStateData()?.nextSyncToken;if(!next)return;const batch=this.pendingEvents.splice(0);this.syncWork=this.syncWork.then(()=>this.processBatch(batch,next));this.syncWork.then(()=>{if(!readySettled){readySettled=true;readyResolve()}},error=>{console.error("Matrix sync batch rejected",error);const permanent=isPermanentMatrixError(error);if(!readySettled||permanent){this.client?.stopClient()}if(!readySettled){readySettled=true;readyReject(error)}})});
    await this.client.startClient({initialSyncLimit:20,pollTimeout:this.config.matrix.sync_timeout_ms??30000});
    const timer=setTimeout(()=>{if(!readySettled){readySettled=true;readyReject(new Error("Matrix initial sync timeout"))}},60000);try{await ready}finally{clearTimeout(timer)}
    this.started=true;
  }
  private async prepareEvent(event:MatrixEvent){
    if(event.getType()!=="m.room.message")return undefined;
    const room=event.getRoomId(),id=event.getId();if(!room||!id)return;
    const sender=event.getSender()??"",txn=event.getUnsigned()?.transaction_id;
    if(sender===this.config.matrix.user_id)return {room,event:id,sender,txn,turns:[]};
    const content=event.getContent();if(typeof content.msgtype!=="string"||!["m.text","m.file","m.image","m.audio","m.video"].includes(content.msgtype)||typeof content.body!=="string")return;
    if(this.store.hasMatrixEvent(room,id))return undefined;const turns:{run:string;visible:string}[]=[];
    for(const run of this.store.openDiscussionRuns(room)){
      let visible=content.body;
      if(content.msgtype!=="m.text")visible+=`\n${await this.downloadMedia(run,id,content)}`;
      turns.push({run,visible});
    }
    return {room,event:id,sender,txn,turns};
  }
  private async processBatch(events:MatrixEvent[],cursor:string){
    const rooms=new Set(events.map(event=>event.getRoomId()).filter((room):room is string=>!!room&&this.store.openDiscussionRuns(room).length>0));
    if(rooms.size){const joined=new Set((await this.client!.getJoinedRooms()).joined_rooms);for(const room of rooms)if(!joined.has(room)){this.store.markDiscussionAccessLost(room);throw new Error(`Piko is no longer joined to discussion room ${room}`)}}
    const prepared=[];for(const event of events){const item=await this.prepareEvent(event);if(item)prepared.push(item)}
    this.store.ingestMatrixBatch(prepared,cursor);
  }
  private async downloadMedia(run:string,event:string,content:any){
    if(!this.client||typeof content.url!=="string"||!content.url.startsWith("mxc://"))throw new Error("invalid Matrix media URL");
    const declaredSize=content.info?.size;if(typeof declaredSize!=="number"||declaredSize<0||declaredSize>(this.config.matrix.max_media_bytes??0))throw new Error("Matrix media size is not allowed");
    const declaredMime=content.info?.mimetype;if(typeof declaredMime!=="string"||!this.config.matrix.allowed_mime_types?.includes(declaredMime))throw new Error("Matrix media MIME is not allowed");
    const url=this.client.mxcUrlToHttp(content.url,undefined,undefined,undefined,false,true,true);if(!url)throw new Error("cannot resolve Matrix media URL");
    const response=await fetch(url,{headers:{authorization:`Bearer ${this.token}`}});if(!response.ok||!response.body)throw new Error(`Matrix media download failed: ${response.status}`);
    const actualMime=response.headers.get("content-type")?.split(";",1)[0];if(actualMime!==declaredMime)throw new Error("Matrix media MIME mismatch");
    const reader=response.body.getReader(),chunks:Uint8Array[]=[];let size=0;for(;;){const x=await reader.read();if(x.done)break;size+=x.value.byteLength;if(size>(this.config.matrix.max_media_bytes??0))throw new Error("Matrix media exceeds limit");chunks.push(x.value)}if(size!==declaredSize)throw new Error("Matrix media size mismatch");
    const directory=join(this.config.workspace.staging_root,run);await mkdir(directory,{recursive:true,mode:0o700});const safe=basename(content.body).replace(/[^A-Za-z0-9._-]/g,"_")||"attachment";const target=join(directory,`${event.replace(/[^A-Za-z0-9._-]/g,"_")}-${safe}`),temp=`${target}.tmp`;const data=Buffer.concat(chunks.map(x=>Buffer.from(x)));await writeFile(temp,data,{mode:0o600});await rename(temp,target);return `[Matrix attachment: ${target} (${actualMime}, ${size} bytes)]`;
  }
  async verifyDiscussion(room:string,event:string){
    if(!this.client||!this.started)throw new Error("Matrix is not ready");
    const joined=(await this.client.getJoinedRooms()).joined_rooms;if(!joined.includes(room))throw new Error("Piko is not joined to discussion room");
    const e=await this.client.fetchRoomEvent(room,event);if(e.room_id!==room)throw new Error("discussion trigger is not in the requested room");
    return typeof e.content?.body==="string"?e.content.body:"";
  }
  async send(room:string,txnId:string,body:string,replyTo?:string){
    if(!this.client)throw new Error("Matrix disabled");
    const content:any={msgtype:"m.text",body};
    if(replyTo)content["m.relates_to"]={"m.in_reply_to":{event_id:replyTo}};
    return this.client.sendEvent(room,"m.room.message",content,txnId);
  }
  async sendDiscussionReply(run:string,room:string,event:string,turn:number,body:string){
    const txn=`${this.config.instance_id}:${run}:turn:${turn}:assistant`;const sha=createHash("sha256").update(JSON.stringify({room,event,body})).digest("hex");const prepared=this.store.prepareMatrixSend(txn,run,turn,sha);if(prepared.state==="Sent")return prepared.event_id;
    try{const result=await this.send(room,txn,body,event);this.store.finishMatrixSend(txn,result.event_id);return result.event_id}catch(error){this.store.unknownMatrixSend(txn);throw error}
  }
  async close(){if(this.client){this.client.stopClient();this.client.removeAllListeners()}this.started=false}
}

export function isPermanentMatrixError(error:unknown):boolean{
  if(!error||typeof error!=="object")return false;
  const e=error as {errcode?:string;message?:string;httpStatus?:number;data?:{errcode?:string}};
  const code=e.errcode??e.data?.errcode;
  if(code==="M_UNKNOWN_TOKEN"||code==="M_FORBIDDEN"||code==="M_UNKNOWN_ROOM"||code==="M_BAD_JSON")return true;
  if(typeof e.httpStatus==="number"&&e.httpStatus>=400&&e.httpStatus<500&&e.httpStatus!==408&&e.httpStatus!==429)return true;
  const msg=String(e.message??"");
  if(/credential identity mismatch|no longer joined/i.test(msg))return true;
  return false;
}
