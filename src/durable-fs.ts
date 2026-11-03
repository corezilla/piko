import { open } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { NodeExecutionEnv } from "../upstream/pi/packages/agent/src/harness/env/nodejs.ts";
import type { Context } from "../upstream/pi/packages/agent/src/harness/context.ts";
import type { ExecutionError, ShellExecOptions, ShellExecResult } from "../upstream/pi/packages/agent/src/harness/types.ts";
import { ExecutionFactCollector, statusFromErrorCode } from "./execution-facts.js";

/** Pi's JSONL session writes, strengthened with fsync before success is exposed. */
export class DurableNodeExecutionEnv extends NodeExecutionEnv {
  /**
   * Execution facts captured from env.exec.
   *
   * MECH-TESTEXEC §5: Pi's bash tool turns a non-zero exit code into an Error
   * string and throws before returning, so the numeric code never reaches
   * Piko through the tool result. Overriding exec() is the only seam that
   * sees it without modifying vendored Pi.
   */
  readonly executionFacts = new ExecutionFactCollector();

  private absolute(path:string){return isAbsolute(path)?resolve(path):resolve(this.cwd,path)}
  private async sync(path:string, directory=false){
    const handle=await open(directory?dirname(this.absolute(path)):this.absolute(path),"r");
    try{await handle.sync()}finally{await handle.close()}
  }
  override async exec(
    command: string,
    options: ShellExecOptions | undefined,
    context: Context,
  ): Promise<{ ok: true; value: ShellExecResult } | { ok: false; error: ExecutionError }> {
    const startedAt = new Date().toISOString();
    const startedMs = Date.now();

    // Pi delivers the merged stdout+stderr text through onUpdate, not through
    // the exec result (ShellExecResult carries only the exit code and
    // truncation metadata). Tap the callback so the fact carries the output.
    // The caller's own onUpdate is still invoked, unchanged.
    let capturedOutput = "";
    let capturedTruncated = false;
    const callerOnUpdate = options?.onUpdate;
    const tappedOptions: ShellExecOptions | undefined = options
      ? {
          ...options,
          onUpdate: (update, ctx) => {
            if (update.kind === "replace") {
              capturedOutput = update.output.text;
              capturedTruncated = Boolean(update.output.truncation?.truncated);
            } else if (update.kind === "append") {
              capturedOutput += update.text;
            }
            callerOnUpdate?.(update, ctx);
          },
        }
      : undefined;

    const result = await super.exec(command, tappedOptions, context);
    const endedAt = new Date().toISOString();
    const durationMs = Date.now() - startedMs;

    if (result.ok) {
      this.executionFacts.record({
        tool_call_id: null,
        command,
        exit_code: result.value.exitCode,
        status: "exited",
        output: capturedOutput,
        truncated: capturedTruncated || Boolean(result.value.truncation?.truncated),
        timed_out: false,
        started_at: startedAt,
        ended_at: endedAt,
        duration_ms: durationMs,
      });
    } else {
      this.executionFacts.record({
        tool_call_id: null,
        command,
        exit_code: null,
        status: statusFromErrorCode(result.error.code),
        output: capturedOutput,
        truncated: capturedTruncated,
        timed_out: result.error.code === "timeout",
        started_at: startedAt,
        ended_at: endedAt,
        duration_ms: durationMs,
      });
    }
    return result;
  }
  override async writeFile(path:string,content:string|Uint8Array,context:Context){
    const result=await super.writeFile(path,content,context);
    if(result.ok){await this.sync(path);await this.sync(path,true)}
    return result;
  }
  override async appendFile(path:string,content:string|Uint8Array,context:Context){
    const result=await super.appendFile(path,content,context);
    if(result.ok)await this.sync(path);
    return result;
  }
  override async renameFile(source:string,destination:string,context:Context){
    const result=await super.renameFile(source,destination,context);
    if(result.ok){await this.sync(destination);await this.sync(destination,true)}
    return result;
  }
}
