// Server-only adapter for the queries used by the shared booking handler.
export function supabaseDatabase(env) {
 const base=env.SUPABASE_URL, key=env.SUPABASE_SECRET_KEY;
 if(!base||!key)throw Error('Supabase is not configured');
 const headers={apikey:key,'Content-Type':'application/json'};
 if(!key.startsWith('sb_secret_'))headers.Authorization='Bearer '+key;
 async function call(path,options={}){const r=await fetch(base.replace(/\/$/,'')+'/rest/v1/'+path,{...options,headers:{...headers,...options.headers}});const text=await r.text();const data=text?JSON.parse(text):null;if(!r.ok){if(data?.code==='23505')throw Error('UNIQUE constraint');throw Error('Database request failed: '+r.status)}return data;}
 function prepare(sql){return {bind(...v){return {async all(){
   let path;
   if(sql==='SELECT slot FROM bookings WHERE date = ?')path='bookings?select=slot&date=eq.'+encodeURIComponent(v[0]);
   else if(sql==='SELECT slot, visible, active FROM availability WHERE date = ?')path='availability?select=slot,visible,active&date=eq.'+encodeURIComponent(v[0]);
   else if(sql==='SELECT date, slot, visible, active FROM availability WHERE date >= ? AND date <= ?')path='availability?select=date,slot,visible,active&date=gte.'+encodeURIComponent(v[0])+'&date=lte.'+encodeURIComponent(v[1]);
   else if(sql==='SELECT id, app_name, name, date, slot FROM bookings WHERE id = ?')path='bookings?select=id,app_name,name,date,slot&id=eq.'+encodeURIComponent(v[0]);
   else if(sql==='SELECT progress_stage, progress_percent FROM session_progress WHERE booking_id = ?')path='session_progress?select=progress_stage,progress_percent&booking_id=eq.'+encodeURIComponent(v[0]);
   else if(sql==='SELECT id, app_id, app_name, name, phone, email, company, member_id, date, slot FROM bookings ORDER BY date, slot')path='bookings?select=id,app_id,app_name,name,phone,email,company,member_id,date,slot&order=date.asc,slot.asc';
   else if(sql==='SELECT id, app_name, company FROM bookings')path='bookings?select=id,app_name,company';
   else if(sql==='SELECT booking_id, attendance, hours_completed, progress_stage, progress_percent, remarks FROM session_progress')path='session_progress?select=booking_id,attendance,hours_completed,progress_stage,progress_percent,remarks';
   else if(sql==='SELECT app_name, name, company, member_id, date, slot FROM bookings WHERE id = ?')path='bookings?select=app_name,name,company,member_id,date,slot&id=eq.'+encodeURIComponent(v[0]);
   else if(sql==='SELECT created_at FROM session_progress WHERE booking_id = ?')path='session_progress?select=created_at&booking_id=eq.'+encodeURIComponent(v[0]);
   else if(sql==='SELECT app_id, app_name, name, company, email, member_id, date, slot FROM bookings WHERE id = ?')path='bookings?select=app_id,app_name,name,company,email,member_id,date,slot&id=eq.'+encodeURIComponent(v[0]);
   else if(sql==='SELECT attendance, hours_completed, progress_stage, progress_percent, remarks, created_at FROM session_progress WHERE booking_id = ?')path='session_progress?select=attendance,hours_completed,progress_stage,progress_percent,remarks,created_at&booking_id=eq.'+encodeURIComponent(v[0]);
   else if(sql==='SELECT id, app_name, date, slot FROM bookings WHERE member_id = ? AND email = ?')path='bookings?select=id,app_name,date,slot&member_id=eq.'+encodeURIComponent(v[0])+'&email=eq.'+encodeURIComponent(v[1]);
   else if(sql==='SELECT booking_id, attendance, progress_stage, progress_percent FROM session_progress')path='session_progress?select=booking_id,attendance,progress_stage,progress_percent';
   else if(sql==='SELECT booking_id, progress_stage, progress_percent FROM session_progress')path='session_progress?select=booking_id,progress_stage,progress_percent';
   else throw Error('Unsupported query');
   return {results:await call(path)}
  },async run(){
   if(sql.startsWith('INSERT INTO bookings')){
    const saved=await call('rpc/book_session',{method:'POST',body:JSON.stringify({p_id:v[0],p_app:v[1],p_app_name:v[2],p_date:v[3],p_slot:v[4],p_name:v[5],p_phone:v[6],p_email:v[7],p_company:v[8],p_member_id:v[9]})});
    return {meta:{changes:saved?1:0}};
   }
   if(sql==='INSERT INTO session_progress (booking_id, created_at, updated_at) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM session_progress WHERE booking_id = ?)'){
    // Safety net only (see worker.js) -- in production book_session() already created this row
    // atomically alongside the booking, so ignore-duplicates makes this a harmless no-op here.
    await call('session_progress',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({booking_id:v[0],created_at:v[1],updated_at:v[2]})});
    return {meta:{changes:1}};
   }
   if(sql==='UPDATE session_progress SET attendance=?, hours_completed=?, progress_stage=?, progress_percent=?, remarks=?, updated_at=? WHERE booking_id=?'){
    const saved=await call('session_progress?booking_id=eq.'+encodeURIComponent(v[6]),{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({attendance:v[0],hours_completed:v[1],progress_stage:v[2],progress_percent:v[3],remarks:v[4],updated_at:v[5]})});
    return {meta:{changes:Array.isArray(saved)?saved.length:0}};
   }
   if(sql==='UPDATE bookings SET date=?, slot=? WHERE id=?'){
    const saved=await call('bookings?id=eq.'+encodeURIComponent(v[2]),{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({date:v[0],slot:v[1]})});
    return {meta:{changes:Array.isArray(saved)?saved.length:0}};
   }
   if(sql==='DELETE FROM bookings WHERE id = ?'){
    const saved=await call('bookings?id=eq.'+encodeURIComponent(v[0]),{method:'DELETE',headers:{Prefer:'return=representation'}});
    return {meta:{changes:Array.isArray(saved)?saved.length:0}};
   }
   throw Error('Unsupported mutation');
  },sql,values:v}}}}
 return {prepare,async batch(statements){if(statements.some(s=>!s.sql.startsWith('INSERT INTO availability')))throw Error('Unsupported batch');return call('rpc/save_availability',{method:'POST',body:JSON.stringify({p_date:statements[0].values[0],p_slots:statements.map(s=>({slot:s.values[1],visible:s.values[2],active:s.values[3]}))})});}};
}
