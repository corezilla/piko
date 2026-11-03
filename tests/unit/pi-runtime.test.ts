import {describe,expect,it} from "vitest";
import {discussionMessage,initialPrompt,normalizeRawUsage,buildSystemPrompt} from "../../src/pi-runtime.js";
import type {TaskRequest} from "../../src/types.js";
import type {PrefetchedSkillContext} from "../../src/skill-prefetch.js";

const task:TaskRequest={task_id:"t",instruction:"typed instruction",workspace_ref:"repo",permissions:{read_paths:[],write_paths:[],tool_profile_ref:"workspace-standard"},output_paths:[],discussion:{room_id:"!r:x",trigger_event_id:"$e"}};
const turn={event_id:"$e",turn_seq:1,status:"Pending",visible_content:"trigger body"};

describe("discussion prompt projection",()=>{
  it("accepts instruction and trigger as two typed messages in one initial prompt",()=>{const prompt=initialPrompt(task,turn,123);expect(prompt).toEqual([{role:"user",content:[{type:"text",text:"typed instruction"}],timestamp:123},{role:"custom",customType:"piko.discussion",content:"trigger body",display:false,details:{event_id:"$e"},timestamp:123}]);if(!Array.isArray(prompt))throw new Error("expected message array");expect(JSON.stringify(prompt[0])).not.toContain("trigger body")});
  it("keeps event identity out of provider-visible discussion content",()=>{const message=discussionMessage(turn,123) as any;expect(message.content).toBe("trigger body");expect(message.content).not.toContain("$e");expect(message.details.event_id).toBe("$e")});
  it("keeps provider input totals inclusive of cached tokens",()=>{expect(normalizeRawUsage({input_tokens:5676,output_tokens:35,total_tokens:5711,input_tokens_details:{cached_tokens:4096},output_tokens_details:{reasoning_tokens:7}})).toEqual({input:5676,output:35,totalTokens:5711,cacheRead:4096,cacheWrite:undefined,reasoning:7})});
});

describe("V0.1.3 · skill context in the system prompt",()=>{
  const identity={role:"tester",name:"alice:tester"};

  function context(over:Partial<PrefetchedSkillContext>={}):PrefetchedSkillContext{
    return {memory:[],docs:[],memoryQuery:"q",docsQuery:"q",sources:{memory:"empty",docs:"empty"},durationMs:1,...over};
  }

  it("puts the prefetched context into the prompt",()=>{
    const prompt=buildSystemPrompt(task,identity,context({
      memory:[{id:"m1",memory:"Prefer hermetic tmpdir",score:0.9,metadata:{tags:["tests"]},created_at:"2026-10-12T00:00:00Z"}],
      sources:{memory:"ok",docs:"empty"},
    }));
    expect(prompt).toContain("=== Context ===");
    expect(prompt).toContain("Prefer hermetic tmpdir");
  });

  it("emits the section even when nothing was found, so the prompt shape is constant",()=>{
    const prompt=buildSystemPrompt(task,identity,context());
    expect(prompt).toContain("=== Context ===");
    expect(prompt).toContain("(0 found)");
  });

  it("keeps the old prompt shape when no context is supplied",()=>{
    const prompt=buildSystemPrompt(task,identity);
    expect(prompt).not.toContain("=== Context ===");
  });

  it("places the context after the identity block and before the tool hints",()=>{
    const prompt=buildSystemPrompt(task,{...identity,memory:{provider:"mem0",api_key_secret_ref:"env:X"} as any},context());
    const identityAt=prompt.indexOf("Your identity:");
    const contextAt=prompt.indexOf("=== Context ===");
    const toolsAt=prompt.indexOf("mem0_lookup");
    expect(identityAt).toBeGreaterThan(-1);
    expect(contextAt).toBeGreaterThan(identityAt);
    expect(toolsAt).toBeGreaterThan(contextAt);
  });
});
