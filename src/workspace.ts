import { realpath, stat } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import type { TaskRequest } from "./types.js";
import { PikoError } from "./types.js";

const inside=(root:string,path:string)=>{const r=relative(root,path);return r===""||(!r.startsWith(`..${sep}`)&&r!==".."&&!r.startsWith(sep))};
export async function resolveWorkspace(ref:string,roots:Record<string,string>):Promise<string>{
  const configured=roots[ref]; if(!configured)throw new PikoError("InvalidWorkspace",422,`unknown workspace_ref: ${ref}`);
  return realpath(configured);
}
export async function authorizePath(workspace:string,input:string,allowed:string[],write=false):Promise<string>{
  const candidate=resolve(workspace,input);
  if(!inside(workspace,candidate))throw new PikoError("ScopeDenied",403,"path escapes workspace");
  let checked:string;
  try{checked=await realpath(write?dirname(candidate):candidate)}catch{checked=await realpath(dirname(candidate))}
  const target=write?resolve(checked,candidate.split(sep).at(-1)!):checked;
  const roots=await Promise.all(allowed.map(p=>realpath(resolve(workspace,p)).catch(()=>resolve(workspace,p))));
  if(!roots.some(root=>inside(root,target)))throw new PikoError("ScopeDenied",403,"path is outside task permissions");
  return target;
}
export async function collectOutputs(task:TaskRequest,workspace:string){
  const out=[] as {path:string;sha256:string;size_bytes:number}[];
  for(const p of task.output_paths){
    try{const absolute=await authorizePath(workspace,p,[...task.permissions.read_paths,...task.permissions.write_paths]);const s=await stat(absolute);if(!s.isFile())continue;const data=await readFile(absolute);out.push({path:p,sha256:createHash("sha256").update(data).digest("hex"),size_bytes:data.byteLength})}catch{/* absent output is not fabricated */}
  }
  return out;
}
