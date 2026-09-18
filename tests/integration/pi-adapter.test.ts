import { mkdtemp,rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach,describe,expect,it } from "vitest";
import { AgentHarness } from "../../upstream/pi/packages/agent/src/harness/agent-harness.ts";
import { BACKGROUND_CONTEXT } from "../../upstream/pi/packages/agent/src/harness/context.ts";
import { JsonlSessionRepo } from "../../upstream/pi/packages/agent/src/harness/session/jsonl/repo.ts";
import { createModels } from "../../upstream/pi/packages/ai/src/models.ts";
import { fauxAssistantMessage, fauxProvider } from "../../upstream/pi/packages/ai/src/providers/faux.ts";
import { DurableNodeExecutionEnv } from "../../src/durable-fs.js";

const dirs:string[]=[];
afterEach(async()=>{for(const dir of dirs.splice(0))await rm(dir,{recursive:true,force:true})});

describe("Pi adapter",()=>{
  it("exposes a durable step id before every provider effect and commits JSONL",async()=>{
    const dir=await mkdtemp(join(tmpdir(),"piko-pi-"));dirs.push(dir);
    const env=new DurableNodeExecutionEnv({cwd:dir});const repo=new JsonlSessionRepo({fileSystem:env,sessionsRoot:join(dir,"sessions")});
    const session=await repo.create({cwd:dir,id:"run-test"},BACKGROUND_CONTEXT);const faux=fauxProvider();faux.setResponses([fauxAssistantMessage("done")]);const models=createModels();models.setProvider(faux.provider);
    const {harness}=await AgentHarness.create({session,models,model:faux.getModel(),streamOptions:{maxRetries:0}},BACKGROUND_CONTEXT);const observed:string[]=[];harness.hooks.on("before_request",event=>{observed.push(event.stepId);return undefined});
    const lane=await harness.lane("main",BACKGROUND_CONTEXT);const accepted=await lane.accept({kind:"prompt",operationId:"run-test:initial",prompt:"work"},BACKGROUND_CONTEXT);if(!accepted.ok)throw accepted.error;
    const driven=await lane.drive({operationId:accepted.value.operationId},BACKGROUND_CONTEXT);expect(driven).toMatchObject({ok:true,value:{kind:"settled",outcome:{status:"completed"}}});expect(observed).toHaveLength(1);expect(observed[0]).toMatch(/^[0-9a-f-]+$/);
    await harness.close(BACKGROUND_CONTEXT);await repo.close(BACKGROUND_CONTEXT);
  });
  it("recovers a deterministically accepted initial operation without duplicating its user message",async()=>{
    const dir=await mkdtemp(join(tmpdir(),"piko-pi-"));dirs.push(dir);const sessions=join(dir,"sessions");
    const repo1=new JsonlSessionRepo({fileSystem:new DurableNodeExecutionEnv({cwd:dir}),sessionsRoot:sessions});const session1=await repo1.create({cwd:dir,id:"run-accept"},BACKGROUND_CONTEXT);const faux1=fauxProvider();const models1=createModels();models1.setProvider(faux1.provider);const first=await AgentHarness.create({session:session1,models:models1,model:faux1.getModel()},BACKGROUND_CONTEXT);const lane1=await first.harness.lane("main",BACKGROUND_CONTEXT);const accepted=await lane1.accept({kind:"prompt",operationId:"run-accept:initial",prompt:"once"},BACKGROUND_CONTEXT);if(!accepted.ok)throw accepted.error;await first.harness.close(BACKGROUND_CONTEXT);await repo1.close(BACKGROUND_CONTEXT);
    const repo2=new JsonlSessionRepo({fileSystem:new DurableNodeExecutionEnv({cwd:dir}),sessionsRoot:sessions});const record=(await repo2.list({cwd:dir},BACKGROUND_CONTEXT)).find(x=>x.id==="run-accept")!;const session2=await repo2.open(record,BACKGROUND_CONTEXT);const faux2=fauxProvider();faux2.setResponses([fauxAssistantMessage("done")]);const models2=createModels();models2.setProvider(faux2.provider);const reopened=await AgentHarness.create({session:session2,models:models2,model:faux2.getModel()},BACKGROUND_CONTEXT);expect(reopened.open.map(x=>x.operationId)).toEqual(["run-accept:initial"]);const lane2=await reopened.harness.lane("main",BACKGROUND_CONTEXT);const driven=await lane2.drive({operationId:"run-accept:initial"},BACKGROUND_CONTEXT);expect(driven).toMatchObject({ok:true,value:{kind:"settled",outcome:{status:"completed"}}});const entries=await lane2.findEntries({type:"message"},BACKGROUND_CONTEXT);expect(entries.filter((x:any)=>x.message?.role==="user"&&JSON.stringify(x.message).includes("once"))).toHaveLength(1);expect(faux2.state.callCount).toBe(1);await reopened.harness.close(BACKGROUND_CONTEXT);await repo2.close(BACKGROUND_CONTEXT);
  });
});
