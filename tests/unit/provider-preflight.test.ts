import { createServer } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { preflightModelProvider } from "../../src/provider-preflight.js";

const servers:ReturnType<typeof createServer>[]=[];
afterEach(async()=>{for(const server of servers.splice(0))await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()))});

describe("model provider preflight",()=>{
  it("requires the configured model in the OpenAI model list",async()=>{
    const server=createServer((req,res)=>{expect(req.url).toBe("/v1/models");expect(req.headers.authorization).toBe("Bearer secret");res.setHeader("content-type","application/json");res.end(JSON.stringify({object:"list",data:[{id:"loaded-model",object:"model"}]}))});servers.push(server);
    await new Promise<void>(resolve=>server.listen(0,"127.0.0.1",resolve));const address=server.address();if(!address||typeof address==="string")throw new Error("missing test address");const base=`http://127.0.0.1:${address.port}/v1/`;
    await expect(preflightModelProvider(base,"secret",1000,"loaded-model")).resolves.toBeUndefined();
    await expect(preflightModelProvider(base,"secret",1000,"missing-model")).rejects.toThrow(/not available/);
  });
});
