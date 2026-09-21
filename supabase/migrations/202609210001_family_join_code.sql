begin;

-- Family join code: a short, human-shareable code that lets a person join an
-- existing household. Stored normalized (uppercase, no separators) on the
-- household itself; rotatable and revocable without expelling current members.
alter table public.households add column join_code text;
alter table public.households add column join_code_rotated_at timestamptz not null default now();

-- Ambiguity-free alphabet (no 0/O, 1/I/L). Retries on the unlikely unique clash.
create function public.new_join_code() returns text
language plpgsql security definer set search_path = '' as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
  attempts int := 0;
begin
  loop
    code := '';
    for i in 1..8 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.households h where h.join_code = code);
    attempts := attempts + 1;
    if attempts > 20 then raise exception 'CODE_GENERATION_FAILED'; end if;
  end loop;
  return code;
end;
$$;

-- Backfill row by row so each generated code sees the previous inserts.
do $$
declare r record;
begin
  for r in select id from public.households where join_code is null loop
    update public.households set join_code = public.new_join_code() where id = r.id;
  end loop;
end $$;

alter table public.households alter column join_code set not null;
alter table public.households add constraint households_join_code_key unique (join_code);

-- Generate the code when the household is created; keeps prior idempotency.
create or replace function public.create_household(household_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); hid uuid;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));
  select household_id into hid from public.household_members where user_id = uid;
  if hid is not null then return hid; end if;
  insert into public.households(name, created_by, join_code)
    values (trim(household_name), uid, public.new_join_code()) returning id into hid;
  insert into public.household_members values (uid, hid, 'admin');
  return hid;
end;
$$;

-- Join by code. Scope and identity derive from auth.uid(), never the client.
create function public.join_household(code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); normalized text; hid uuid;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  normalized := upper(regexp_replace(coalesce(code, ''), '[^A-Za-z0-9]', '', 'g'));
  if length(normalized) <> 8 then raise exception 'INVALID_CODE'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));
  if exists (select 1 from public.household_members where user_id = uid) then
    raise exception 'HOUSEHOLD_EXISTS';
  end if;
  select id into hid from public.households where join_code = normalized;
  if hid is null then raise exception 'INVALID_CODE'; end if;
  insert into public.household_members values (uid, hid, 'member');
  return hid;
end;
$$;

-- Rotate the code (admins only). Old code stops working; members are untouched.
create function public.rotate_join_code() returns text
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); hid uuid; code text;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select household_id into hid from public.household_members where user_id = uid and role = 'admin';
  if hid is null then raise exception 'NOT_ADMIN'; end if;
  perform pg_advisory_xact_lock(hashtextextended(hid::text, 0));
  code := public.new_join_code();
  update public.households set join_code = code, join_code_rotated_at = now() where id = hid;
  return code;
end;
$$;

revoke all on function public.new_join_code() from public, anon, authenticated;
revoke all on function public.join_household(text) from public, anon;
revoke all on function public.rotate_join_code() from public, anon;
grant execute on function public.join_household(text) to authenticated;
grant execute on function public.rotate_join_code() to authenticated;
commit;
