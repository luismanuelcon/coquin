-- Run in the SQL Editor as postgres after both migrations.
-- All fixtures are rolled back, including the two users (no credentials created).
begin;
select set_config('coquin.test_a', gen_random_uuid()::text, true);
select set_config('coquin.test_b', gen_random_uuid()::text, true);
insert into auth.users(id) values (current_setting('coquin.test_a')::uuid), (current_setting('coquin.test_b')::uuid);
select set_config('request.jwt.claim.sub', current_setting('coquin.test_a'), true);
set local role authenticated;
select public.create_household('Prueba transaccional A');
do $$
declare module_name text; payload jsonb; v bigint; op uuid; before_data jsonb;
begin
  for module_name, payload in select * from (values
    ('calendar', '[{"id":"event-1","title":"Prueba","time":"09:30","date":"2026-09-16","meta":"Prueba","tone":"calendar"}]'::jsonb),
    ('tasks', '[{"id":"task-1","title":"Prueba","owner":"Prueba","due":"2026-09-16","status":"Pendiente"}]'::jsonb),
    ('market', '{"budget":100000,"purchases":[{"id":"purchase-1","date":"2026-09-16","detail":"Prueba","amount":2500,"category":"Otro"}]}'::jsonb),
    ('finances', '{"settings":{"currency":"COP","cutoffDay":1},"activePeriodId":"period-1","periods":[{"id":"period-1","startDate":"2026-09-01","endDate":"2026-09-30","incomes":[{"id":"income-1","concept":"Base","amount":100000}],"items":[],"miscExpenses":[]}]}'::jsonb)
  ) fixtures loop
    op := gen_random_uuid();
    v := public.save_module(module_name, payload, 0, op);
    if v <> 1 then raise exception 'Create failed: %', module_name; end if;
    if public.save_module(module_name, payload, 0, op) <> 1 then raise exception 'Retry not idempotent'; end if;
    select d.data into before_data from public.module_documents d where d.module = module_name;
    if before_data is distinct from payload then raise exception 'Read mismatch: %', module_name; end if;
    v := public.save_module(module_name, payload, 1, gen_random_uuid());
    if v <> 2 then raise exception 'Update failed: %', module_name; end if;
    begin
      perform public.save_module(module_name, payload, 1, gen_random_uuid());
      raise exception 'Conflict was not rejected';
    exception when raise_exception then
      if sqlerrm <> 'VERSION_CONFLICT' then raise; end if;
    end;
  end loop;
  begin
    perform public.save_module('tasks', '[{"id":"invalid"}]', 2, gen_random_uuid());
    raise exception 'Invalid record was accepted';
  exception when raise_exception then
    if sqlerrm <> 'INVALID_INPUT' then raise; end if;
  end;
  if (select version from public.module_documents where module = 'tasks') <> 2 then raise exception 'Invalid write changed version'; end if;
  perform public.save_module('tasks', '[]', 2, gen_random_uuid());
  if (select data from public.module_documents where module = 'tasks') <> '[]'::jsonb then raise exception 'Delete failed'; end if;
  begin
    update public.module_documents set data = '[]' where module = 'tasks';
    raise exception 'Direct write was allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub', current_setting('coquin.test_b'), true);
set local role authenticated;
select public.create_household('Prueba transaccional B');
do $$ begin
  if exists(select 1 from public.module_documents) then raise exception 'Cross-household data leak'; end if;
end $$;
reset role;
update public.household_members set household_id = (
  select household_id from public.household_members where user_id = current_setting('coquin.test_a')::uuid
) where user_id = current_setting('coquin.test_b')::uuid;
set local role authenticated;
do $$ begin
  if (select count(*) from public.module_documents) <> 3 then raise exception 'Shared household read failed'; end if;
  if exists(select 1 from public.module_documents where module = 'finances') then raise exception 'Private finance leak'; end if;
  perform public.save_module('tasks', '[]', 3, gen_random_uuid());
end $$;
reset role;
select set_config('request.jwt.claim.sub', '', true);
set local role anon;
do $$ begin
  begin
    perform * from public.module_documents;
    raise exception 'Anonymous read allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.save_module('tasks','[]',0,gen_random_uuid());
    raise exception 'Anonymous write allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'PASS: CRUD, rollback, retry, conflicts, validation, household RLS, private finances and anonymous access' as result;
