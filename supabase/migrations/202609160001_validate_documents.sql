begin;

-- The database validates writes even when the browser validation is bypassed.
create or replace function public.valid_module_value(kind text, value jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare item jsonb; field text; fields text[]; item_kind text;
begin
  if value is null then return false; end if;
  if kind = 'text' then
    return jsonb_typeof(value) = 'string' and length(trim(value #>> '{}')) between 1 and 500;
  elsif kind = 'amount' then
    return jsonb_typeof(value) = 'number' and (value #>> '{}')::numeric between 0 and 1000000000000
      and trunc((value #>> '{}')::numeric) = (value #>> '{}')::numeric;
  elsif kind = 'date' then
    return jsonb_typeof(value) = 'string' and (value #>> '{}') ~ '^\d{4}-\d{2}-\d{2}$'
      and ((value #>> '{}')::date)::text = (value #>> '{}');
  end if;

  if kind in ('calendar', 'tasks', 'purchases', 'periods', 'incomes', 'items', 'miscExpenses') then
    if jsonb_typeof(value) <> 'array' then return false; end if;
    if jsonb_array_length(value) > 10000 then return false; end if;
    if (select count(distinct e->>'id') from jsonb_array_elements(value) e) <> jsonb_array_length(value) then return false; end if;
    item_kind := case kind when 'calendar' then 'event' when 'tasks' then 'task'
      when 'purchases' then 'purchase' when 'periods' then 'period' when 'incomes' then 'income'
      when 'items' then 'budgetItem' else 'expense' end;
    for item in select * from jsonb_array_elements(value) loop
      if not public.valid_module_value(item_kind, item) then return false; end if;
    end loop;
    return true;
  end if;

  if jsonb_typeof(value) <> 'object' then return false; end if;
  if kind = 'market' then
    return public.valid_module_value('amount', value->'budget') and public.valid_module_value('purchases', value->'purchases');
  elsif kind = 'finances' then
    return coalesce(jsonb_typeof(value->'settings') = 'object'
      and value->'settings'->>'currency' = 'COP'
      and public.valid_module_value('amount', value->'settings'->'cutoffDay')
      and (value->'settings'->>'cutoffDay')::numeric between 1 and 31
      and public.valid_module_value('text', value->'activePeriodId')
      and public.valid_module_value('periods', value->'periods')
      and exists (select 1 from jsonb_array_elements(value->'periods') as p(record) where p.record->>'id' = value->>'activePeriodId'), false);
  end if;

  fields := case kind when 'event' then array['id','title','time']
    when 'task' then array['id','title','owner'] when 'purchase' then array['id','detail']
    when 'period' then array['id'] when 'income' then array['id','concept']
    when 'budgetItem' then array['id','concept'] when 'expense' then array['id','concept'] else null end;
  if fields is null then return false; end if;
  foreach field in array fields loop
    if not public.valid_module_value('text', value->field) then return false; end if;
  end loop;
  foreach field in array array['note','category'] loop
    if kind in ('income','budgetItem','expense') and value ? field and
      (jsonb_typeof(value->field) <> 'string' or length(value->>field) > 500) then return false; end if;
  end loop;
  if kind in ('purchase','income','budgetItem','expense') and not public.valid_module_value('amount', value->'amount') then return false; end if;
  if kind in ('purchase','expense') and not public.valid_module_value('date', value->'date') then return false; end if;
  if kind = 'event' and not public.valid_module_value('date', value->'date') then return false; end if;
  if kind = 'task' and not public.valid_module_value('date', value->'due') then return false; end if;
  return coalesce(case kind
    when 'event' then jsonb_typeof(value->'meta') = 'string' and length(value->>'meta') <= 500
      and value->>'tone' in ('calendar','finances','market','tasks','home')
    when 'task' then value->>'status' in ('Pendiente','En progreso','Urgente','Completada')
    when 'purchase' then (value->>'amount')::numeric > 0 and value->>'category' in ('Aseo','Carnes','Verduras','Despensa','Lacteos','Hogar','Otro')
    when 'period' then public.valid_module_value('date', value->'startDate') and public.valid_module_value('date', value->'endDate')
      and value->>'startDate' <= value->>'endDate' and public.valid_module_value('incomes', value->'incomes')
      and public.valid_module_value('items', value->'items') and public.valid_module_value('miscExpenses', value->'miscExpenses')
    when 'budgetItem' then jsonb_typeof(value->'fixed') = 'boolean' and value->>'status' in ('paid','pending')
    when 'income' then true when 'expense' then true else false end, false);
exception when invalid_text_representation or numeric_value_out_of_range or datetime_field_overflow or invalid_datetime_format then
  return false;
end;
$$;
revoke all on function public.valid_module_value(text,jsonb) from public, anon, authenticated;

-- A trigger runs under the save RPC's owner, including on upserts.
create function public.check_module_document() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not public.valid_module_value(new.module, new.data) then raise exception 'INVALID_INPUT'; end if;
  return new;
end;
$$;
revoke all on function public.check_module_document() from public, anon, authenticated;
create trigger validate_module_document before insert or update on public.module_documents
for each row execute function public.check_module_document();
commit;
