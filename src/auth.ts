import { timingSafeEqual } from "node:crypto";
import { PikoError } from "./types.js";
export class BearerAuth { constructor(readonly principal:string,private readonly token:Buffer){} authenticate(header:string|undefined):string{if(!header?.startsWith("Bearer "))throw new PikoError("Unauthorized",401,"missing bearer credential");const got=Buffer.from(header.slice(7));if(got.length!==this.token.length||!timingSafeEqual(got,this.token))throw new PikoError("Unauthorized",401,"invalid bearer credential");return this.principal}}
