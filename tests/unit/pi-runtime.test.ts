import {describe,expect,it} from "vitest";
import {discussionMessage,initialPrompt,normalizeRawUsage} from "../../src/pi-runtime.js";
import type {TaskRequest} from "../../src/types.js";

const task:TaskRequest={task_id:"t",instruction:"typed instruction",workspace_ref:"repo",permissions:{read_paths:[],write_paths:[],tool_profile_ref:"workspace-standard"},limits:{deadline_at:new Date(Date.now()+60000).toISOString(),max_model_calls:2,max_tool_calls:2},output_paths:[],discussion:{room_id:"!r:x",trigger_event_id:"$e"}};
const turn={event_id:"$e",turn_seq:1,status:"Pending",visible_content:"trigger body"};

describe("discussion prompt projection",()=>{
  it("accepts instruction and trigger as two typed messages in one initial prompt",()=>{const prompt=initialPrompt(task,turn,123);expect(prompt).toEqual([{role:"user",content:[{type:"text",text:"typed instruction"}],timestamp:123},{role:"custom",customType:"piko.discussion",content:"trigger body",display:false,details:{event_id:"$e"},timestamp:123}]);if(!Array.isArray(prompt))throw new Error("expected message array");expect(JSON.stringify(prompt[0])).not.toContain("trigger body")});
  it("keeps event identity out of provider-visible discussion content",()=>{const message=discussionMessage(turn,123) as any;expect(message.content).toBe("trigger body");expect(message.content).not.toContain("$e");expect(message.details.event_id).toBe("$e")});
  it("keeps provider input totals inclusive of cached tokens",()=>{expect(normalizeRawUsage({input_tokens:5676,output_tokens:35,total_tokens:5711,input_tokens_details:{cached_tokens:4096},output_tokens_details:{reasoning_tokens:7}})).toEqual({input:5676,output:35,totalTokens:5711,cacheRead:4096,cacheWrite:undefined,reasoning:7})});
});
