-- Run after 202609250001_member_names.sql. All synthetic data is rolled back.
begin;
do $$
declare a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); outsider uuid := gen_random_uuid();
  ha uuid; hb uuid; version bigint; payload jsonb;
begin
  if has_function_privilege('anon', 'public.get_household_members()', 'execute') then
    raise exception 'Anonymous roster access';
  end if;
  insert into auth.users(id, raw_user_meta_data) values
    (a, '{"display_name":"Ana"}'), (b, '{"display_name":"José"}'), (outsider, '{"display_name":"Otro hogar"}');
  perform set_config('request.jwt.claim.sub', a::text, true);
  ha := public.create_household('Prueba nombres A');
  insert into public.household_members values (b, ha, 'member');
  perform set_config('request.jwt.claim.sub', outsider::text, true);
  hb := public.create_household('Prueba nombres B');
  perform set_config('request.jwt.claim.sub', a::text, true);
  if (select count(*) from public.get_household_members()) <> 2 then raise exception 'Wrong roster'; end if;
  if exists (select 1 from public.get_household_members() where user_id = outsider) then raise exception 'Cross-household leak'; end if;
  if not exists (select 1 from public.get_household_members() where user_id = b and display_name = 'José') then raise exception 'Missing name'; end if;
  payload := jsonb_build_array(jsonb_build_object('id','task-1','title','Comprar','owner','José','ownerId',b,'due','2026-09-25','status','Pendiente'));
  version := public.save_module('tasks',payload,0,gen_random_uuid());
  begin
    perform public.save_module('tasks',jsonb_set(payload,'{0,ownerId}',to_jsonb(outsider::text)),version,gen_random_uuid());
    raise exception 'Foreign assignment accepted';
  exception when others then
    if sqlerrm <> 'INVALID_TASK_OWNER' then raise; end if;
  end;
  update public.household_members set household_id = hb where user_id = b;
  version := public.save_module('tasks',jsonb_set(payload,'{0,status}','"Completada"'),version,gen_random_uuid());
  -- Older clients and historical free-text tasks remain compatible.
  version := public.save_module('tasks',jsonb_build_array((payload->0) - 'ownerId'),version,gen_random_uuid());
  perform set_config('request.jwt.claim.sub', '', true);
  begin
    perform public.get_household_members();
    raise exception 'Unauthenticated roster accepted';
  exception when others then
    if sqlerrm <> 'AUTH_REQUIRED' then raise; end if;
  end;
end $$;
rollback;
select 'Member names and assignment checks passed' as result;
