-- Run once in the Supabase SQL editor for GetMyApp's own (separate) Supabase project.
-- This project is independent of SyncUp's Supabase project; nothing here touches SyncUp.
-- All table access stays server-side.
create table if not exists public.bookings (
 id uuid primary key, app_id text not null, app_name text not null, date text not null, slot text not null,
 name text not null, phone text not null, email text not null, company text not null default '',
 member_id text not null default '',
 created_at timestamptz not null default now(),
 -- The unique index below only guards against the SAME person (identified by email)
 -- accidentally double-submitting the same app+date+slot; the capacity limit (currently 3
 -- simultaneous bookings per app+date+slot) is enforced in book_session() below, not here.
 unique(app_id, date, slot, email)
);
-- Run this separately if bookings already exists from before member_id was added:
-- alter table public.bookings add column if not exists member_id text not null default '';
create table if not exists public.availability (
 date text not null, slot text not null, visible integer not null default 1 check(visible in (0,1)),
 active integer not null default 1 check(active in (0,1)), primary key(date,slot)
);
-- One session_progress row per booking. booking_id is both PK and FK, which structurally
-- guarantees exactly one row per booking and cascades cleanup if a booking is ever deleted.
-- Holds only operational/session data, never a copy of participant/application/date/etc. --
-- that stays on bookings.
create table if not exists public.session_progress (
 booking_id uuid primary key references public.bookings(id) on delete cascade,
 attendance text not null default 'Not Marked' check (attendance in ('Not Marked','Present','Absent')),
 hours_completed numeric(4,2) not null default 0 check (hours_completed >= 0),
 progress_stage text not null default 'Not Started',
 progress_percent integer not null default 0 check (progress_percent between 0 and 100),
 remarks text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 updated_by text
);
alter table public.bookings enable row level security;
alter table public.availability enable row level security;
alter table public.session_progress enable row level security;
revoke all on public.bookings, public.availability, public.session_progress from anon, authenticated;
grant all on public.bookings, public.availability, public.session_progress to service_role;
-- Drop the previous 7-arg and 9-arg signatures explicitly so neither lingers as a stale
-- overload alongside the new 10-arg version below.
drop function if exists public.book_session(uuid,text,text,text,text,text,text);
drop function if exists public.book_session(uuid,text,text,text,text,text,text,text,text);
create or replace function public.book_session(p_id uuid,p_app text,p_app_name text,p_date text,p_slot text,p_name text,p_phone text,p_email text,p_company text,p_member_id text) returns boolean language plpgsql set search_path=public as $$
begin
 -- Serializes concurrent booking attempts for the SAME app+date+slot so two simultaneous
 -- requests can't both pass the capacity check below and jointly overshoot it.
 perform pg_advisory_xact_lock(hashtextextended(p_app||p_date||p_slot,0));
 if exists(select 1 from availability where date=p_date and slot=p_slot and (visible=0 or active=0)) then return false; end if;
 if (select count(*) from bookings where app_id=p_app and date=p_date and slot=p_slot) >= 3 then return false; end if;
 insert into bookings(id,app_id,app_name,date,slot,name,phone,email,company,member_id) values(p_id,p_app,p_app_name,p_date,p_slot,p_name,p_phone,p_email,p_company,p_member_id);
 -- Created inside the same transaction as the booking itself: if this insert fails for any
 -- reason, the whole function raises and the booking insert rolls back too, so a booking can
 -- never exist without its session_progress row. Every column but booking_id uses its default.
 insert into session_progress(booking_id) values(p_id);
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
revoke all on function public.book_session(uuid,text,text,text,text,text,text,text,text,text) from public,anon,authenticated;
revoke all on function public.save_availability(text,jsonb) from public,anon,authenticated;
grant execute on function public.book_session(uuid,text,text,text,text,text,text,text,text,text) to service_role;
grant execute on function public.save_availability(text,jsonb) to service_role;
