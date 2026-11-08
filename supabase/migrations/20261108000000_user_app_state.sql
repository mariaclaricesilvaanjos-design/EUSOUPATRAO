create table if not exists public.user_app_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);

alter table public.user_app_state enable row level security;

drop policy if exists "Users can read their own app state" on public.user_app_state;
create policy "Users can read their own app state"
  on public.user_app_state for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select auth.jwt() ->> 'aal') = 'aal2'
  );

revoke all on public.user_app_state from anon, authenticated;
grant select on public.user_app_state to authenticated;

create or replace function public.save_my_app_state(
  p_payload jsonb,
  p_expected_revision bigint
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_revision bigint;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if auth.jwt() ->> 'aal' is distinct from 'aal2' then
    raise exception 'Complete multifactor authentication before syncing data'
      using errcode = '42501';
  end if;

  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'App state must be a JSON object' using errcode = '22023';
  end if;

  insert into public.user_app_state (user_id, payload, revision, updated_at)
  values (auth.uid(), p_payload, 1, now())
  on conflict (user_id) do update
    set payload = excluded.payload,
        revision = public.user_app_state.revision + 1,
        updated_at = now()
    where public.user_app_state.revision = p_expected_revision
  returning revision into saved_revision;

  if saved_revision is null then
    raise exception 'Cloud state changed on another device; reload before saving'
      using errcode = '40001';
  end if;

  return saved_revision;
end;
$$;

revoke all on function public.save_my_app_state(jsonb, bigint) from public, anon;
grant execute on function public.save_my_app_state(jsonb, bigint) to authenticated;
