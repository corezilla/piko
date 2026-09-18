import { describe, expect, it } from "vitest";
import { aggregateUsage } from "../../src/worker.js";
import { validateUsage } from "../../src/semantic.js";

const complete={input:10,output:5,totalTokens:15,cacheRead:2,cacheWrite:0,reasoning:1};

describe("worker usage aggregation",()=>{
  it("returns Unknown when one durable attempt has no usage",()=>{
    const usage=aggregateUsage([complete],2);
    expect(usage).toMatchObject({quality:"Unknown",model_attempts:2,usage_observed_attempts:1,input_tokens:null,output_tokens:null,total_tokens:null});
    expect(()=>validateUsage(usage)).not.toThrow();
  });

  it("keeps only fields covered by every durable attempt",()=>{
    const usage=aggregateUsage([complete,{...complete,reasoning:undefined}],2);
    expect(usage).toMatchObject({quality:"Partial",input_tokens:20,output_tokens:10,total_tokens:30,reasoning_tokens:null});
    expect(()=>validateUsage(usage)).not.toThrow();
  });
});
