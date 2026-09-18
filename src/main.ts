import { resolve } from "node:path";
import { loadConfig, resolveSecret } from "./config.js";
import { TaskStore } from "./store.js";
import { BearerAuth } from "./auth.js";
import { MatrixRuntime } from "./matrix.js";
import { PiRuntime } from "./pi-runtime.js";
import { RunWorker } from "./worker.js";
import { ApiServer } from "./server.js";
import { preflightModelProvider } from "./provider-preflight.js";

async function main(){
  const configPath=resolve(process.argv[2]??process.env.PIKO_CONFIG??"config/runtime.json");
  const {config,tools}=await loadConfig(configPath,resolve(import.meta.dirname,".."));
  const [bearer,llmKey,matrixToken]=await Promise.all([resolveSecret(config.api_auth.bearer_token_secret_ref),resolveSecret(config.llmtier.api_key_secret_ref),config.matrix.enabled?resolveSecret(config.matrix.access_token_secret_ref!):Promise.resolve(undefined)]);
  await preflightModelProvider(config.llmtier.base_url,llmKey,config.llmtier.models_timeout_ms,config.agent.model);
  const store=new TaskStore(config.task_store.sqlite_path,config.task_store.busy_timeout_ms);
  const matrix=new MatrixRuntime(config,store,matrixToken);await matrix.start();
  const pi=new PiRuntime(config,tools,store,llmKey);const worker=new RunWorker(config,store,pi,matrix);worker.start();
  const server=await ApiServer.create(config,store,new BearerAuth(config.api_auth.principal_id,Buffer.from(bearer)),matrix);await server.listen();
  console.log(`Piko listening on http://${config.listen.host}:${config.listen.port}`);
  let closing=false;const close=async()=>{if(closing)return;closing=true;await server.close();await worker.close();await matrix.close();await pi.close();store.close()};
  process.once("SIGINT",()=>void close().then(()=>process.exit(0)));process.once("SIGTERM",()=>void close().then(()=>process.exit(0)));
}
main().catch(error=>{console.error(error);process.exitCode=1});
