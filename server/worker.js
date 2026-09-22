const validApps = new Set(['dispatch-flow','tendersetu','gst-reconciliation','card-scanner','social-media-planner','digital-profile-creator','mr-wasooli','hr-studio','stocklist','minicrm',"compliance-calender","yojanasetu","hisabtalk-ai","review-desk","production-saathi"]);
// Trusted appId -> display name map. Never take app_name from the request body; always derive it from here.
const appNames = {
 'dispatch-flow':'Dispatch Flow','tendersetu':'TenderSetu','gst-reconciliation':'GST Reconciliation',
 'card-scanner':'Card Scanner','social-media-planner':'Social Media Planner','digital-profile-creator':'Digital Profile Creator',
 'mr-wasooli':'Payment Followup Agent','hr-studio':'HR Studio','stocklist':'Stocklist','minicrm':'MiniCRM',
 'compliance-calender':'Compliance Calender','yojanasetu':'YojanaSetu','hisabtalk-ai':'HisabTalk AI',
 'review-desk':'Review Desk','production-saathi':'Production Saathi'
};
const slots = ['11:00','14:30','15:30'];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Kept as small, easy-to-edit lists so the workflow vocabulary can change without touching logic.
const attendanceValues = ['Not Marked','Present','Absent'];
const progressStages = ['Not Started','In Progress','Completed'];
const appSchedule = {
 'dispatch-flow':[{date:'2026-09-28',slot:'11:00'},{date:'2026-10-06',slot:'14:30'}],
 'tendersetu':[{date:'2026-09-28',slot:'14:30'},{date:'2026-10-06',slot:'11:00'}],
 'gst-reconciliation':[{date:'2026-09-29',slot:'11:00'},{date:'2026-10-07',slot:'14:30'}],
 'card-scanner':[{date:'2026-09-29',slot:'14:30'},{date:'2026-10-07',slot:'11:00'}],
 'social-media-planner':[{date:'2026-09-29',slot:'15:30'},{date:'2026-10-05',slot:'11:00'}],
 'digital-profile-creator':[{date:'2026-09-30',slot:'11:00'},{date:'2026-10-08',slot:'14:30'}],
 'mr-wasooli':[{date:'2026-09-30',slot:'14:30'},{date:'2026-10-08',slot:'11:00'}],
 'hr-studio':[{date:'2026-10-01',slot:'11:00'},{date:'2026-10-05',slot:'15:30'}],
 'stocklist':[{date:'2026-10-01',slot:'14:30'},{date:'2026-10-07',slot:'15:30'}],
 'minicrm':[{date:'2026-10-01',slot:'15:30'},{date:'2026-10-09',slot:'11:00'}],
 'compliance-calender':[{date:'2026-10-09',slot:'14:30'}],
 'yojanasetu':[{date:'2026-10-09',slot:'15:30'}],
 'hisabtalk-ai':[{date:'2026-10-03',slot:'11:00'},{date:'2026-10-06',slot:'15:30'}],
 'review-desk':[{date:'2026-10-03',slot:'14:30'},{date:'2026-10-08',slot:'15:30'}],
 'production-saathi':[{date:'2026-10-03',slot:'15:30'},{date:'2026-10-05',slot:'14:30'}]
};
const eventDates = [...new Set(Object.values(appSchedule).flat().map(({date})=>date))].sort();
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})}
export function isValidDate(date,now=new Date(),appId=null){
 const today=new Date(+now+19800000).toISOString().slice(0,10);
 return (appId?appSchedule[appId]?.some(entry=>entry.date===date):eventDates.includes(date))&&date>=today;
}
export function validateBooking(b,now=new Date()){
 if(!b||typeof b!=='object'||!validApps.has(b.appId)||!appSchedule[b.appId].some(entry=>entry.date===b.date&&entry.slot===b.slot)||!isValidDate(b.date,now,b.appId))return 'Please choose the scheduled date and time for this application.';
 if(+new Date(b.date+'T'+b.slot+':00+05:30')<=+now)return 'This slot has already started. Please choose a later slot.';
 if(typeof b.name!=='string'||b.name.trim().length<2||b.name.length>100)return 'Enter your full name (2–100 characters).';
 const phoneDigits=typeof b.phone==='string'?b.phone.replace(/\D/g,''):'';
 if(typeof b.phone!=='string'||phoneDigits.length<7||phoneDigits.length>15||!/^\+?[\d\s().-]+$/.test(b.phone))return 'Enter a valid phone number with 7–15 digits.';
 if(typeof b.email!=='string'||b.email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))return 'Enter a valid email address.';
 if(typeof b.company!=='string'||b.company.length>150)return 'Company must be 150 characters or fewer.';
 return null;
}
function database(env){if(!env.DB)throw new Error('Booking database unavailable');return env.DB;}
// Writes/updates one row in the master Google Sheet via a Google Apps Script Web App, which is
// the authoritative store for session/progress data (see supabase/schema.sql's session_progress
// table, which is kept as a fast-read mirror updated only after this call succeeds). Never called
// from the browser -- only from the server, using server-only env vars.
async function upsertSheetRow(env,session){
 if(!env.GOOGLE_SHEETS_WEBHOOK_URL||!env.GOOGLE_SHEETS_WEBHOOK_SECRET)throw new Error('Google Sheets sync is not configured.');
 const res=await fetch(env.GOOGLE_SHEETS_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.GOOGLE_SHEETS_WEBHOOK_SECRET,action:'UPSERT_SESSION',session})});
 let data;try{data=await res.json()}catch{throw new Error('Google Sheets sync returned an unexpected response.')}
 if(!res.ok||!data.success)throw new Error(data.error||'Google Sheets sync failed.');
 return true;
}
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
    if(url.pathname==='/api/editor/sessions'&&request.method==='GET'){
     // Admin-only list combining bookings with their session_progress row. Two queries + a
     // JS-side merge, matching the same pattern already used for the public GET /api/session
     // and for the availability GET above, rather than introducing join support into the DB layer.
     const bookingRows=(await db.prepare('SELECT id, app_name, name, company, date, slot FROM bookings ORDER BY date, slot').bind().all()).results;
     const progressRows=(await db.prepare('SELECT booking_id, attendance, hours_completed, progress_stage, progress_percent, remarks FROM session_progress').bind().all()).results;
     const progressByBooking=new Map(progressRows.map(p=>[p.booking_id,p]));
     return json({sessions:bookingRows.map(b=>{const p=progressByBooking.get(b.id)||{};return {id:b.id,name:b.name,appName:b.app_name,company:b.company,date:b.date,slot:b.slot,attendance:p.attendance||'Not Marked',hoursCompleted:p.hours_completed??0,progressStage:p.progress_stage||'Not Started',progressPercent:p.progress_percent??0,remarks:p.remarks||''}})});
    }
    if(url.pathname==='/api/editor/availability'&&request.method==='GET') {
     const date=url.searchParams.get('date');if(!isValidDate(date))return json({error:'Choose one of the scheduled application dates.'},400);
     const records=await db.prepare('SELECT slot, visible, active FROM availability WHERE date = ?').bind(date).all();
     const bookings=await db.prepare('SELECT slot FROM bookings WHERE date = ?').bind(date).all();
     return json({slots:slots.map(time=>{const row=records.results.find(r=>r.slot===time);return {time,visible:row?!!row.visible:true,active:row?!!row.active:true,booked:bookings.results.some(r=>r.slot===time)}})});
    }
    if(url.pathname==='/api/editor/availability'&&request.method==='PUT'){
     if(request.headers.get('Origin')!==url.origin)return json({error:'Use the studio editor page.'},403);
     const raw=await request.text();if(raw.length>4096)return json({error:'Request too large.'},413);let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}
     if(!isValidDate(b.date)||!Array.isArray(b.slots)||b.slots.length!==slots.length||new Set(b.slots.map(s=>s.time)).size!==slots.length||b.slots.some(s=>!slots.includes(s.time)||typeof s.visible!=='boolean'||typeof s.active!=='boolean'))return json({error:'Invalid availability settings.'},400);
     await db.batch(b.slots.map(s=>db.prepare('INSERT INTO availability (date, slot, visible, active) VALUES (?, ?, ?, ?) ON CONFLICT(date, slot) DO UPDATE SET visible=excluded.visible, active=excluded.active').bind(b.date,s.time,Number(s.visible),Number(s.active))));
     return json({saved:true});
    }
    // NOTE: booking id is a QUERY PARAMETER (?id=...), not a path segment, matching the shape
    // of every other route in this file (/api/bookings, /api/schedule, /api/availability,
    // /api/editor/availability) that is confirmed working in production. An earlier version of
    // this route used a nested path segment (/api/editor/session/:id) and, like the equivalent
    // public /api/session/:id below, was seen returning a non-JSON response in production even
    // though every code path in this file returns valid JSON on every branch -- consistent with
    // a platform/routing issue specific to nested dynamic path segments under /api/, not an
    // application bug. Query-parameter routing avoids that shape entirely.
    if(url.pathname==='/api/editor/session'&&request.method==='PATCH'){
     if(request.headers.get('Origin')!==url.origin)return json({error:'Use the studio editor page.'},403);
     const bookingId=url.searchParams.get('id')||'';
     if(!uuidPattern.test(bookingId))return json({error:'Malformed booking ID.'},400);
     if(!request.headers.get('Content-Type')?.includes('application/json'))return json({error:'JSON required.'},415);
     const raw=await request.text();if(raw.length>4096)return json({error:'Request too large.'},413);
     let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}
     if(typeof b.attendance!=='string'||!attendanceValues.includes(b.attendance))return json({error:'Invalid attendance value.'},400);
     if(typeof b.hoursCompleted!=='number'||!Number.isFinite(b.hoursCompleted)||b.hoursCompleted<0||b.hoursCompleted>99.99)return json({error:'Hours completed must be a number between 0 and 99.99.'},400);
     if(typeof b.progressStage!=='string'||!progressStages.includes(b.progressStage))return json({error:'Invalid progress stage.'},400);
     if(!Number.isInteger(b.progressPercent)||b.progressPercent<0||b.progressPercent>100)return json({error:'Progress percent must be a whole number between 0 and 100.'},400);
     if(typeof b.remarks!=='string'||b.remarks.length>2000)return json({error:'Remarks must be 2000 characters or fewer.'},400);
     const bookingRows=(await db.prepare('SELECT app_name, name, company, date, slot FROM bookings WHERE id = ?').bind(bookingId).all()).results;
     if(!bookingRows.length)return json({error:'Booking not found.'},404);
     const existingRows=(await db.prepare('SELECT created_at FROM session_progress WHERE booking_id = ?').bind(bookingId).all()).results;
     if(!existingRows.length)return json({error:'Session not found.'},404);
     const bookingRow=bookingRows[0],updatedAt=new Date().toISOString(),remarks=b.remarks.trim();
     // Google Sheets is the authoritative progress store: the save must reach it successfully
     // before we touch Supabase or report success to the client. Never show "saved" if this fails.
     try{
      await upsertSheetRow(env,{bookingId,date:bookingRow.date,slot:bookingRow.slot,appName:bookingRow.app_name,name:bookingRow.name,company:bookingRow.company,attendance:b.attendance,hoursCompleted:b.hoursCompleted,progressStage:b.progressStage,progressPercent:b.progressPercent,remarks,createdAt:existingRows[0].created_at,updatedAt});
     }catch(sheetErr){
      console.error('Google Sheets sync failed for booking',bookingId,String(sheetErr));
      return json({error:'Progress could not be saved. Please try again.'},502);
     }
     // updated_by intentionally left null: the current auth model is a single shared editor
     // key with no per-admin identity to attribute the change to.
     const result=await db.prepare('UPDATE session_progress SET attendance=?, hours_completed=?, progress_stage=?, progress_percent=?, remarks=?, updated_at=? WHERE booking_id=?').bind(b.attendance,b.hoursCompleted,b.progressStage,b.progressPercent,remarks,updatedAt,bookingId).run();
     if((result.meta?.changes??result.changes)===0){
      // The authoritative Sheet write already succeeded; a mirror-update miss here is logged,
      // not treated as a failed save (the next successful save will bring Supabase back in sync).
      console.error('Supabase session_progress mirror update matched no row for booking',bookingId);
     }
     return json({bookingId,attendance:b.attendance,hoursCompleted:b.hoursCompleted,progressStage:b.progressStage,progressPercent:b.progressPercent,remarks,updatedAt});
    }
    return json({error:'Not found'},404);
   }
   if(url.pathname==='/api/session'){
    if(request.method!=='GET')return json({error:'Method not allowed'},405);
    const bookingId=url.searchParams.get('id')||'';
    if(!uuidPattern.test(bookingId))return json({error:'Malformed booking ID.'},400);
    const bookingRows=(await db.prepare('SELECT id, app_name, name, date, slot FROM bookings WHERE id = ?').bind(bookingId).all()).results;
    if(!bookingRows.length)return json({error:'Booking not found.'},404);
    const progressRows=(await db.prepare('SELECT progress_stage, progress_percent FROM session_progress WHERE booking_id = ?').bind(bookingId).all()).results;
    if(!progressRows.length)return json({error:'Session not found.'},404);
    const booking=bookingRows[0],progress=progressRows[0];
    // Deliberately excludes phone, email, company and remarks -- this response is public and
    // unauthenticated, so only non-sensitive fields are ever selected/returned, server-side.
    return json({id:booking.id,name:booking.name,appName:booking.app_name,date:booking.date,slot:booking.slot,progressStage:progress.progress_stage,progressPercent:progress.progress_percent});
   }
   if(url.pathname==='/api/schedule'&&request.method==='GET'){
    const appId=url.searchParams.get('appId');if(!validApps.has(appId))return json({error:'Choose a valid application.'},400);
    const entries=appSchedule[appId].filter(({date})=>isValidDate(date));if(!entries.length)return json({days:[]});
    const dates=entries.map(({date})=>date);
    const rows=await db.prepare('SELECT date, slot, visible, active FROM availability WHERE date >= ? AND date <= ?').bind(dates[0],dates.at(-1)).all();
    return json({days:entries.map(({date,slot})=>{const setting=rows.results.find(r=>r.date===date&&r.slot===slot);return {date,visible:!setting||!!setting.visible,active:!setting||!!setting.active}}).filter(d=>d.visible)});
   }
   if(url.pathname==='/api/availability'&&request.method==='GET'){
    const date=url.searchParams.get('date'),appId=url.searchParams.get('appId');if(!validApps.has(appId)||!isValidDate(date,new Date(),appId))return json({error:'Choose an available date for this application.'},400);
    // No occupancy limit: a slot's availability depends only on the editor's visible/active flags
    // and whether its time has passed, never on how many people have already booked it.
    const settings=(await db.prepare('SELECT slot, visible, active FROM availability WHERE date = ?').bind(date).all()).results;
    return json({date,slots:appSchedule[appId].filter(entry=>entry.date===date).map(({slot})=>({time:slot,visible:settings.find(r=>r.slot===slot)?.visible!==0,available:settings.find(r=>r.slot===slot)?.visible!==0&&settings.find(r=>r.slot===slot)?.active!==0&&+new Date(date+'T'+slot+':00+05:30')>Date.now()}))});
   }
   if(url.pathname==='/api/bookings'&&request.method==='POST'){
    if(request.headers.get('Origin')!==url.origin)return json({error:'Please book from this application.'},403);
    if(!request.headers.get('Content-Type')?.includes('application/json'))return json({error:'JSON required.'},415);
    const raw=await request.text();if(raw.length>4096)return json({error:'Request too large.'},413);
    let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}
    const error=validateBooking(b);if(error)return json({error},400);
    const id=crypto.randomUUID(),appName=appNames[b.appId],createdAt=new Date().toISOString();
    // No occupancy limit: any number of different people may book the same app+date+slot.
    // The unique index on (app_id, date, slot, email) only guards against the SAME person
    // accidentally double-submitting; it is not a capacity check.
    try{
     const saved=await db.prepare('INSERT INTO bookings (id, app_id, app_name, date, slot, name, phone, email, company, created_at) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM availability WHERE date = ? AND slot = ? AND (visible = 0 OR active = 0))').bind(id,b.appId,appName,b.date,b.slot,b.name.trim(),b.phone.trim(),b.email.trim().toLowerCase(),b.company.trim(),createdAt,b.date,b.slot).run();
     if((saved.meta?.changes??saved.changes)===0)return json({error:'This slot is no longer available. Please choose another time.'},409);
     // Every booking must have exactly one session_progress row. In production this is created
     // atomically inside book_session() itself (see supabase/schema.sql) -- if that insert fails,
     // the whole booking rolls back there, so we never reach this point with an inconsistent
     // state. This call is a deliberately idempotent (NOT EXISTS-guarded) safety net: it's the
     // ONLY place the row gets created for local/dev SQLite (which has no stored procedure), and
     // a harmless no-op in production where the row already exists. If it fails here, we do not
     // return a successful booking -- the visitor sees an error rather than a booking with no
     // session_progress record. created_at/updated_at are passed explicitly (matching the same
     // timestamp as the booking) rather than relying on a DB-level default.
     try{await db.prepare('INSERT INTO session_progress (booking_id, created_at, updated_at) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM session_progress WHERE booking_id = ?)').bind(id,createdAt,createdAt,id).run()}
     catch(spErr){console.error('Failed to create session_progress for booking',id,String(spErr));return json({error:'Booking could not be completed. Please try again.'},503)}
    }
    catch(e){if(String(e).includes('UNIQUE constraint'))return json({error:"You've already booked this application's session for this date and time."},409);throw e}
    return json({id,appId:b.appId,appName,date:b.date,slot:b.slot},201);
   }
   return json({error:'Not found'},404);
  }catch(e){console.error('Booking API failed:',String(e));return json({error:'Booking is temporarily unavailable. Please try again shortly.'},503)}
 }
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 const asset=assets[url.pathname==='/'?'/index.html':url.pathname];
 if(!asset)return new Response('Not found',{status:404});
 return new Response(request.method==='HEAD'?null:asset.body,{headers:{'Content-Type':asset.type,'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Cache-Control':'no-cache'}});
}};
