import {test,mock} from 'node:test';
mock.timers.enable({apis:['Date'],now:new Date('2026-09-18T04:00:00Z')});
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import worker,{validateBooking,isValidDate} from '../server/worker.js';
import {supabaseDatabase} from '../server/supabase.js';

const now=new Date('2026-09-17T04:00:00Z');
const booking={appId:'stocklist',date:'2026-10-01',slot:'14:30',name:'Test User',phone:'+91 98765 43210',email:'test@example.com',company:'Test'};
const request=(path,method='GET',body,auth)=>new Request('https://studio.test/api/'+path,{method,headers:{Origin:'https://studio.test','Content-Type':'application/json',...(auth?{Authorization:'Bearer '+auth}:{})},...(body?{body:JSON.stringify(body)}:{})});
function testDatabase(){const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync('drizzle/0000_soft_ulik.sql','utf8'));db.exec(fs.readFileSync('drizzle/0001_sour_blonde_phantom.sql','utf8'));return db}
function databaseAdapter(db){return {async batch(statements){db.exec('BEGIN');try{for(const s of statements)await s.run();db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}},prepare(sql){return{bind(...v){return{async all(){return{results:db.prepare(sql).all(...v)}},async run(){return db.prepare(sql).run(...v)}}}}}}}
const bookingInsertSql='INSERT INTO bookings (id, app_id, app_name, date, slot, name, phone, email, company, created_at) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM availability WHERE date = ? AND slot = ? AND (visible = 0 OR active = 0))';
const editorKey='test-editor-key-with-at-least-32-characters';
const sheetsEnv={GOOGLE_SHEETS_WEBHOOK_URL:'https://script.google.com/macros/test/exec',GOOGLE_SHEETS_WEBHOOK_SECRET:'test-sheets-secret-at-least-32-characters'};
function mockSheetsFetch(shouldSucceed,errorMessage){
 const original=global.fetch,calls=[];
 global.fetch=async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify(shouldSucceed?{success:true}:{success:false,error:errorMessage||'Sheet unavailable'}),{status:200})};
 return {calls,restore(){global.fetch=original}};
}

test('only assigned application dates, exact slots, and valid contacts are accepted',()=>{
 assert.equal(validateBooking(booking,now),null);
 for(const change of [{date:'2026-09-29'},{date:'2026-09-19'},{slot:'11:00'},{slot:'16:30'},{email:'bad'},{appId:'unknown'},{date:'2026-02-31'},{phone:'123'},{phone:'not a phone!!'}])assert.ok(validateBooking({...booking,...change},now));
 assert.equal(isValidDate('2026-10-01',now,'stocklist'),true);
 assert.equal(isValidDate('2026-10-01',now,'tendersetu'),false);
});

test('each application receives only its assigned dates and exact time slot',async()=>{
 const db=testDatabase(),DB=databaseAdapter(db);
 const schedule=await (await worker.fetch(request('schedule?appId=stocklist'),{DB})).json();
 assert.deepEqual(schedule.days.map(d=>d.date),['2026-10-01','2026-10-07']);
 const available=await (await worker.fetch(request('availability?date=2026-10-01&appId=stocklist'),{DB})).json();
 assert.deepEqual(available.slots.map(s=>s.time),['14:30']);
 assert.ok(available.slots.every(s=>s.available));
 assert.equal((await worker.fetch(request('availability?date=2026-10-01&appId=tendersetu'),{DB})).status,400);
 db.close();
});

test('different people can book the same app/date/slot; the same person cannot duplicate it',async()=>{
 const db=testDatabase(),DB=databaseAdapter(db);
 const first=await worker.fetch(request('bookings','POST',booking),{DB});assert.equal(first.status,201);
 const second=await worker.fetch(request('bookings','POST',{...booking,email:'second-person@example.com'}),{DB});assert.equal(second.status,201);
 const third=await worker.fetch(request('bookings','POST',{...booking,email:'ThirdPerson@Example.com'}),{DB});assert.equal(third.status,201);
 // Same email (case/whitespace-insensitive) booking the same app+date+slot again is rejected as a duplicate, not treated as capacity exhaustion.
 const duplicate=await worker.fetch(request('bookings','POST',booking),{DB});assert.equal(duplicate.status,409);
 assert.match((await duplicate.json()).error,/already booked/i);
 // Slot must remain available after multiple people have booked it — there is no occupancy limit.
 const response=await (await worker.fetch(request('availability?date=2026-10-01&appId=stocklist'),{DB})).json();
 assert.equal(response.slots.find(s=>s.time==='14:30').available,true);
 assert.equal(JSON.stringify(response).includes(booking.email),false);
 assert.equal((await worker.fetch(request('availability?date=2026-10-01&appId=stocklist'),{})).status,503);
 db.close();
});

