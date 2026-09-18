import type { TaskRequest } from "./types.js";
const sorted=(x:string[])=>[...x].sort();
export function normalizedTask(t:TaskRequest):unknown{return {...t,permissions:{...t.permissions,read_paths:sorted(t.permissions.read_paths),write_paths:sorted(t.permissions.write_paths)},output_paths:sorted(t.output_paths),limits:{...t.limits,deadline_at:new Date(t.limits.deadline_at).toISOString()}}}
export function sameTask(a:TaskRequest,b:TaskRequest):boolean{return JSON.stringify(normalizedTask(a))===JSON.stringify(normalizedTask(b))}
