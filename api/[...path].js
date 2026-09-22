import worker from '../server/worker.js';
import {supabaseDatabase} from '../server/supabase.js';
export default async function handler(req,res){
 try{
  const protocol=req.headers['x-forwarded-proto']==='http'?'http':'https';
  const request=new Request(protocol+'://'+req.headers.host+req.url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:typeof req.body==='string'?req.body:JSON.stringify(req.body)})});
  const response=await worker.fetch(request,{DB:supabaseDatabase(process.env),EDITOR_ACCESS_KEY:process.env.EDITOR_ACCESS_KEY,GOOGLE_SHEETS_WEBHOOK_URL:process.env.GOOGLE_SHEETS_WEBHOOK_URL,GOOGLE_SHEETS_WEBHOOK_SECRET:process.env.GOOGLE_SHEETS_WEBHOOK_SECRET});
  res.status(response.status);for(const [key,value] of response.headers)res.setHeader(key,value);res.send(await response.text());
 }catch(e){console.error('api/[...path] handler failed:',String(e));res.status(503).json({error:'The studio booking service is not configured yet. Please contact aistudio@mcciapune.com.'})}
}
