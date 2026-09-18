import { open } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { NodeExecutionEnv } from "../upstream/pi/packages/agent/src/harness/env/nodejs.ts";
import type { Context } from "../upstream/pi/packages/agent/src/harness/context.ts";

/** Pi's JSONL session writes, strengthened with fsync before success is exposed. */
export class DurableNodeExecutionEnv extends NodeExecutionEnv {
  private absolute(path:string){return isAbsolute(path)?resolve(path):resolve(this.cwd,path)}
  private async sync(path:string, directory=false){
    const handle=await open(directory?dirname(this.absolute(path)):this.absolute(path),"r");
    try{await handle.sync()}finally{await handle.close()}
  }
  override async writeFile(path:string,content:string|Uint8Array,context:Context){
    const result=await super.writeFile(path,content,context);
    if(result.ok){await this.sync(path);await this.sync(path,true)}
    return result;
  }
  override async appendFile(path:string,content:string|Uint8Array,context:Context){
    const result=await super.appendFile(path,content,context);
    if(result.ok)await this.sync(path);
    return result;
  }
  override async renameFile(source:string,destination:string,context:Context){
    const result=await super.renameFile(source,destination,context);
    if(result.ok){await this.sync(destination);await this.sync(destination,true)}
    return result;
  }
}
