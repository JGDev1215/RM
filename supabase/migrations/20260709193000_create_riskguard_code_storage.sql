create extension if not exists pgcrypto with schema extensions;

create table if not exists public.app_access_codes (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  code_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.riskguard_app_state (
  id uuid primary key default gen_random_uuid(),
  access_code_id uuid not null unique references public.app_access_codes(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_access_codes enable row level security;
alter table public.riskguard_app_state enable row level security;

revoke all on table public.app_access_codes from anon, authenticated;
revoke all on table public.riskguard_app_state from anon, authenticated;
revoke all on all functions in schema public from public;

insert into public.app_access_codes (label, code_hash)
values ('default', extensions.crypt('5880', extensions.gen_salt('bf')))
on conflict (label) do nothing;

create or replace function public.verify_app_code(input_code text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if input_code !~ '^[0-9]{4}$' then
    return false;
  end if;

  return exists (
    select 1
    from public.app_access_codes
    where active = true
      and code_hash = extensions.crypt(input_code, code_hash)
  );
end;
$$;

create or replace function public.load_riskguard_state(input_code text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  code_id uuid;
  saved_payload jsonb;
begin
  if input_code !~ '^[0-9]{4}$' then
    raise exception 'Invalid access code';
  end if;

  select id into code_id
  from public.app_access_codes
  where active = true
    and code_hash = extensions.crypt(input_code, code_hash)
  limit 1;

  if code_id is null then
    raise exception 'Invalid access code';
  end if;

  select payload into saved_payload
  from public.riskguard_app_state
  where access_code_id = code_id;

  return coalesce(saved_payload, '{}'::jsonb);
end;
$$;

create or replace function public.save_riskguard_state(input_code text, input_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  code_id uuid;
  clean_payload jsonb;
begin
  if input_code !~ '^[0-9]{4}$' then
    raise exception 'Invalid access code';
  end if;

  if input_payload is null or jsonb_typeof(input_payload) <> 'object' then
    raise exception 'Payload must be a JSON object';
  end if;

  select id into code_id
  from public.app_access_codes
  where active = true
    and code_hash = extensions.crypt(input_code, code_hash)
  limit 1;

  if code_id is null then
    raise exception 'Invalid access code';
  end if;

  clean_payload := input_payload;

  insert into public.riskguard_app_state (access_code_id, payload)
  values (code_id, clean_payload)
  on conflict (access_code_id)
  do update set payload = excluded.payload, updated_at = now();

  return clean_payload;
end;
$$;

revoke all on function public.verify_app_code(text) from public;
revoke all on function public.load_riskguard_state(text) from public;
revoke all on function public.save_riskguard_state(text, jsonb) from public;

grant execute on function public.verify_app_code(text) to anon, authenticated;
grant execute on function public.load_riskguard_state(text) to anon, authenticated;
grant execute on function public.save_riskguard_state(text, jsonb) to anon, authenticated;
