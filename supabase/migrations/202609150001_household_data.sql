begin;

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 80),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create table public.household_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  role text not null check (role in ('admin', 'member'))
);
create index on public.household_members(household_id);

-- Each module is a versioned aggregate; finance periods commit together.
create table public.module_documents (
  scope_id uuid not null,
  module text not null check (module in ('calendar', 'tasks', 'market', 'finances')),
  household_id uuid references public.households(id) on delete cascade,
  owner_id uuid references auth.users(id) on delete cascade,
  data jsonb not null,
  version bigint not null default 1 check (version > 0),
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now(),
  primary key(scope_id, module),
  check (
    (module = 'finances' and owner_id = scope_id and household_id is null)
    or (module <> 'finances' and household_id = scope_id and owner_id is null)
  )
);
create table public.module_operations (
  actor_id uuid not null references auth.users(id) on delete cascade,
  operation_id uuid not null,
  scope_id uuid not null,
  module text not null,
  version bigint not null,
  created_at timestamptz not null default now(),
  primary key(actor_id, operation_id)
);

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.module_documents enable row level security;
alter table public.module_operations enable row level security;

create policy own_membership on public.household_members for select to authenticated
using (user_id = auth.uid());
create policy household_read on public.households for select to authenticated
using (id in (select household_id from public.household_members where user_id = auth.uid()));
create policy module_read on public.module_documents for select to authenticated
using (
  (module = 'finances' and owner_id = auth.uid())
  or (module <> 'finances' and household_id in
    (select household_id from public.household_members where user_id = auth.uid()))
);
revoke all on public.households, public.household_members, public.module_documents, public.module_operations from anon, authenticated;
grant select on public.households, public.household_members, public.module_documents to authenticated;

create function public.create_household(household_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); hid uuid;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));
  select household_id into hid from public.household_members where user_id = uid;
  if hid is not null then return hid; end if;
  insert into public.households(name, created_by) values (trim(household_name), uid) returning id into hid;
  insert into public.household_members values (uid, hid, 'admin');
  return hid;
end;
$$;

create function public.save_module(
  module_name text, payload jsonb, expected_version bigint, operation_id uuid
) returns bigint
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  sid uuid;
  previous_version bigint;
  next_version bigint;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if module_name not in ('calendar', 'tasks', 'market', 'finances')
    or module_name is null or payload is null or expected_version is null
    or expected_version < 0 or operation_id is null then raise exception 'INVALID_INPUT'; end if;
  if octet_length(payload::text) > 2000000 then raise exception 'DOCUMENT_TOO_LARGE'; end if;
  if module_name = 'finances' then sid := uid;
  else
    select household_id into sid from public.household_members where user_id = uid;
    if sid is null then raise exception 'HOUSEHOLD_REQUIRED'; end if;
  end if;
  -- Serialize retries and concurrent writes. Scope is derived from auth, never the client.
  perform pg_advisory_xact_lock(hashtextextended(uid::text || operation_id::text, 0));
  select o.version into next_version from public.module_operations o
    where o.actor_id = uid and o.operation_id = save_module.operation_id
    and o.scope_id = sid and o.module = module_name;
  if found then return next_version; end if;
  perform pg_advisory_xact_lock(hashtextextended(sid::text || module_name, 0));
  select d.version into previous_version from public.module_documents d
    where d.scope_id = sid and d.module = module_name;
  if coalesce(previous_version, 0) <> expected_version then raise exception 'VERSION_CONFLICT'; end if;
  if module_name in ('calendar', 'tasks') and jsonb_typeof(payload) is distinct from 'array' then
    raise exception 'INVALID_INPUT';
  end if;
  if module_name in ('market', 'finances') and jsonb_typeof(payload) is distinct from 'object' then
    raise exception 'INVALID_INPUT';
  end if;
  if module_name = 'market' and (
    jsonb_typeof(payload->'purchases') is distinct from 'array'
    or jsonb_typeof(payload->'budget') is distinct from 'number'
    or (payload->>'budget')::numeric < 0
  ) then raise exception 'INVALID_INPUT'; end if;
  if module_name = 'finances' and (
    jsonb_typeof(payload->'periods') is distinct from 'array'
    or jsonb_typeof(payload->'settings') is distinct from 'object'
    or jsonb_typeof(payload->'activePeriodId') is distinct from 'string'
  ) then raise exception 'INVALID_INPUT'; end if;
  if exists (
    select 1 from jsonb_path_query(payload, '$.**.amount') amount
    where jsonb_typeof(amount) <> 'number'
      or amount::text::numeric < 0 or amount::text::numeric > 1000000000000
      or trunc(amount::text::numeric) <> amount::text::numeric
  ) then raise exception 'INVALID_AMOUNT'; end if;
  next_version := coalesce(previous_version, 0) + 1;
  insert into public.module_documents(scope_id, module, household_id, owner_id, data, version, updated_by)
  values (sid, module_name, case when module_name <> 'finances' then sid end,
    case when module_name = 'finances' then uid end, payload, next_version, uid)
  on conflict(scope_id, module) do update
    set data = excluded.data, version = excluded.version, updated_by = uid, updated_at = now();
  insert into public.module_operations values(uid, operation_id, sid, module_name, next_version, now());
  return next_version;
end;
$$;
revoke all on function public.create_household(text) from public, anon;
revoke all on function public.save_module(text, jsonb, bigint, uuid) from public, anon;
grant execute on function public.create_household(text) to authenticated;
grant execute on function public.save_module(text, jsonb, bigint, uuid) to authenticated;
commit;
