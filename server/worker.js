const validApps = new Set(['dispatch-flow','tendersetu','gst-reconciliation','card-scanner','social-media-planner','digital-profile-creator','mr-wasooli','hr-studio','stocklist','minicrm']);
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
   if(url.pathname==='/api/availability'&&request.method==='GET'){
    const date=url.searchParams.get('date');if(!isValidDate(date))return json({error:'Choose a weekday within the next 90 days.'},400);
    const result=await db.prepare('SELECT slot FROM bookings WHERE date = ?').bind(date).all();
    const reserved=new Set(result.results.map(r=>r.slot));
    return json({date,slots:slots.map(slot=>({time:slot,available:!reserved.has(slot)&&+new Date(date+'T'+slot+':00+05:30')>Date.now()}))});
   }
   if(url.pathname==='/api/bookings'&&request.method==='POST'){
    if(request.headers.get('Origin')!==url.origin)return json({error:'Please book from this application.'},403);
    if(!request.headers.get('Content-Type')?.includes('application/json'))return json({error:'JSON required.'},415);
    const raw=await request.text();if(raw.length>4096)return json({error:'Request too large.'},413);
    let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}
    const error=validateBooking(b);if(error)return json({error},400);
    const id=crypto.randomUUID();
    try{await db.prepare('INSERT INTO bookings (id, app_id, date, slot, name, email, company, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(id,b.appId,b.date,b.slot,b.name.trim(),b.email.trim().toLowerCase(),b.company.trim(),new Date().toISOString()).run()}
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
