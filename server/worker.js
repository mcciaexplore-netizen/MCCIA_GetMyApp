const validApps = new Set(['dispatch-flow','tendersetu','gst-reconciliation','card-scanner','social-media-planner','digital-profile-creator','mr-wasooli','hr-studio','stocklist','minicrm',"compliance-calender","yojanasetu","hisabtalk-ai","review-desk","production-saathi"]);
const slots = ['11:00','12:00','14:30','15:30'];
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})}
export function isValidDate(date,now=new Date()){
 if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;
 const d=new Date(date+'T00:00:00+05:30');
 if(Number.isNaN(+d)||new Date(+d+19800000).toISOString().slice(0,10)!==date)return false;
 const day=new Date(date+'T12:00:00Z').getUTCDay();
 const today=new Date(+now+19800000).toISOString().slice(0,10);
 return day!==0&&day!==6&&date>=today&&+d<+now+90*86400000;
}
export function validateBooking(b,now=new Date()){
 if(!b||typeof b!=='object'||!validApps.has(b.appId)||!isValidDate(b.date,now)||!slots.includes(b.slot))return 'Please choose a valid application, weekday and time.';
 if(+new Date(b.date+'T'+b.slot+':00+05:30')<=+now)return 'This slot has already started. Please choose a later slot.';
 if(typeof b.name!=='string'||b.name.trim().length<2||b.name.length>100)return 'Enter your full name (2–100 characters).';
 if(typeof b.email!=='string'||b.email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))return 'Enter a valid email address.';
 if(typeof b.company!=='string'||b.company.length>150)return 'Company must be 150 characters or fewer.';
 return null;
}
function database(env){if(!env.DB)throw new Error('Booking database unavailable');return env.DB;}
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname.startsWith('/api/')){
  try{
   const db=database(env);
   if(url.pathname.startsWith('/api/editor/')) {
    if(!env.EDITOR_ACCESS_KEY || env.EDITOR_ACCESS_KEY.length<32) return json({error:'Editor access has not been configured. Contact the studio owner.'},503);
    const token=request.headers.get('Authorization')?.replace(/^Bearer /,'')||'';
    const hash=async value=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
    const [actual,expected]=await Promise.all([hash(token),hash(env.EDITOR_ACCESS_KEY)]);let diff=0;for(let i=0;i<actual.length;i++)diff|=actual[i]^expected[i];
    if(diff!==0)return json({error:'Invalid editor access key.'},401);
    if(url.pathname==='/api/editor/session'&&request.method==='GET')return json({role:'editor'});
    if(url.pathname==='/api/editor/availability'&&request.method==='GET') {
     const date=url.searchParams.get('date');if(!isValidDate(date))return json({error:'Choose a weekday within the next 90 days.'},400);
     const records=await db.prepare('SELECT slot, visible, active FROM availability WHERE date = ?').bind(date).all();
     const bookings=await db.prepare('SELECT slot FROM bookings WHERE date = ?').bind(date).all();
     return json({slots:slots.map(time=>{const row=records.results.find(r=>r.slot===time);return {time,visible:row?!!row.visible:true,active:row?!!row.active:true,booked:bookings.results.some(r=>r.slot===time)}})});
    }
    if(url.pathname==='/api/editor/availability'&&request.method==='PUT'){
     if(request.headers.get('Origin')!==url.origin)return json({error:'Use the studio editor page.'},403);
     const raw=await request.text();if(raw.length>4096)return json({error:'Request too large.'},413);let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}
     if(!isValidDate(b.date)||!Array.isArray(b.slots)||b.slots.length!==4||new Set(b.slots.map(s=>s.time)).size!==4||b.slots.some(s=>!slots.includes(s.time)||typeof s.visible!=='boolean'||typeof s.active!=='boolean'))return json({error:'Invalid availability settings.'},400);
     await db.batch(b.slots.map(s=>db.prepare('INSERT INTO availability (date, slot, visible, active) VALUES (?, ?, ?, ?) ON CONFLICT(date, slot) DO UPDATE SET visible=excluded.visible, active=excluded.active').bind(b.date,s.time,Number(s.visible),Number(s.active))));
     return json({saved:true});
    }
    return json({error:'Not found'},404);
   }
   if(url.pathname==='/api/schedule'&&request.method==='GET'){
    const dates=[];const today=new Date(Date.now()+19800000);today.setUTCHours(0,0,0,0);for(let i=0;dates.length<20;i++){const day=new Date(+today+i*86400000);if(![0,6].includes(day.getUTCDay()))dates.push(day.toISOString().slice(0,10));}
    const rows=await db.prepare('SELECT date, slot, visible, active FROM availability WHERE date >= ? AND date <= ?').bind(dates[0],dates.at(-1)).all();
    return json({days:dates.map(date=>{const settings=slots.map(slot=>rows.results.find(r=>r.date===date&&r.slot===slot));return {date,visible:settings.some(r=>!r||r.visible),active:settings.some(r=>!r||(r.visible&&r.active))}}).filter(d=>d.visible)});
   }
   if(url.pathname==='/api/availability'&&request.method==='GET'){
    const date=url.searchParams.get('date');if(!isValidDate(date))return json({error:'Choose a weekday within the next 90 days.'},400);
    const result=await db.prepare('SELECT slot FROM bookings WHERE date = ?').bind(date).all();
    const reserved=new Set(result.results.map(r=>r.slot));
    const settings=(await db.prepare('SELECT slot, visible, active FROM availability WHERE date = ?').bind(date).all()).results;
    return json({date,slots:slots.map(slot=>({time:slot,visible:settings.find(r=>r.slot===slot)?.visible!==0,available:settings.find(r=>r.slot===slot)?.visible!==0&&settings.find(r=>r.slot===slot)?.active!==0&&!reserved.has(slot)&&+new Date(date+'T'+slot+':00+05:30')>Date.now()}))});
   }
   if(url.pathname==='/api/bookings'&&request.method==='POST'){
    if(request.headers.get('Origin')!==url.origin)return json({error:'Please book from this application.'},403);
    if(!request.headers.get('Content-Type')?.includes('application/json'))return json({error:'JSON required.'},415);
    const raw=await request.text();if(raw.length>4096)return json({error:'Request too large.'},413);
    let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}
    const error=validateBooking(b);if(error)return json({error},400);
    const id=crypto.randomUUID();
    try{const saved=await db.prepare('INSERT INTO bookings (id, app_id, date, slot, name, email, company, created_at) SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM availability WHERE date = ? AND slot = ? AND (visible = 0 OR active = 0))').bind(id,b.appId,b.date,b.slot,b.name.trim(),b.email.trim().toLowerCase(),b.company.trim(),new Date().toISOString(),b.date,b.slot).run();if((saved.meta?.changes??saved.changes)===0)return json({error:'This slot is no longer available. Please choose another time.'},409)}
    catch(e){if(String(e).includes('UNIQUE constraint'))return json({error:'This slot was just booked. Please choose another time.'},409);throw e}
    return json({id,appId:b.appId,date:b.date,slot:b.slot},201);
   }
   return json({error:'Not found'},404);
  }catch(e){console.error('Booking API failed:',String(e));return json({error:'Booking is temporarily unavailable. Please try again shortly.'},503)}
 }
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 const asset=assets[url.pathname==='/'?'/index.html':url.pathname];
 if(!asset)return new Response('Not found',{status:404});
 return new Response(request.method==='HEAD'?null:asset.body,{headers:{'Content-Type':asset.type,'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Cache-Control':'no-cache'}});
}};
