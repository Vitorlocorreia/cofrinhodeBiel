create schema cofre_private;
revoke all on schema cofre_private from public, anon, authenticated;
grant usage on schema cofre_private to service_role;
create table cofre_private.gateway_credentials (
  id boolean primary key default true check(id),
  token_hash text not null check(token_hash ~ '^[a-f0-9]{64}$')
);
create table cofre_private.financial_state (
  id boolean primary key default true check(id),
  revision bigint not null default 0 check(revision>=0),
  state jsonb not null check (
    state->>'version'='2' and jsonb_typeof(state->'entries')='array' and jsonb_typeof(state->'plans')='array'
    and octet_length(state::text)<=8388608
  ),
  updated_at timestamptz not null default now()
);
alter table cofre_private.gateway_credentials enable row level security;
alter table cofre_private.financial_state enable row level security;
create policy gateway_backend_only on cofre_private.gateway_credentials for select to service_role using(true);
create policy state_backend_read on cofre_private.financial_state for select to service_role using(true);
create policy state_backend_update on cofre_private.financial_state for update to service_role using(true) with check(true);
revoke all on all tables in schema cofre_private from public,anon,authenticated;
grant select on cofre_private.gateway_credentials to service_role;
grant select,update on cofre_private.financial_state to service_role;
insert into cofre_private.financial_state(id,state) values(true,'{"version":2,"entries":[],"plans":[]}');
create function public.cofre_gateway(p_token_hash text,p_action text,p_expected_revision bigint default null,p_state jsonb default null)
returns jsonb language plpgsql security invoker set search_path=''
as $$
declare result jsonb;
begin
  if not exists(select 1 from cofre_private.gateway_credentials where id=true and token_hash=p_token_hash) then
    raise exception 'Unauthorized gateway' using errcode='28000';
  end if;
  if p_action='read' then
    select jsonb_build_object('revision',revision,'state',state,'updatedAt',updated_at) into result from cofre_private.financial_state where id=true;
  elsif p_action='write' then
    if p_expected_revision is null or p_state is null then raise exception 'Invalid write' using errcode='22023'; end if;
    update cofre_private.financial_state set state=p_state,revision=revision+1,updated_at=now()
    where id=true and revision=p_expected_revision
    returning jsonb_build_object('revision',revision,'state',state,'updatedAt',updated_at) into result;
    if not found then return jsonb_build_object('conflict',true); end if;
  else raise exception 'Invalid action' using errcode='22023';
  end if;
  return result;
end;
$$;
revoke all on function public.cofre_gateway(text,text,bigint,jsonb) from public,anon,authenticated;
grant execute on function public.cofre_gateway(text,text,bigint,jsonb) to service_role;
