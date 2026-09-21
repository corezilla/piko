import {beforeAll,describe,expect,it} from "vitest";
import {readFile} from "node:fs/promises";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

let validate:any,example:any;
beforeAll(async()=>{const schema=JSON.parse(await readFile("interfaces/schemas/piko-runtime-config-v0.3.schema.json","utf8"));example=JSON.parse(await readFile("config/runtime.example.json","utf8"));const AjvCtor:any=(Ajv as any).default??Ajv;const formats:any=(addFormats as any).default??addFormats;const ajv=new AjvCtor({strict:false,allErrors:true});formats(ajv);validate=ajv.compile(schema)});

describe("runtime config schema",()=>{
  it("accepts the shipped example",()=>expect(validate(structuredClone(example)),JSON.stringify(validate.errors)).toBe(true));
  it("requires secret references rather than plaintext credentials",()=>{const value=structuredClone(example);value.api_auth.bearer_token_secret_ref="plaintext";expect(validate(value)).toBe(false);expect(validate.errors.some((x:any)=>x.instancePath==="/api_auth/bearer_token_secret_ref")).toBe(true)});
  it("requires the complete Matrix credential and media policy when enabled",()=>{const value=structuredClone(example);value.matrix={enabled:true};expect(validate(value)).toBe(false);for(const field of ["homeserver","user_id","access_token_secret_ref","sync_timeout_ms","max_media_bytes","allowed_mime_types"])expect(validate.errors.some((x:any)=>x.params?.missingProperty===field)).toBe(true)});
  it("permits http(s) model endpoints (trusted-LAN plain HTTP allowed by owner, 2026-09-21) and rejects other schemes",()=>{const loopback=structuredClone(example);loopback.llmtier.base_url="http://127.0.0.1:9000/v1/";expect(validate(loopback)).toBe(true);const lan=structuredClone(example);lan.llmtier.base_url="http://192.168.1.10:9000/v1/";expect(validate(lan)).toBe(true);const https=structuredClone(example);https.llmtier.base_url="https://llmtier.example/v1/";expect(validate(https)).toBe(true);const other=structuredClone(example);other.llmtier.base_url="ftp://192.168.1.10:9000/v1/";expect(validate(other)).toBe(false)});
});
