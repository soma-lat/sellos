-- Club Sellos: ejecutar completo en Supabase SQL Editor.
create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create type public.member_role as enum ('owner', 'staff');
create table public.business_memberships (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'staff',
  primary key (business_id, user_id)
);

create table public.loyalty_programs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses(id) on delete cascade,
  stamps_needed integer not null check (stamps_needed > 0),
  reward_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.loyalty_programs(id) on delete cascade,
  stamps integer not null default 0 check (stamps >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id, program_id)
);

create type public.event_type as enum ('stamp_awarded', 'reward_redeemed');
create table public.loyalty_events (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.loyalty_cards(id) on delete cascade,
  event_type public.event_type not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Perfil automático cuando alguien se registra con Supabase Auth.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, lower(new.email));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_memberships enable row level security;
alter table public.loyalty_programs enable row level security;
alter table public.loyalty_cards enable row level security;
alter table public.loyalty_events enable row level security;

create policy "Perfil propio" on public.profiles for select to authenticated using (id = auth.uid());
create policy "Negocios visibles" on public.businesses for select to authenticated using (true);
create policy "Mi membresia" on public.business_memberships for select to authenticated using (user_id = auth.uid());
create policy "Programas visibles" on public.loyalty_programs for select to authenticated using (active = true);
create policy "Mis tarjetas" on public.loyalty_cards for select to authenticated using (user_id = auth.uid());
create policy "Mis movimientos" on public.loyalty_events for select to authenticated using (
  exists (select 1 from public.loyalty_cards c where c.id = card_id and c.user_id = auth.uid())
);

-- Las dos operaciones de caja son atómicas y comprueban el rol del empleado.
create or replace function public.award_stamp(p_business_id uuid, p_customer_email text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_customer_id uuid;
  v_program_id uuid;
  v_card_id uuid;
begin
  if not exists (
    select 1 from business_memberships
    where business_id = p_business_id and user_id = auth.uid() and role in ('owner', 'staff')
  ) then raise exception 'No tienes permiso para este negocio'; end if;
  select id into v_customer_id from profiles where email = lower(trim(p_customer_email));
  if v_customer_id is null then raise exception 'No existe una cuenta con ese correo'; end if;
  select id into v_program_id from loyalty_programs where business_id = p_business_id and active = true;
  if v_program_id is null then raise exception 'Este negocio no tiene un programa activo'; end if;
  insert into loyalty_cards (user_id, program_id, stamps, updated_at)
  values (v_customer_id, v_program_id, 1, now())
  on conflict (user_id, program_id) do update set stamps = loyalty_cards.stamps + 1, updated_at = now()
  returning id into v_card_id;
  insert into loyalty_events (card_id, event_type, created_by) values (v_card_id, 'stamp_awarded', auth.uid());
end;
$$;

create or replace function public.redeem_reward(p_business_id uuid, p_customer_email text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_customer_id uuid;
  v_program_id uuid;
  v_needed integer;
  v_card_id uuid;
begin
  if not exists (
    select 1 from business_memberships
    where business_id = p_business_id and user_id = auth.uid() and role in ('owner', 'staff')
  ) then raise exception 'No tienes permiso para este negocio'; end if;
  select id into v_customer_id from profiles where email = lower(trim(p_customer_email));
  if v_customer_id is null then raise exception 'No existe una cuenta con ese correo'; end if;
  select id, stamps_needed into v_program_id, v_needed from loyalty_programs where business_id = p_business_id and active = true;
  if v_program_id is null then raise exception 'Este negocio no tiene un programa activo'; end if;
  select id into v_card_id from loyalty_cards
    where user_id = v_customer_id and program_id = v_program_id and stamps >= v_needed for update;
  if v_card_id is null then raise exception 'El cliente aún no tiene sellos suficientes'; end if;
  update loyalty_cards set stamps = stamps - v_needed, updated_at = now() where id = v_card_id;
  insert into loyalty_events (card_id, event_type, created_by) values (v_card_id, 'reward_redeemed', auth.uid());
end;
$$;

revoke all on function public.award_stamp(uuid, text) from public;
revoke all on function public.redeem_reward(uuid, text) from public;
grant execute on function public.award_stamp(uuid, text) to authenticated;
grant execute on function public.redeem_reward(uuid, text) to authenticated;

-- CONFIGURACION INICIAL (ejecutar DESPUES de registrar las dos cuentas):
-- Cambia los dos correos y, si lo deseas, la meta/recompensa.
-- do $$
-- declare v_business uuid; v_owner uuid;
-- begin
--   insert into public.businesses(name) values ('Cafetería Ejemplo') returning id into v_business;
--   select id into v_owner from public.profiles where email = 'dueno@ejemplo.com';
--   insert into public.business_memberships(business_id, user_id, role) values (v_business, v_owner, 'owner');
--   insert into public.loyalty_programs(business_id, stamps_needed, reward_name) values (v_business, 9, 'Un café gratis');
-- end $$;
