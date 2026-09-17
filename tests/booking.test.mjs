import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import worker,{validateBooking,isValidDate} from '../server/worker.js';
const now=new Date('2026-09-17T04:00:00Z');
const booking={appId:'stocklist',date:'2026-09-18',slot:'11:00',name:'Test User',email:'test@example.com',company:'Test'};
test('weekday, time, contact and past-date validation',()=>{assert.equal(validateBooking(booking,now),null);for(const change of [{date:'2026-09-19'},{date:'2026-09-20'},{slot:'13:00'},{slot:'16:30'},{email:'bad'},{appId:'unknown'},{date:'2026-02-31'},{date:'2026-09-16'}])assert.ok(validateBooking({...booking,...change},now));assert.equal(isValidDate('2026-09-18',now),true)});
test('database rejects duplicate studio slots across apps and API protects contact data',async()=>{const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync('drizzle/0000_keen_tarantula.sql','utf8'));db.exec(fs.readFileSync('drizzle/0001_abandoned_penance.sql','utf8'));const DB={prepare(sql){return{bind(...values){return{async all(){return{results:db.prepare(sql).all(...values)}},async run(){return db.prepare(sql).run(...values)}}}}}};let day=new Date(Date.now()+86400000);while([0,6].includes(day.getUTCDay()))day=new Date(+day+86400000);const payload={...booking,date:day.toISOString().slice(0,10)};const request=b=>new Request('https://studio.test/api/bookings',{method:'POST',headers:{Origin:'https://studio.test','Content-Type':'application/json'},body:JSON.stringify(b)});const first=await worker.fetch(request(payload),{DB});assert.equal(first.status,201);assert.ok((await first.json()).id);const second=await worker.fetch(request({...payload,appId:'minicrm'}),{DB});assert.equal(second.status,409);const availability=await worker.fetch(new Request('https://studio.test/api/availability?date='+payload.date),{DB});const response=await availability.json();assert.equal(response.slots.find(s=>s.time==='11:00').available,false);assert.equal(JSON.stringify(response).includes(payload.email),false);const missingDB=await worker.fetch(new Request('https://studio.test/api/availability?date='+payload.date),{});assert.equal(missingDB.status,503);db.close()});

test('editor authorization, hidden slots, inactive slots and booking revalidation',async()=>{
 const db=new DatabaseSync(':memory:');for(const file of ['0000_keen_tarantula.sql','0001_abandoned_penance.sql'])db.exec(fs.readFileSync('drizzle/'+file,'utf8'));
 const DB={async batch(statements){db.exec('BEGIN');try{for(const s of statements)await s.run();db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}},prepare(sql){return{bind(...v){return{async all(){return{results:db.prepare(sql).all(...v)}},async run(){return db.prepare(sql).run(...v)}}}}}};
 const key='test-editor-key-with-at-least-32-characters';const env={DB,EDITOR_ACCESS_KEY:key};
 const req=(path,method='GET',body,auth)=>new Request('https://studio.test/api/'+path,{method,headers:{Origin:'https://studio.test','Content-Type':'application/json',...(auth?{Authorization:'Bearer '+auth}:{})},...(body?{body:JSON.stringify(body)}:{})});
 assert.equal((await worker.fetch(req('editor/session'),env)).status,401);
 assert.equal((await worker.fetch(req('editor/session','GET',null,key),{DB})).status,503);
 assert.equal((await worker.fetch(req('editor/session','GET',null,key),env)).status,200);
 let day=new Date(Date.now()+86400000);while([0,6].includes(day.getUTCDay()))day=new Date(+day+86400000);const date=day.toISOString().slice(0,10);
 const settings={date,slots:['11:00','12:00','14:30','15:30'].map(time=>({time,visible:time!=='11:00',active:time!=='12:00'}))};
 assert.equal((await worker.fetch(req('editor/availability','PUT',settings,'wrong'),env)).status,401);
 assert.equal((await worker.fetch(req('editor/availability','PUT',settings,key),env)).status,200);
 let available=await (await worker.fetch(req('availability?date='+date),env)).json();
 assert.equal(available.slots[0].visible,false);assert.equal(available.slots[0].available,false);assert.equal(available.slots[1].available,false);assert.equal(available.slots[2].available,true);
 assert.equal((await worker.fetch(req('bookings','POST',{...booking,date,slot:'11:00'}),env)).status,409);
 assert.equal((await worker.fetch(req('bookings','POST',{...booking,date,slot:'12:00'}),env)).status,409);
 assert.equal((await worker.fetch(req('bookings','POST',{...booking,date,slot:'14:30'}),env)).status,201);
 settings.slots.forEach(s=>{s.visible=false;s.active=false});await worker.fetch(req('editor/availability','PUT',settings,key),env);
 assert.equal(db.prepare('SELECT count(*) as count FROM bookings').get().count,1);
 const schedule=await (await worker.fetch(req('schedule'),env)).json();assert.equal(schedule.days.some(d=>d.date===date),false);
 db.close();
});
import {supabaseDatabase} from '../server/supabase.js';
test('Vercel database adapter keeps credentials server-side and maps atomic writes',async()=>{
 const original=global.fetch,calls=[];global.fetch=async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify(url.includes('/rpc/')?true:[]),{status:200})};
 try{const db=supabaseDatabase({SUPABASE_URL:'https://example.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_test'});assert.deepEqual(await db.prepare('SELECT slot FROM bookings WHERE date = ?').bind('2026-09-18').all(),{results:[]});const saved=await db.prepare('INSERT INTO bookings').bind('id','stocklist','2026-09-18','11:00','User','user@example.com','Company').run();assert.equal(saved.meta.changes,1);await db.batch([db.prepare('INSERT INTO availability').bind('2026-09-18','11:00',0,0)]);assert.ok(calls[1].url.endsWith('/rpc/book_session'));assert.ok(calls[2].url.endsWith('/rpc/save_availability'));assert.equal(calls[0].options.headers.apikey,'sb_secret_test');assert.equal(JSON.parse(calls[2].options.body).p_slots[0].active,0)}finally{global.fetch=original}
});
