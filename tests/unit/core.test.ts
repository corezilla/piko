import { describe,expect,it } from "vitest";
import { BearerAuth } from "../../src/auth.js";
import { sameTask } from "../../src/task-equality.js";
import { validateUsage } from "../../src/semantic.js";
import type { TaskRequest, TokenUsage } from "../../src/types.js";

const task=(id="t1"):TaskRequest=>({task_id:id,instruction:"write result",workspace_ref:"repo",permissions:{read_paths:["src","README.md"],write_paths:["out"],tool_profile_ref:"workspace-standard"},limits:{deadline_at:new Date(Date.now()+60000).toISOString(),max_model_calls:3,max_tool_calls:4},output_paths:["out/result.txt"]});

describe("core semantics",()=>{
  it("authenticates a single bearer principal",()=>{const auth=new BearerAuth("slinky",Buffer.from("secret"));expect(auth.authenticate("Bearer secret")).toBe("slinky");expect(()=>auth.authenticate("Bearer wrong")).toThrowError(/invalid/)});
  it("compares normalized immutable task definitions",()=>{const a=task(),b=structuredClone(a);b.permissions.read_paths.reverse();expect(sameTask(a,b)).toBe(true);b.instruction="different";expect(sameTask(a,b)).toBe(false)});
  it("enforces usage arithmetic",()=>{const usage:TokenUsage={source:"PiModelResponses",quality:"Complete",input_tokens:10,output_tokens:5,total_tokens:15,cache_read_tokens:2,cache_write_tokens:0,reasoning_tokens:1,model_attempts:1,usage_observed_attempts:1,missing_fields:[]};expect(()=>validateUsage(usage)).not.toThrow();expect(()=>validateUsage({...usage,total_tokens:16})).toThrowError(/total/)})
  it("rejects cache, reasoning, attempt, and missing-field contradictions",()=>{const usage:TokenUsage={source:"PiModelResponses",quality:"Complete",input_tokens:10,output_tokens:5,total_tokens:15,cache_read_tokens:2,cache_write_tokens:0,reasoning_tokens:1,model_attempts:1,usage_observed_attempts:1,missing_fields:[]};expect(()=>validateUsage({...usage,cache_read_tokens:11})).toThrow(/cache/);expect(()=>validateUsage({...usage,reasoning_tokens:6})).toThrow(/reasoning/);expect(()=>validateUsage({...usage,usage_observed_attempts:2})).toThrow(/attempts/);expect(()=>validateUsage({...usage,input_tokens:null,missing_fields:[]})).toThrow(/missing mismatch/)});
  it("enforces Complete, Partial, and Unknown quality semantics",()=>{const complete:TokenUsage={source:"PiModelResponses",quality:"Complete",input_tokens:10,output_tokens:5,total_tokens:15,cache_read_tokens:2,cache_write_tokens:0,reasoning_tokens:1,model_attempts:1,usage_observed_attempts:1,missing_fields:[]};expect(()=>validateUsage({...complete,quality:"Partial"})).toThrow(/Partial/);expect(()=>validateUsage({...complete,quality:"Unknown"})).toThrow(/Unknown/);expect(()=>validateUsage({...complete,quality:"Complete",input_tokens:null,missing_fields:["input_tokens"]})).toThrow(/Complete/)});
});
