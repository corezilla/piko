import { runExecutionProcess } from "./main.js";

// P1 process bootstrap. Spawned by P0 (supervisor.ts) with PIKO_ROLE=exec.
const configPath = process.env.PIKO_EXEC_CONFIG ?? "config/runtime.json";
const root = process.env.PIKO_EXEC_ROOT ?? process.cwd();

runExecutionProcess(configPath, root).catch((error) => {
  console.error("[P1] execution process failed", error);
  process.exit(1);
});