test('the duplicate guard is scoped per application, not globally by date/slot',async()=>{
 const db=testDatabase(),now2=new Date().toISOString();
 // Bypass per-app schedule validation to exercise the DB constraint directly: the same person
 // booking two different applications for the identical date+slot must not collide.
 const first=db.prepare(bookingInsertSql).run('id-1','app-a','App A','2026-10-01','14:30','Test User','+91 98765 43210','same-person@example.com','',now2,'2026-10-01','14:30');
 assert.equal(first.changes,1);
 const second=db.prepare(bookingInsertSql).run('id-2','app-b','App B','2026-10-01','14:30','Test User','+91 98765 43210','same-person@example.com','',now2,'2026-10-01','14:30');
 assert.equal(second.changes,1);
 assert.throws(()=>db.prepare(bookingInsertSql).run('id-3','app-a','App A','2026-10-01','14:30','Test User','+91 98765 43210','same-person@example.com','',now2,'2026-10-01','14:30'),/UNIQUE constraint/);
 db.close();
});

test('the server derives app_name from a trusted map and ignores any client-supplied value',async()=>{
 const db=testDatabase(),DB=databaseAdapter(db);
 const res=await worker.fetch(request('bookings','POST',{...booking,appName:'Totally Fake Name'}),{DB});
 assert.equal(res.status,201);
 const body=await res.json();
 assert.equal(body.appName,'Stocklist');
 const row=db.prepare('SELECT app_name, phone FROM bookings WHERE id = ?').get(body.id);
 assert.equal(row.app_name,'Stocklist');
 assert.equal(row.phone,booking.phone);
 db.close();
});

test('editor settings and booking revalidation use the new time slots',async()=>{
 const db=testDatabase(),DB=databaseAdapter(db),env={DB,EDITOR_ACCESS_KEY:editorKey};
 assert.equal((await worker.fetch(request('editor-session'),env)).status,401);
 const settings={date:'2026-10-01',slots:['11:00','14:30','15:30'].map(time=>({time,visible:true,active:time!=='14:30'}))};
 assert.equal((await worker.fetch(request('editor-availability','PUT',settings,editorKey),env)).status,200);
 const available=await (await worker.fetch(request('availability?date=2026-10-01&appId=stocklist'),env)).json();
 assert.deepEqual(available.slots.map(s=>s.available),[false]);
 assert.equal((await worker.fetch(request('bookings','POST',booking),env)).status,409);
 settings.slots.find(s=>s.time==='14:30').active=true;
 assert.equal((await worker.fetch(request('editor-availability','PUT',settings,editorKey),env)).status,200);
 assert.equal((await worker.fetch(request('bookings','POST',booking),env)).status,201);
 db.close();
});

test('a successful booking automatically creates a session_progress row with correct defaults',async()=>{
 const db=testDatabase(),DB=databaseAdapter(db);
 const res=await worker.fetch(request('bookings','POST',booking),{DB});
 assert.equal(res.status,201);
 const {id}=await res.json();
 const row=db.prepare('SELECT * FROM session_progress WHERE booking_id = ?').get(id);
 assert.ok(row,'session_progress row must exist for the new booking');
 assert.equal(row.attendance,'Not Marked');
 assert.equal(row.hours_completed,0);
 assert.equal(row.progress_stage,'Not Started');
 assert.equal(row.progress_percent,0);
 assert.equal(row.remarks,'');
 assert.equal(row.updated_by,null);
 db.close();
});

test('one booking cannot have two session_progress records',async()=>{
 const db=testDatabase(),now2=new Date().toISOString();
 db.prepare(bookingInsertSql).run('id-sp-1','stocklist','Stocklist','2026-10-01','14:30','Test User','+91 98765 43210','one@example.com','',now2,'2026-10-01','14:30');
 db.prepare('INSERT INTO session_progress (booking_id) VALUES (?)').run('id-sp-1');
 assert.throws(()=>db.prepare('INSERT INTO session_progress (booking_id) VALUES (?)').run('id-sp-1'),/UNIQUE constraint/);
 db.close();
});

test('public session GET returns only the allowed fields and never phone/email/company/remarks',async()=>{
 const db=testDatabase(),DB=databaseAdapter(db);
 // company deliberately does NOT overlap with name/appName/etc, so a substring match in the
 // response can only mean the field actually leaked, not an incidental word overlap.
 const privateBooking={...booking,company:'Acme Metalworks Pvt Ltd'};
 const created=await (await worker.fetch(request('bookings','POST',privateBooking),{DB})).json();
 const res=await worker.fetch(request('session?id='+created.id),{DB});
 assert.equal(res.status,200);
 const body=await res.json();
 assert.deepEqual(Object.keys(body).sort(),['appName','date','id','name','progressPercent','progressStage','slot'].sort());
 assert.equal(body.id,created.id);
 assert.equal(body.name,privateBooking.name);
 assert.equal(body.appName,'Stocklist');
 assert.equal(body.progressStage,'Not Started');
 assert.equal(body.progressPercent,0);
 const raw=JSON.stringify(body);
 assert.equal(raw.includes(privateBooking.phone),false);
 assert.equal(raw.includes(privateBooking.email),false);
 assert.equal(raw.includes(privateBooking.company),false);
 db.close();
});

