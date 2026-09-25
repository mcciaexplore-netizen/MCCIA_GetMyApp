const validApps = new Set(['dispatch-flow','tendersetu','gst-reconciliation','card-scanner','social-media-planner','digital-profile-creator','mr-wasooli','hr-studio','stocklist','minicrm',"compliance-calender","ai-procurement-agent","production-saathi"]);
// Trusted appId -> display name map. Never take app_name from the request body; always derive it from here.
const appNames = {
 'dispatch-flow':'Dispatch Flow','tendersetu':'TenderSetu','gst-reconciliation':'GST Reconciliation',
 'card-scanner':'Card Scanner','social-media-planner':'Social Media Planner','digital-profile-creator':'Digital Profile Creator',
 'mr-wasooli':'Payment Followup Agent','hr-studio':'HR Studio','stocklist':'Stocklist','minicrm':'MiniCRM',
 'compliance-calender':'Compliance Calender',
 'ai-procurement-agent':'AI Procurement Agent','production-saathi':'Production Saathi'
};
// Maximum simultaneous bookings for one app+date+slot (a "session"). Deliberately a total count,
// not a distinct-company count -- company is free text (typos/casing vary) and isn't a safe key
// to dedupe on.
const SESSION_CAPACITY = 3;
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
 'minicrm':[{date:'2026-10-01',slot:'15:30'},{date:'2026-10-09',slot:'11:00'},{date:'2026-10-03',slot:'11:00'},{date:'2026-10-06',slot:'15:30'}],
 'compliance-calender':[{date:'2026-10-09',slot:'14:30'}],
 'ai-procurement-agent':[{date:'2026-10-03',slot:'14:30'},{date:'2026-10-08',slot:'15:30'}],
 'production-saathi':[{date:'2026-10-03',slot:'15:30'},{date:'2026-10-05',slot:'14:30'}]
};
const eventDates = [...new Set(Object.values(appSchedule).flat().map(({date})=>date))].sort();
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})}
export function isValidDate(date,now=new Date(),appId=null){
 const today=new Date(+now+19800000).toISOString().slice(0,10);
 return (appId?appSchedule[appId]?.some(entry=>entry.date===date):eventDates.includes(date))&&date>=today;
}
function isFutureDate(date,now=new Date()){return date>=new Date(+now+19800000).toISOString().slice(0,10)}
// Admin-added dates/slots (app_schedule_extra) layer on top of the hardcoded appSchedule above --
// this never replaces it, just extends it per app, so the studio can add a new session date for
// an app from the Availability page without a code change. Used everywhere a caller previously
// read appSchedule[appId] directly.
async function resolveAppSchedule(db,appId){
 const extra=(await db.prepare('SELECT date, slot FROM app_schedule_extra WHERE app_id = ?').bind(appId).all()).results;
 return [...(appSchedule[appId]||[]),...extra.map(r=>({date:r.date,slot:r.slot}))];
}
async function resolveEventDates(db){
 const extra=(await db.prepare('SELECT date FROM app_schedule_extra').bind().all()).results;
 return [...new Set([...eventDates,...extra.map(r=>r.date)])].sort();
}
async function isValidEventDate(db,date,now=new Date()){
 if(!date)return false;
 return (await resolveEventDates(db)).includes(date)&&isFutureDate(date,now);
}
export function validateBooking(b,now=new Date(),scheduleEntries){
 const entries=scheduleEntries||(b&&appSchedule[b.appId]);
 if(!b||typeof b!=='object'||!validApps.has(b.appId)||!entries?.some(entry=>entry.date===b.date&&entry.slot===b.slot)||!isFutureDate(b.date,now))return 'Please choose the scheduled date and time for this application.';
 if(+new Date(b.date+'T'+b.slot+':00+05:30')<=+now)return 'This slot has already started. Please choose a later slot.';
 if(typeof b.name!=='string'||b.name.trim().length<2||b.name.length>100)return 'Enter your full name (2–100 characters).';
 const phoneDigits=typeof b.phone==='string'?b.phone.replace(/\D/g,''):'';
 if(typeof b.phone!=='string'||phoneDigits.length<7||phoneDigits.length>15||!/^\+?[\d\s().-]+$/.test(b.phone))return 'Enter a valid phone number with 7–15 digits.';
 if(typeof b.email!=='string'||b.email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))return 'Enter a valid email address.';
 if(typeof b.company!=='string'||b.company.length>150)return 'Company must be 150 characters or fewer.';
 if(typeof b.memberId!=='string'||!b.memberId.trim()||b.memberId.trim().length>50)return 'Enter your member ID (1–50 characters).';
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
const EMAIL_TIME_LABELS={'11:00':'11:00 AM – 12:00 PM','14:30':'2:30 PM – 3:30 PM','15:30':'3:30 PM – 4:30 PM'};
function emailFormatDate(dateStr){
 try{return new Date(dateStr+'T12:00:00+05:30').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kolkata'})}
 catch{return dateStr||''}
}
// Builds the subject/text for one of three email kinds, mirroring what Apps Script's own
// sendBookingEmail() builds for the webhook fallback path -- kept in sync manually since they're
// two different environments with no shared module.
function bookingEmailContent(b){
 const dateLabel=emailFormatDate(b.date),timeLabel=EMAIL_TIME_LABELS[b.slot]||b.slot||'';
 if(b.type==='studio-notification'){
  return {subject:'New booking — '+(b.appName||'')+' · '+(b.name||''),text:'A new session was booked at MCCIA Applied AI Studio:\n\n'+
   'Participant: '+(b.name||'')+'\n'+'Company: '+(b.company||'')+'\n'+'Member ID: '+(b.memberId||'')+'\n'+'Phone: '+(b.phone||'')+'\n'+'Email: '+(b.email||'')+'\n'+
   'Application: '+(b.appName||'')+'\n'+'Date: '+dateLabel+'\n'+'Time: '+timeLabel+' IST\n'};
 }
 const isReschedule=b.type==='reschedule';
 return {
  subject:isReschedule?'Your MCCIA Applied AI Studio session has a new date/time — '+(b.appName||''):'Your MCCIA Applied AI Studio session is confirmed — '+(b.appName||''),
  text:'Hi '+(b.name||'there')+',\n\n'+(isReschedule?'Your session at MCCIA Applied AI Studio has been rescheduled. The new details are:\n\n':'Your session at MCCIA Applied AI Studio is reserved:\n\n')+
   'Application: '+(b.appName||'')+'\n'+'Date: '+dateLabel+'\n'+'Time: '+timeLabel+' IST\n\n'+'See you at the studio!\n\n'+'MCCIA Applied AI Studio'
 };
}
// Sends the visitor a booking confirmation (or reschedule notice, when booking.type==='reschedule',
// or a studio-notification when booking.type==='studio-notification'). Uses SMTP directly
// (env.sendMailSMTP, injected by api/[...path].js when SMTP_* env vars are configured) when
// available; otherwise falls back to the Apps Script webhook used for the Sheet sync. Best-effort
// either way: callers must catch and log failures here rather than let them affect the booking
// response -- confirmation email is a convenience, not authoritative data.
async function sendBookingEmail(env,booking){
 if(env.sendMailSMTP){
  const {subject,text}=bookingEmailContent(booking);
  await env.sendMailSMTP({to:booking.to,subject,text});
  return;
 }
 if(!env.GOOGLE_SHEETS_WEBHOOK_URL||!env.GOOGLE_SHEETS_WEBHOOK_SECRET)return;
 const res=await fetch(env.GOOGLE_SHEETS_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.GOOGLE_SHEETS_WEBHOOK_SECRET,action:'SEND_BOOKING_EMAIL',booking})});
 let data;try{data=await res.json()}catch{throw new Error('Email service returned an unexpected response.')}
 if(!res.ok||!data.success)throw new Error(data.error||'Confirmation email could not be sent.');
}
// Removes a booking's row from the master Google Sheet after an admin deletes it. Best-effort --
// the booking is already gone from the database regardless of whether this succeeds, and callers
// only log a failure here. Deliberately separate from sendBookingEmail: deleting a booking must
// never email the visitor.
async function deleteSheetRow(env,bookingId){
 if(!env.GOOGLE_SHEETS_WEBHOOK_URL||!env.GOOGLE_SHEETS_WEBHOOK_SECRET)return;
 const res=await fetch(env.GOOGLE_SHEETS_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.GOOGLE_SHEETS_WEBHOOK_SECRET,action:'DELETE_SESSION',bookingId})});
 let data;try{data=await res.json()}catch{throw new Error('Google Sheets sync returned an unexpected response.')}
 if(!res.ok||!data.success)throw new Error(data.error||'Google Sheets row delete failed.');
}
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname.startsWith('/api/')){
  try{
   const db=database(env);
   // IMPORTANT: every route below is a single path segment under /api/ (e.g. /api/editor-session,
   // never /api/editor/session). This was confirmed in production: /api/schedule and /api/bookings
   // (single segment) are reached by this function correctly, while /api/editor/session (two
   // segments) returns Vercel's own platform 404 page before ever reaching this code -- proven by
   // testing all three URLs directly in a browser. This is a routing quirk specific to multi-
   // segment paths under /api/ on this deployment, not an application bug: every branch in this
   // file already returns valid JSON. Flattening every route to one segment (using query params
   // for anything a nested segment used to carry) avoids the problem entirely.
   if(url.pathname.startsWith('/api/editor-')) {
    // Trimmed defensively: a trailing space/newline picked up when pasting the key into the
    // Vercel dashboard, or when copying it into the sign-in form, would otherwise silently
    // produce a mismatch here with no way to tell from the "Invalid editor access key" message.
    const editorAccessKey=(env.EDITOR_ACCESS_KEY||'').trim();
    if(!editorAccessKey || editorAccessKey.length<8) return json({error:'Editor access has not been configured. Contact the studio owner.'},503);
    const token=(request.headers.get('Authorization')?.replace(/^Bearer /,'')||'').trim();
    const hash=async value=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
    const [actual,expected]=await Promise.all([hash(token),hash(editorAccessKey)]);let diff=0;for(let i=0;i<actual.length;i++)diff|=actual[i]^expected[i];
    if(diff!==0)return json({error:'Invalid editor access key.'},401);
    if(url.pathname==='/api/editor-session'&&request.method==='GET')return json({role:'editor'});
    if(url.pathname==='/api/editor-sessions'&&request.method==='GET'){
     // Admin-only list combining bookings with their session_progress row. Two queries + a
     // JS-side merge, matching the same pattern already used for the public GET /api/session
     // and for the availability GET above, rather than introducing join support into the DB layer.
     const bookingRows=(await db.prepare('SELECT id, app_id, app_name, name, phone, email, company, member_id, date, slot FROM bookings ORDER BY date, slot').bind().all()).results;
     const progressRows=(await db.prepare('SELECT booking_id, attendance, hours_completed, progress_stage, progress_percent, remarks FROM session_progress').bind().all()).results;
     const progressByBooking=new Map(progressRows.map(p=>[p.booking_id,p]));
     return json({sessions:bookingRows.map(b=>{const p=progressByBooking.get(b.id)||{};return {id:b.id,appId:b.app_id,name:b.name,phone:b.phone,email:b.email,appName:b.app_name,company:b.company,memberId:b.member_id,date:b.date,slot:b.slot,attendance:p.attendance||'Not Marked',hoursCompleted:p.hours_completed??0,progressStage:p.progress_stage||'Not Started',progressPercent:p.progress_percent??0,remarks:p.remarks||''}})});
    }
    if(url.pathname==='/api/editor-schedule'&&request.method==='GET'){
     const appId=url.searchParams.get('appId');
     const dates=await resolveEventDates(db);
     if(!appId)return json({apps:[...validApps].map(id=>({id,name:appNames[id]})),dates});
     if(!validApps.has(appId))return json({error:'Choose a valid application.'},400);
     const custom=(await db.prepare('SELECT date, slot FROM app_schedule_extra WHERE app_id = ?').bind(appId).all()).results;
     const schedule=[...appSchedule[appId].map(e=>({...e,custom:false})),...custom.map(e=>({date:e.date,slot:e.slot,custom:true}))].sort((a,b)=>a.date.localeCompare(b.date)||a.slot.localeCompare(b.slot));
     return json({schedule,dates});
    }
    if(url.pathname==='/api/editor-schedule'&&request.method==='POST'){
     if(request.headers.get('Origin')!==url.origin)return json({error:'Use the studio editor page.'},403);
     const raw=await request.text();if(raw.length>4096)return json({error:'Request too large.'},413);let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}
     if(!validApps.has(b.appId))return json({error:'Choose a valid application.'},400);
     if(typeof b.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(b.date)||!isFutureDate(b.date))return json({error:'Choose today or a future date.'},400);
     if(typeof b.slot!=='string'||!slots.includes(b.slot))return json({error:'Choose one of the studio\'s three session times.'},400);
     const existing=await resolveAppSchedule(db,b.appId);
     if(existing.some(e=>e.date===b.date&&e.slot===b.slot))return json({error:'This application already has a session at that date and time.'},409);
     await db.prepare('INSERT INTO app_schedule_extra (app_id, date, slot, created_at) VALUES (?, ?, ?, ?)').bind(b.appId,b.date,b.slot,new Date().toISOString()).run();
     const schedule=[...appSchedule[b.appId].map(e=>({...e,custom:false})),...(await db.prepare('SELECT date, slot FROM app_schedule_extra WHERE app_id = ?').bind(b.appId).all()).results.map(e=>({date:e.date,slot:e.slot,custom:true}))].sort((a,b2)=>a.date.localeCompare(b2.date)||a.slot.localeCompare(b2.slot));
     return json({schedule,dates:await resolveEventDates(db)},201);
    }
    if(url.pathname==='/api/editor-availability'&&request.method==='GET') {
     const date=url.searchParams.get('date');if(!(await isValidEventDate(db,date)))return json({error:'Choose one of the scheduled application dates.'},400);
     const records=await db.prepare('SELECT slot, visible, active FROM availability WHERE date = ?').bind(date).all();
     const bookings=await db.prepare('SELECT slot FROM bookings WHERE date = ?').bind(date).all();
     return json({slots:slots.map(time=>{const row=records.results.find(r=>r.slot===time);return {time,visible:row?!!row.visible:true,active:row?!!row.active:true,booked:bookings.results.some(r=>r.slot===time)}})});
    }
    if(url.pathname==='/api/editor-availability'&&request.method==='PUT'){
     if(request.headers.get('Origin')!==url.origin)return json({error:'Use the studio editor page.'},403);
     const raw=await request.text();if(raw.length>4096)return json({error:'Request too large.'},413);let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}
     if(!(await isValidEventDate(db,b.date))||!Array.isArray(b.slots)||b.slots.length!==slots.length||new Set(b.slots.map(s=>s.time)).size!==slots.length||b.slots.some(s=>!slots.includes(s.time)||typeof s.visible!=='boolean'||typeof s.active!=='boolean'))return json({error:'Invalid availability settings.'},400);
     await db.batch(b.slots.map(s=>db.prepare('INSERT INTO availability (date, slot, visible, active) VALUES (?, ?, ?, ?) ON CONFLICT(date, slot) DO UPDATE SET visible=excluded.visible, active=excluded.active').bind(b.date,s.time,Number(s.visible),Number(s.active))));
     return json({saved:true});
    }
    if(url.pathname==='/api/editor-session'&&request.method==='PATCH'){
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
     const bookingRows=(await db.prepare('SELECT app_name, name, company, member_id, date, slot FROM bookings WHERE id = ?').bind(bookingId).all()).results;
     if(!bookingRows.length)return json({error:'Booking not found.'},404);
     const existingRows=(await db.prepare('SELECT created_at FROM session_progress WHERE booking_id = ?').bind(bookingId).all()).results;
     if(!existingRows.length)return json({error:'Session not found.'},404);
     const bookingRow=bookingRows[0],updatedAt=new Date().toISOString(),remarks=b.remarks.trim();
     // Google Sheets is the authoritative progress store: the save must reach it successfully
     // before we touch Supabase or report success to the client. Never show "saved" if this fails.
     try{
      await upsertSheetRow(env,{bookingId,date:bookingRow.date,slot:bookingRow.slot,appName:bookingRow.app_name,name:bookingRow.name,company:bookingRow.company,memberId:bookingRow.member_id,attendance:b.attendance,hoursCompleted:b.hoursCompleted,progressStage:b.progressStage,progressPercent:b.progressPercent,remarks,createdAt:existingRows[0].created_at,updatedAt});
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
    if(url.pathname==='/api/editor-session'&&request.method==='DELETE'){
     if(request.headers.get('Origin')!==url.origin)return json({error:'Use the studio editor page.'},403);
     const bookingId=url.searchParams.get('id')||'';
     if(!uuidPattern.test(bookingId))return json({error:'Malformed booking ID.'},400);
     // Deleting the booking row cascades to session_progress (see supabase/schema.sql's
     // on-delete-cascade foreign key) and immediately frees the (app_id, date, slot, email)
     // unique index, so the same visitor can book this exact app/date/slot again right away.
     // Deliberately sends no email -- deleting a booking must never notify the visitor.
     const result=await db.prepare('DELETE FROM bookings WHERE id = ?').bind(bookingId).run();
     if((result.meta?.changes??result.changes)===0)return json({error:'Booking not found.'},404);
     try{await deleteSheetRow(env,bookingId)}
     catch(sheetErr){console.error('Google Sheets row delete failed for booking',bookingId,String(sheetErr))}
     return json({deleted:true});
    }
    if(url.pathname==='/api/editor-booking'&&request.method==='PATCH'){
     if(request.headers.get('Origin')!==url.origin)return json({error:'Use the studio editor page.'},403);
     const bookingId=url.searchParams.get('id')||'';
     if(!uuidPattern.test(bookingId))return json({error:'Malformed booking ID.'},400);
     if(!request.headers.get('Content-Type')?.includes('application/json'))return json({error:'JSON required.'},415);
     const raw=await request.text();if(raw.length>4096)return json({error:'Request too large.'},413);
     let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}
     const bookingRows=(await db.prepare('SELECT app_id, app_name, name, company, email, member_id, date, slot FROM bookings WHERE id = ?').bind(bookingId).all()).results;
     if(!bookingRows.length)return json({error:'Booking not found.'},404);
     const booking=bookingRows[0];
     // Reschedule targets must still be one of the app's own scheduled date/time combinations
     // (built-in or admin-added) -- this moves a visitor to a different existing slot, not a way
     // to invent new ones (use POST /api/editor-schedule to add a new slot first).
     const targetSchedule=await resolveAppSchedule(db,booking.app_id);
     if(typeof b.date!=='string'||typeof b.slot!=='string'||!targetSchedule.some(entry=>entry.date===b.date&&entry.slot===b.slot))return json({error:'Choose one of the scheduled date/time combinations for this application.'},400);
     if(b.date===booking.date&&b.slot===booking.slot)return json({error:'That is already the current date and time.'},400);
     const progressRows=(await db.prepare('SELECT attendance, hours_completed, progress_stage, progress_percent, remarks, created_at FROM session_progress WHERE booking_id = ?').bind(bookingId).all()).results;
     if(!progressRows.length)return json({error:'Session not found.'},404);
     let updateResult;
     try{updateResult=await db.prepare('UPDATE bookings SET date=?, slot=? WHERE id=?').bind(b.date,b.slot,bookingId).run()}
     catch(e){if(String(e).includes('UNIQUE constraint'))return json({error:'This visitor already has a booking for that date and time.'},409);throw e}
     if((updateResult.meta?.changes??updateResult.changes)===0)return json({error:'Booking not found.'},404);
     const progress=progressRows[0],updatedAt=new Date().toISOString();
     // Best-effort Sheet sync -- the reschedule itself is already committed in bookings above;
     // a Sheet-sync failure here is logged, not treated as a failed reschedule.
     try{await upsertSheetRow(env,{bookingId,date:b.date,slot:b.slot,appName:booking.app_name,name:booking.name,company:booking.company,memberId:booking.member_id,attendance:progress.attendance,hoursCompleted:progress.hours_completed,progressStage:progress.progress_stage,progressPercent:progress.progress_percent,remarks:progress.remarks,createdAt:progress.created_at,updatedAt})}
     catch(sheetErr){console.error('Google Sheets sync failed after reschedule for booking',bookingId,String(sheetErr))}
     let emailSent=true;
     try{await sendBookingEmail(env,{to:booking.email,name:booking.name,appName:booking.app_name,date:b.date,slot:b.slot,type:'reschedule'})}
     catch(emailErr){emailSent=false;console.error('Reschedule email failed for',bookingId,String(emailErr))}
     return json({bookingId,date:b.date,slot:b.slot,emailSent});
    }
    return json({error:'Not found'},404);
   }
   if(url.pathname==='/api/progress'&&request.method==='GET'){
    // Public, unauthenticated, shared across every visitor -- deliberately excludes name, date,
    // slot, phone, email and remarks. Only company + application + progress, so seeing this list
    // never identifies a specific person, matching what was explicitly asked for this view.
    const bookingRows=(await db.prepare('SELECT id, app_name, company FROM bookings').bind().all()).results;
    const progressRows=(await db.prepare('SELECT booking_id, progress_stage, progress_percent FROM session_progress').bind().all()).results;
    const progressByBooking=new Map(progressRows.map(p=>[p.booking_id,p]));
    return json({sessions:bookingRows.map(b=>{const p=progressByBooking.get(b.id)||{};return {appName:b.app_name,company:b.company,progressStage:p.progress_stage||'Not Started',progressPercent:p.progress_percent??0}})});
   }
   if(url.pathname==='/api/member-sessions'&&request.method==='GET'){
    // Public, but requires BOTH the member ID and the email used at booking time to match --
    // Member ID alone is short and guessable, so pairing it with the email (which the visitor
    // already knows from booking) prevents casually enumerating other members' bookings.
    const memberId=(url.searchParams.get('memberId')||'').trim();
    const email=(url.searchParams.get('email')||'').trim().toLowerCase();
    if(!memberId||!email)return json({error:'Enter your Member ID and email.'},400);
    const bookingRows=(await db.prepare('SELECT id, app_name, date, slot FROM bookings WHERE member_id = ? AND email = ?').bind(memberId,email).all()).results;
    if(!bookingRows.length)return json({sessions:[]});
    const progressRows=(await db.prepare('SELECT booking_id, attendance, progress_stage, progress_percent FROM session_progress').bind().all()).results;
    const progressByBooking=new Map(progressRows.map(p=>[p.booking_id,p]));
    return json({sessions:bookingRows.map(b=>{const p=progressByBooking.get(b.id)||{};return {id:b.id,appName:b.app_name,date:b.date,slot:b.slot,attendance:p.attendance||'Not Marked',progressStage:p.progress_stage||'Not Started',progressPercent:p.progress_percent??0}}).sort((a,b)=>a.date.localeCompare(b.date)||a.slot.localeCompare(b.slot))});
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
    const entries=(await resolveAppSchedule(db,appId)).filter(({date})=>isFutureDate(date));if(!entries.length)return json({days:[]});
    // Some apps (e.g. minicrm) have more than one slot on the same date -- dedupe to one day
    // entry per date, since this endpoint feeds the day-picker, not the per-slot list (that's
    // /api/availability). A day counts as visible/active if ANY of its slots are.
    const dates=[...new Set(entries.map(({date})=>date))].sort();
    const rows=await db.prepare('SELECT date, slot, visible, active FROM availability WHERE date >= ? AND date <= ?').bind(dates[0],dates.at(-1)).all();
    const days=dates.map(date=>{
     const perSlot=entries.filter(e=>e.date===date).map(({slot})=>{const setting=rows.results.find(r=>r.date===date&&r.slot===slot);return {visible:!setting||!!setting.visible,active:!setting||!!setting.active}});
     return {date,visible:perSlot.some(s=>s.visible),active:perSlot.some(s=>s.visible&&s.active)};
    }).filter(d=>d.visible);
    return json({days});
   }
   if(url.pathname==='/api/availability'&&request.method==='GET'){
    const date=url.searchParams.get('date'),appId=url.searchParams.get('appId');if(!validApps.has(appId))return json({error:'Choose an available date for this application.'},400);
    const appScheduleEntries=await resolveAppSchedule(db,appId);
    if(!appScheduleEntries.some(e=>e.date===date)||!isFutureDate(date))return json({error:'Choose an available date for this application.'},400);
    // A slot is available when the editor's visible/active flags allow it, its time hasn't
    // passed, AND fewer than SESSION_CAPACITY people have already booked it for this app.
    const settings=(await db.prepare('SELECT slot, visible, active FROM availability WHERE date = ?').bind(date).all()).results;
    const existingBookings=(await db.prepare('SELECT slot FROM bookings WHERE app_id = ? AND date = ?').bind(appId,date).all()).results;
    const bookedCounts={};for(const row of existingBookings)bookedCounts[row.slot]=(bookedCounts[row.slot]||0)+1;
    return json({date,slots:appScheduleEntries.filter(entry=>entry.date===date).map(({slot})=>{
     const visible=settings.find(r=>r.slot===slot)?.visible!==0,active=settings.find(r=>r.slot===slot)?.active!==0;
     const full=(bookedCounts[slot]||0)>=SESSION_CAPACITY;
     return {time:slot,visible,full,available:visible&&active&&!full&&+new Date(date+'T'+slot+':00+05:30')>Date.now()};
    })});
   }
   if(url.pathname==='/api/bookings'&&request.method==='POST'){
    if(request.headers.get('Origin')!==url.origin)return json({error:'Please book from this application.'},403);
    if(!request.headers.get('Content-Type')?.includes('application/json'))return json({error:'JSON required.'},415);
    const raw=await request.text();if(raw.length>4096)return json({error:'Request too large.'},413);
    let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}
    const error=validateBooking(b,new Date(),b&&typeof b==='object'&&validApps.has(b.appId)?await resolveAppSchedule(db,b.appId):undefined);if(error)return json({error},400);
    const id=crypto.randomUUID(),appName=appNames[b.appId],email=b.email.trim().toLowerCase(),createdAt=new Date().toISOString();
    // Checked explicitly, and BEFORE the capacity-guarded insert below: once a slot is at
    // SESSION_CAPACITY, the same email re-submitting would otherwise be rejected as "full"
    // instead of the more accurate "you already booked this" -- the capacity WHERE guard alone
    // can't distinguish the two once the slot has no room left.
    const existing=(await db.prepare('SELECT 1 FROM bookings WHERE app_id = ? AND date = ? AND slot = ? AND email = ?').bind(b.appId,b.date,b.slot,email).all()).results;
    if(existing.length)return json({error:"You've already booked this application's session for this date and time."},409);
    try{
     const saved=await db.prepare('INSERT INTO bookings (id, app_id, app_name, date, slot, name, phone, email, company, member_id, created_at) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM availability WHERE date = ? AND slot = ? AND (visible = 0 OR active = 0)) AND (SELECT COUNT(*) FROM bookings WHERE app_id = ? AND date = ? AND slot = ?) < '+SESSION_CAPACITY).bind(id,b.appId,appName,b.date,b.slot,b.name.trim(),b.phone.trim(),email,b.company.trim(),b.memberId.trim(),createdAt,b.date,b.slot,b.appId,b.date,b.slot).run();
     if((saved.meta?.changes??saved.changes)===0)return json({error:'This slot is full or no longer available. Please choose another time.'},409);
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
     // Best-effort booking confirmation email to the visitor. Never blocks or fails the booking --
     // a visitor's reservation must not depend on an email provider being reachable.
     try{await sendBookingEmail(env,{to:email,name:b.name.trim(),appName,date:b.date,slot:b.slot})}
     catch(emailErr){console.error('Booking confirmation email failed for',id,String(emailErr))}
     // Best-effort notification to the studio, if configured. Unlike the visitor email, this one
     // carries every field the studio would want (phone, email, company, member ID) -- it's an
     // internal notice, not something shown to the visitor.
     if(env.STUDIO_NOTIFICATION_EMAIL){
      try{await sendBookingEmail(env,{to:env.STUDIO_NOTIFICATION_EMAIL,type:'studio-notification',name:b.name.trim(),phone:b.phone.trim(),email,company:b.company.trim(),memberId:b.memberId.trim(),appName,date:b.date,slot:b.slot})}
      catch(emailErr){console.error('Studio notification email failed for',id,String(emailErr))}
     }
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
