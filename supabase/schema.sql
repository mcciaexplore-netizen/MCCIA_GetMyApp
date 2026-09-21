-- Run once in the Supabase SQL editor for GetMyApp's own (separate) Supabase project.
-- This project is independent of SyncUp's Supabase project; nothing here touches SyncUp.
-- All table access stays server-side.
create table if not exists public.bookings (
 id uuid primary key, app_id text not null, app_name text not null, date text not null, slot text not null,
 name text not null, phone text not null, email text not null, company text not null default '',
 created_at timestamptz not null default now(),
 -- No occupancy/capacity limit: any number of different people may book the same app+date+slot.
 -- This constraint only guards against the SAME person (identified by email) accidentally
 -- double-submitting the same app+date+slot; it is not a capacity limit.
 unique(app_id, date, slot, email)
);
create table if not exists public.availability (
 date text not null, slot text not null, visible integer not null default 1 check(visible in (0,1)),
 active integer not null default 1 check(active in (0,1)), primary key(date,slot)
);
alter table public.bookings enable row level security;
alter table public.availability enable row level security;
revoke all on public.bookings, public.availability from anon, authenticated;
grant all on public.bookings, public.availability to service_role;
-- Drop the previous 7-arg signature explicitly so it doesn't linger as a stale overload
-- alongside the new 9-arg version below.
drop function if exists public.book_session(uuid,text,text,text,text,text,text);
create or replace function public.book_session(p_id uuid,p_app text,p_app_name text,p_date text,p_slot text,p_name text,p_phone text,p_email text,p_company text) returns boolean language plpgsql set search_path=public as $$
begin
 if exists(select 1 from availability where date=p_date and slot=p_slot and (visible=0 or active=0)) then return false; end if;
 insert into bookings(id,app_id,app_name,date,slot,name,phone,email,company) values(p_id,p_app,p_app_name,p_date,p_slot,p_name,p_phone,p_email,p_company);
 return true;
end $$;
create or replace function public.save_availability(p_date text,p_slots jsonb) returns boolean language plpgsql set search_path=public as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(p_date,0));
 insert into availability(date,slot,visible,active)
 select p_date,s->>'slot',(s->>'visible')::integer,(s->>'active')::integer from jsonb_array_elements(p_slots) s
 on conflict(date,slot) do update set visible=excluded.visible, active=excluded.active;
 return true;
end $$;
revoke all on function public.book_session(uuid,text,text,text,text,text,text,text,text) from public,anon,authenticated;
revoke all on function public.save_availability(text,jsonb) from public,anon,authenticated;
grant execute on function public.book_session(uuid,text,text,text,text,text,text,text,text) to service_role;
grant execute on function public.save_availability(text,jsonb) to service_role;