test('public session GET rejects a malformed booking ID and reports a missing booking',async()=>{
 const db=testDatabase(),DB=databaseAdapter(db);
 assert.equal((await worker.fetch(request('session?id=not-a-uuid'),{DB})).status,400);
 assert.equal((await worker.fetch(request('session?id=00000000-0000-4000-8000-000000000000'),{DB})).status,404);
 db.close();
});

test('session progress update is rejected without a valid editor key',async()=>{
 const db=testDatabase(),DB=databaseAdapter(db),env={DB,EDITOR_ACCESS_KEY:editorKey};
 const created=await (await worker.fetch(request('bookings','POST',booking),{DB})).json();
 const update={attendance:'Present',hoursCompleted:1,progressStage:'In Progress',progressPercent:50,remarks:'Doing well'};
 const noAuth=await worker.fetch(request('editor-session?id='+created.id,'PATCH',update),env);
 assert.equal(noAuth.status,401);
 const wrongKey=await worker.fetch(request('editor-session?id='+created.id,'PATCH',update,'wrong-key-that-is-not-correct-at-all'),env);
 assert.equal(wrongKey.status,401);
 db.close();
});

test('authenticated session progress update succeeds, validates fields, bumps updated_at, and reaches Google Sheets',async()=>{
 const db=testDatabase(),DB=databaseAdapter(db),env={DB,EDITOR_ACCESS_KEY:editorKey,...sheetsEnv};
 const created=await (await worker.fetch(request('bookings','POST',booking),{DB})).json();
 const before=db.prepare('SELECT created_at, updated_at FROM session_progress WHERE booking_id = ?').get(created.id);

 const validUpdate={attendance:'Present',hoursCompleted:0.75,progressStage:'In Progress',progressPercent:50,remarks:'Engaged and on track'};
 mock.timers.tick(60000); // advance the mocked clock so updated_at is provably later than created_at
 const sheets=mockSheetsFetch(true);
 try{
  const ok=await worker.fetch(request('editor-session?id='+created.id,'PATCH',validUpdate,editorKey),env);
  assert.equal(ok.status,200);
  const okBody=await ok.json();
  assert.equal(okBody.bookingId,created.id);
  assert.equal(okBody.attendance,'Present');
  assert.equal(okBody.hoursCompleted,0.75);
  assert.equal(okBody.progressStage,'In Progress');
  assert.equal(okBody.progressPercent,50);
  assert.equal(okBody.remarks,'Engaged and on track');
  assert.ok(new Date(okBody.updatedAt).getTime()>new Date(before.updated_at).getTime());

  // The Google Sheets webhook must actually have been called, with the right shape.
  assert.equal(sheets.calls.length,1);
  assert.equal(sheets.calls[0].url,sheetsEnv.GOOGLE_SHEETS_WEBHOOK_URL);
  const sentBody=JSON.parse(sheets.calls[0].options.body);
  assert.equal(sentBody.action,'UPSERT_SESSION');
  assert.equal(sentBody.secret,sheetsEnv.GOOGLE_SHEETS_WEBHOOK_SECRET);
  assert.equal(sentBody.session.bookingId,created.id);
  assert.equal(sentBody.session.attendance,'Present');
  assert.equal(sentBody.session.appName,'Stocklist');
  assert.equal(sentBody.session.name,booking.name);
  assert.equal(sentBody.session.company,booking.company);

  const row=db.prepare('SELECT * FROM session_progress WHERE booking_id = ?').get(created.id);
  assert.equal(row.attendance,'Present');
  assert.equal(row.hours_completed,0.75);
  assert.equal(row.progress_stage,'In Progress');
  assert.equal(row.progress_percent,50);
  assert.equal(row.remarks,'Engaged and on track');
  assert.equal(row.created_at,before.created_at); // created_at must never change on update
  assert.equal(row.updated_by,null); // no named-admin identity yet, by design

  for(const invalid of [
   {...validUpdate,attendance:'Maybe'},
   {...validUpdate,hoursCompleted:-1},
   {...validUpdate,progressStage:'Almost Done'},
   {...validUpdate,progressPercent:-1},
   {...validUpdate,progressPercent:101},
   {...validUpdate,progressPercent:50.5},
  ]){
   const res=await worker.fetch(request('editor-session?id='+created.id,'PATCH',invalid,editorKey),env);
   assert.equal(res.status,400,JSON.stringify(invalid));
  }
  assert.equal(sheets.calls.length,1); // invalid payloads are rejected before ever reaching Sheets
 }finally{sheets.restore()}
 db.close();
});

