begin;

-- Display names are self-service auth metadata, never authorization claims.
-- Expose only IDs/names of the caller's own household, never phone/email.
create function public.get_household_members()
returns table(user_id uuid, display_name text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  return query
    select m.user_id,
      case when jsonb_typeof(u.raw_user_meta_data->'display_name') = 'string'
        then nullif(left(trim(u.raw_user_meta_data->>'display_name'), 80), '') end
    from public.household_members m
    join auth.users u on u.id = m.user_id
    where m.household_id = (
      select own.household_id from public.household_members own where own.user_id = auth.uid()
    )
    order by 2 nulls last, m.user_id;
end;
$$;
revoke all on function public.get_household_members() from public, anon;
grant execute on function public.get_household_members() to authenticated;

-- Legacy tasks keep their free-text owner. New assignments reference a member.
-- Preserve historical assignments when a member leaves; reject new foreign IDs.
create function public.check_task_assignees() returns trigger
language plpgsql set search_path = '' as $$
declare task jsonb; previous_data jsonb;
begin
  if new.module <> 'tasks' then return new; end if;
  -- save_module uses INSERT ... ON CONFLICT, so read persisted data even in
  -- the BEFORE INSERT trigger. The RPC already serializes writes per document.
  select d.data into previous_data from public.module_documents d
    where d.scope_id = new.scope_id and d.module = 'tasks';
  for task in select * from jsonb_array_elements(new.data) loop
    if not (task ? 'ownerId') then continue; end if;
    if jsonb_typeof(task->'ownerId') <> 'string'
      or (task->>'ownerId') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'INVALID_TASK_OWNER';
    end if;
    if not exists (select 1 from public.household_members m
      where m.user_id = (task->>'ownerId')::uuid and m.household_id = new.household_id)
      and not exists (select 1 from jsonb_array_elements(coalesce(previous_data, '[]'::jsonb)) old_task
        where old_task->>'id' = task->>'id' and old_task->>'ownerId' = task->>'ownerId') then
      raise exception 'INVALID_TASK_OWNER';
    end if;
  end loop;
  return new;
end;
$$;
revoke all on function public.check_task_assignees() from public, anon, authenticated;
create trigger validate_task_assignees before insert or update on public.module_documents
for each row execute function public.check_task_assignees();
commit;
