-- Run once in the Supabase SQL editor. All table access stays server-side.
create table if not exists public.bookings (
 id uuid primary key, app_id text not null, date text not null, slot text not null,
 name text not null, email text not null, company text not null default '',
 created_at timestamptz not null default now(), unique(date,slot)
);
create table if not exists public.availability (
 date text not null, slot text not null, visible integer not null default 1 check(visible in (0,1)),
 active integer not null default 1 check(active in (0,1)), primary key(date,slot)
);
alter table public.bookings enable row level security;
alter table public.availability enable row level security;
revoke all on public.bookings, public.availability from anon, authenticated;
grant all on public.bookings, public.availability to service_role;
create or replace function public.book_session(p_id uuid,p_app text,p_date text,p_slot text,p_name text,p_email text,p_company text) returns boolean language plpgsql set search_path=public as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(p_date,0));
 if exists(select 1 from availability where date=p_date and slot=p_slot and (visible=0 or active=0)) then return false; end if;
 insert into bookings(id,app_id,date,slot,name,email,company) values(p_id,p_app,p_date,p_slot,p_name,p_email,p_company);
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
revoke all on function public.book_session(uuid,text,text,text,text,text,text) from public,anon,authenticated;
revoke all on function public.save_availability(text,jsonb) from public,anon,authenticated;
grant execute on function public.book_session(uuid,text,text,text,text,text,text) to service_role;
grant execute on function public.save_availability(text,jsonb) to service_role;