test('a failed Google Sheets sync blocks the save and leaves the Supabase mirror unchanged',async()=>{
 const db=testDatabase(),DB=databaseAdapter(db),env={DB,EDITOR_ACCESS_KEY:editorKey,...sheetsEnv};
 const created=await (await worker.fetch(request('bookings','POST',booking),{DB})).json();
 const before=db.prepare('SELECT * FROM session_progress WHERE booking_id = ?').get(created.id);

 const update={attendance:'Present',hoursCompleted:2,progressStage:'Completed',progressPercent:100,remarks:'Should not persist'};
 const sheets=mockSheetsFetch(false,'Simulated Sheets outage');
 try{
  const res=await worker.fetch(request('editor-session?id='+created.id,'PATCH',update,editorKey),env);
  assert.equal(res.status,502);
  const body=await res.json();
  assert.match(body.error,/could not be saved/i);
 }finally{sheets.restore()}

 const after=db.prepare('SELECT * FROM session_progress WHERE booking_id = ?').get(created.id);
 assert.deepEqual(after,before); // nothing changed in Supabase when the Sheet write failed
 db.close();
});

test('saving with Google Sheets not configured is rejected rather than silently succeeding',async()=>{
 const db=testDatabase(),DB=databaseAdapter(db),env={DB,EDITOR_ACCESS_KEY:editorKey}; // no Sheets env vars at all
 const created=await (await worker.fetch(request('bookings','POST',booking),{DB})).json();
 const update={attendance:'Present',hoursCompleted:1,progressStage:'In Progress',progressPercent:20,remarks:''};
 const res=await worker.fetch(request('editor-session?id='+created.id,'PATCH',update,editorKey),env);
 assert.equal(res.status,502);
 db.close();
});

test('admin sessions list requires auth and returns booking + progress fields merged',async()=>{
 const db=testDatabase(),DB=databaseAdapter(db),env={DB,EDITOR_ACCESS_KEY:editorKey};
 assert.equal((await worker.fetch(request('editor-sessions'),env)).status,401);
 const created=await (await worker.fetch(request('bookings','POST',booking),{DB})).json();
 const res=await worker.fetch(request('editor-sessions',undefined,undefined,editorKey),env);
 assert.equal(res.status,200);
 const body=await res.json();
 const row=body.sessions.find(s=>s.id===created.id);
 assert.ok(row,'the new booking must appear in the admin sessions list');
 assert.equal(row.name,booking.name);
 assert.equal(row.appName,'Stocklist');
 assert.equal(row.company,booking.company);
 assert.equal(row.attendance,'Not Marked');
 assert.equal(row.hoursCompleted,0);
 assert.equal(row.progressStage,'Not Started');
 assert.equal(row.progressPercent,0);
 // Admin-only fields are present here (unlike the public GET /api/session response).
 assert.ok('remarks' in row);
 db.close();
});

test('session progress update reports 404 for a booking that was never created',async()=>{
 const db=testDatabase(),DB=databaseAdapter(db),env={DB,EDITOR_ACCESS_KEY:editorKey,...sheetsEnv};
 const update={attendance:'Present',hoursCompleted:1,progressStage:'In Progress',progressPercent:50,remarks:''};
 const res=await worker.fetch(request('editor-session?id=00000000-0000-4000-8000-000000000000','PATCH',update,editorKey),env);
 assert.equal(res.status,404);
 db.close();
});

test('Vercel database adapter keeps credentials server-side and maps atomic writes',async()=>{
 const original=global.fetch,calls=[];global.fetch=async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify(url.includes('/rpc/')?true:[]),{status:200})};
 try{const db=supabaseDatabase({SUPABASE_URL:'https://example.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_test'});assert.deepEqual(await db.prepare('SELECT slot FROM bookings WHERE date = ?').bind('2026-10-01').all(),{results:[]});const saved=await db.prepare('INSERT INTO bookings').bind('id','stocklist','Stocklist','2026-10-01','14:30','User','+91 98765 43210','user@example.com','Company').run();assert.equal(saved.meta.changes,1);await db.batch([db.prepare('INSERT INTO availability').bind('2026-10-01','14:30',0,0)]);assert.ok(calls[1].url.endsWith('/rpc/book_session'));assert.ok(calls[2].url.endsWith('/rpc/save_availability'));assert.equal(calls[0].options.headers.apikey,'sb_secret_test')}finally{global.fetch=original}
});
