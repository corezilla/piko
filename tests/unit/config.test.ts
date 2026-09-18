import {describe,expect,it} from "vitest";
import {validateToolRegistry,type ToolRegistry} from "../../src/config.js";

const registry=(tool:string,effect:string,implementation="builtin:workspace-atomic-write"):ToolRegistry=>({profile_version:"0.3",recovery_contracts:{c:{kind:"stable_deduplication",implementation_ref:implementation}},profiles:{p:{tools:{[tool]:{effect,replay:"safe",recovery_contract_ref:"c",permissions:{}}}}}});

describe("tool recovery binding",()=>{
  it("accepts workspace recovery only for its implemented tools",()=>{expect(()=>validateToolRegistry(registry("write","workspace_write"))).not.toThrow();expect(()=>validateToolRegistry(registry("edit","workspace_write"))).not.toThrow()});
  it("rejects nominal contracts that do not implement the selected tool",()=>{expect(()=>validateToolRegistry(registry("bash","process"))).toThrow(/not applicable/);expect(()=>validateToolRegistry(registry("write","workspace_write","builtin:external-status"))).toThrow(/not available/)});
  it("rejects unknown tool names at startup",()=>{expect(()=>validateToolRegistry(registry("invented","workspace_write"))).toThrow(/unregistered tool/)});
});
