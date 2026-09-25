import worker from '../server/worker.js';
import {supabaseDatabase} from '../server/supabase.js';
import nodemailer from 'nodemailer';
// SMTP is optional: only built when SMTP_HOST etc. are set in env, so worker.js's Apps-Script-
// webhook email path keeps working unchanged if SMTP is never configured. Kept here (not in
// worker.js) because nodemailer needs Node's TCP sockets, which aren't available in every
// runtime worker.js's fetch(request,env) shape is designed to run in.
function buildSmtpSender(env){
 if(!env.SMTP_HOST||!env.SMTP_PORT||!env.SMTP_USER||!env.SMTP_PASS)return undefined;
 const transporter=nodemailer.createTransport({
  host:env.SMTP_HOST,
  port:Number(env.SMTP_PORT),
  secure:Number(env.SMTP_PORT)===465,
  auth:{user:env.SMTP_USER,pass:env.SMTP_PASS}
 });
 return async({to,subject,text})=>{await transporter.sendMail({from:env.SMTP_FROM||env.SMTP_USER,to,subject,text})};
}
export default async function handler(req,res){
 try{
  const protocol=req.headers['x-forwarded-proto']==='http'?'http':'https';
  const request=new Request(protocol+'://'+req.headers.host+req.url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:typeof req.body==='string'?req.body:JSON.stringify(req.body)})});
  const response=await worker.fetch(request,{DB:supabaseDatabase(process.env),EDITOR_ACCESS_KEY:process.env.EDITOR_ACCESS_KEY,GOOGLE_SHEETS_WEBHOOK_URL:process.env.GOOGLE_SHEETS_WEBHOOK_URL,GOOGLE_SHEETS_WEBHOOK_SECRET:process.env.GOOGLE_SHEETS_WEBHOOK_SECRET,STUDIO_NOTIFICATION_EMAIL:process.env.STUDIO_NOTIFICATION_EMAIL,sendMailSMTP:buildSmtpSender(process.env)});
  res.status(response.status);for(const [key,value] of response.headers)res.setHeader(key,value);res.send(await response.text());
 }catch(e){console.error('api/[...path] handler failed:',String(e));res.status(503).json({error:'The studio booking service is not configured yet. Please contact aistudio@mcciapune.com.'})}
}
