import {test,mock} from 'node:test';
mock.timers.enable({apis:['Date'],now:new Date('2026-09-18T04:00:00Z')});
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import worker,{validateBooking,isValidDate} from '../server/worker.js';
import {supabaseDatabase} from '../server/supabase.js';

const now=new Date('2026-09-17T04:00:00Z');
const booking={appId:'stocklist',date:'2026-10-01',slot:'11:00',name:'Test User',email:'test@example.com',company:'Test'};
const request=(path,method='GET',body,auth)=>new Request('https://studio.test/api/'+path,{method,headers:{Origin:'https://studio.test','Content-Type':'application/json',...(auth?{Authorization:'Bearer '+auth}:{})},...(body?{body:JSON.stringify(body)}:{})});
function testDatabase(){const db=new DatabaseSync(':memory:');for(const file of ['0000_keen_tarantula.sql','0001_abandoned_penance.sql'])db.exec(fs.readFileSync('drizzle/'+file,'utf8'));return db}
function databaseAdapter(db){return {async batch(statements){db.exec('BEGIN');try{for(const s of statements)await s.run();db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}},prepare(sql){return{bind(...v){return{async all(){return{results:db.prepare(sql).all(...v)}},async run(){return db.prepare(sql).run(...v)}}}}}}}

test('only assigned application dates, exact slots, and valid contacts are accepted',()=>{
 assert.equal(validateBooking(booking,now),null);
 for(const change of [{date:'2026-09-29'},{date:'2026-09-19'},{slot:'10:30'},{slot:'16:30'},{email:'bad'},{appId:'unknown'},{date:'2026-02-31'}])assert.ok(validateBooking({...booking,...change},now));
 assert.equal(isValidDate('2026-10-01',now,'stocklist'),true);
 assert.equal(isValidDate('2026-10-01',now,'tendersetu'),false);
});

test('each application receives only its dates and three specified slots',async()=>{
 const db=testDatabase(),DB=databaseAdapter(db);
 const schedule=await (await worker.fetch(request('schedule?appId=stocklist'),{DB})).json();
 assert.deepEqual(schedule.days.map(d=>d.date),['2026-10-01','2026-10-06']);
 const available=await (await worker.fetch(request('availability?date=2026-10-01&appId=stocklist'),{DB})).json();
 assert.deepEqual(available.slots.map(s=>s.time),['11:00','14:30','15:30']);
 assert.ok(available.slots.every(s=>s.available));
 assert.equal((await worker.fetch(request('availability?date=2026-10-01&appId=tendersetu'),{DB})).status,400);
 db.close();
});

test('database keeps a studio slot exclusive across listed applications and does not expose contacts',async()=>{
 const db=testDatabase(),DB=databaseAdapter(db);
 const first=await worker.fetch(request('bookings','POST',booking),{DB});assert.equal(first.status,201);
 const second=await worker.fetch(request('bookings','POST',{...booking,appId:'minicrm'}),{DB});assert.equal(second.status,409);
 const response=await (await worker.fetch(request('availability?date=2026-10-01&appId=stocklist'),{DB})).json();
 assert.equal(response.slots.find(s=>s.time==='11:00').available,false);
 assert.equal(JSON.stringify(response).includes(booking.email),false);
 assert.equal((await worker.fetch(request('availability?date=2026-10-01&appId=stocklist'),{})).status,503);
 db.close();
});

test('editor settings and booking revalidation use the new time slots',async()=>{
 const db=testDatabase(),DB=databaseAdapter(db),key='test-editor-key-with-at-least-32-characters',env={DB,EDITOR_ACCESS_KEY:key};
 assert.equal((await worker.fetch(request('editor/session'),env)).status,401);
 const settings={date:'2026-10-01',slots:['11:00','14:30','15:30'].map(time=>({time,visible:time!=='11:00',active:time!=='14:30'}))};
 assert.equal((await worker.fetch(request('editor/availability','PUT',settings,key),env)).status,200);
 const available=await (await worker.fetch(request('availability?date=2026-10-01&appId=stocklist'),env)).json();
 assert.deepEqual(available.slots.map(s=>s.available),[false,false,true]);
 assert.equal((await worker.fetch(request('bookings','POST',{...booking,slot:'11:00'}),env)).status,409);
 assert.equal((await worker.fetch(request('bookings','POST',{...booking,slot:'14:30'}),env)).status,409);
 assert.equal((await worker.fetch(request('bookings','POST',{...booking,slot:'15:30'}),env)).status,201);
 db.close();
});

test('Vercel database adapter keeps credentials server-side and maps atomic writes',async()=>{
 const original=global.fetch,calls=[];global.fetch=async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify(url.includes('/rpc/')?true:[]),{status:200})};
 try{const db=supabaseDatabase({SUPABASE_URL:'https://example.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_test'});assert.deepEqual(await db.prepare('SELECT slot FROM bookings WHERE date = ?').bind('2026-10-01').all(),{results:[]});const saved=await db.prepare('INSERT INTO bookings').bind('id','stocklist','2026-10-01','11:00','User','user@example.com','Company').run();assert.equal(saved.meta.changes,1);await db.batch([db.prepare('INSERT INTO availability').bind('2026-10-01','11:00',0,0)]);assert.ok(calls[1].url.endsWith('/rpc/book_session'));assert.ok(calls[2].url.endsWith('/rpc/save_availability'));assert.equal(calls[0].options.headers.apikey,'sb_secret_test')}finally{global.fetch=original}
});
