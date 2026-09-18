import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { authorizePath } from "../../src/workspace.js";

const roots:string[]=[];
afterEach(async()=>{for(const root of roots.splice(0))await rm(root,{recursive:true,force:true})});

describe("workspace authorization",()=>{
  it("accepts an allowed file and rejects lexical traversal",async()=>{
    const workspace=await mkdtemp(join(tmpdir(),"piko-workspace-"));roots.push(workspace);
    await mkdir(join(workspace,"safe"));await writeFile(join(workspace,"safe","input.txt"),"ok");
    await expect(authorizePath(workspace,"safe/input.txt",["safe"])).resolves.toBe(await realpath(join(workspace,"safe","input.txt")));
    await expect(authorizePath(workspace,"../outside.txt",["safe"])).rejects.toThrow(/escapes workspace/);
  });

  it("rejects read and write paths that escape through a symlink",async()=>{
    const workspace=await mkdtemp(join(tmpdir(),"piko-workspace-"));const outside=await mkdtemp(join(tmpdir(),"piko-outside-"));roots.push(workspace,outside);
    await mkdir(join(workspace,"safe"));await writeFile(join(outside,"secret.txt"),"secret");await symlink(outside,join(workspace,"safe","link"));
    await expect(authorizePath(workspace,"safe/link/secret.txt",["safe"])).rejects.toThrow(/outside task permissions/);
    await expect(authorizePath(workspace,"safe/link/new.txt",["safe"],true)).rejects.toThrow(/outside task permissions/);
  });
});
