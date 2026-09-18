export async function preflightModelProvider(base:string,key:string,timeout:number,model:string){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);
  try{
    const response=await fetch(new URL("models",base.endsWith("/")?base:`${base}/`),{headers:{authorization:`Bearer ${key}`},signal:controller.signal});
    if(!response.ok)throw new Error(`model provider preflight returned ${response.status}`);
    const payload=await response.json() as any;
    if(!Array.isArray(payload?.data)||!payload.data.some((item:any)=>item?.id===model))throw new Error(`configured model is not available: ${model}`);
  }finally{clearTimeout(timer)}
}
