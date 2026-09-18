import { mkdtemp,readFile,rm,writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach,describe,expect,it } from "vitest";
import { BACKGROUND_CONTEXT } from "../../upstream/pi/packages/agent/src/harness/context.ts";
import { createEditTool,createReadTool,createWriteTool } from "../../upstream/pi/packages/agent/src/harness/tools/index.ts";
import type { AgentHarnessToolInvocation } from "../../upstream/pi/packages/agent/src/harness/types.ts";
import type { JsonValue } from "../../upstream/pi/packages/agent/src/harness/session/types.ts";
import { DurableNodeExecutionEnv } from "../../src/durable-fs.js";
import { applyToolRecoveryPolicy } from "../../src/tool-recovery.js";
import type { ToolPolicy,ToolRegistry } from "../../src/config.js";

const roots:string[]=[];
afterEach(async()=>{await Promise.all(roots.splice(0).map(path=>rm(path,{recursive:true,force:true})))});
const registry:ToolRegistry={profile_version:"0.3",recovery_contracts:{atomic:{kind:"stable_deduplication",implementation_ref:"builtin:workspace-atomic-write"}},profiles:{}};
const policy:ToolPolicy={effect:"workspace_write",replay:"safe",recovery_contract_ref:"atomic",permissions:{write_paths:[]}};
function invocation(){const memos=new Map<string,JsonValue>();return {memos,value:{invocationId:"i",operationId:"o",turnId:"t",getMemo:async name=>memos.get(name),setMemo:async(name,value)=>{if(value===undefined)memos.delete(name);else memos.set(name,value)}} satisfies AgentHarnessToolInvocation}}

describe("workspace write recovery",()=>{
  it("propagates safe replay to read-only tools",()=>{expect(applyToolRecoveryPolicy(createReadTool(),{effect:"read_only",replay:"safe",permissions:{read_paths:[]}},registry).replay).toBe("safe")});
  it("recognizes a completed edit instead of applying it twice",async()=>{
    const root=await mkdtemp(join(tmpdir(),"piko-recovery-"));roots.push(root);await writeFile(join(root,"x.txt"),"before\n");
    const tool=applyToolRecoveryPolicy(createEditTool(),policy,registry);const inv=invocation();const context={env:new DurableNodeExecutionEnv({cwd:root})};
    const args={path:"x.txt",edits:[{oldText:"before",newText:"after"}]};
    await tool.execute("call",args,()=>{},context,inv.value,BACKGROUND_CONTEXT);
    await expect(tool.execute("call",args,()=>{},context,inv.value,BACKGROUND_CONTEXT)).resolves.toMatchObject({content:[{text:"Successfully replaced 1 block(s) in x.txt."}]});
    expect(await readFile(join(root,"x.txt"),"utf8")).toBe("after\n");
  });
  it("replays when the recorded effect has not happened",async()=>{
    const root=await mkdtemp(join(tmpdir(),"piko-recovery-"));roots.push(root);await writeFile(join(root,"x.txt"),"before\n");
    const tool=applyToolRecoveryPolicy(createWriteTool(),policy,registry);const inv=invocation();const context={env:new DurableNodeExecutionEnv({cwd:root})};
    await tool.execute("call",{path:"x.txt",content:"after\n"},()=>{},context,inv.value,BACKGROUND_CONTEXT);
    await writeFile(join(root,"x.txt"),"before\n");
    await tool.execute("call",{path:"x.txt",content:"after\n"},()=>{},context,inv.value,BACKGROUND_CONTEXT);
    expect(await readFile(join(root,"x.txt"),"utf8")).toBe("after\n");
  });
  it("fails closed when target state drifted after an uncertain write",async()=>{
    const root=await mkdtemp(join(tmpdir(),"piko-recovery-"));roots.push(root);await writeFile(join(root,"x.txt"),"before\n");
    const tool=applyToolRecoveryPolicy(createWriteTool(),policy,registry);const inv=invocation();const context={env:new DurableNodeExecutionEnv({cwd:root})};
    await tool.execute("call",{path:"x.txt",content:"after\n"},()=>{},context,inv.value,BACKGROUND_CONTEXT);await writeFile(join(root,"x.txt"),"third-party\n");
    await expect(tool.execute("call",{path:"x.txt",content:"after\n"},()=>{},context,inv.value,BACKGROUND_CONTEXT)).rejects.toThrow(/ambiguous/);
  });
  it("keeps edit recovery memos bounded independently of file size",async()=>{
    const root=await mkdtemp(join(tmpdir(),"piko-recovery-"));roots.push(root);await writeFile(join(root,"x.txt"),`before\n${"x".repeat(2_000_000)}`);
    const tool=applyToolRecoveryPolicy(createEditTool(),policy,registry);const inv=invocation();const context={env:new DurableNodeExecutionEnv({cwd:root})};
    await tool.execute("call",{path:"x.txt",edits:[{oldText:"before",newText:"after"}]},()=>{},context,inv.value,BACKGROUND_CONTEXT);
    expect(JSON.stringify([...inv.memos.values()]).length).toBeLessThan(1000);
  });
});
