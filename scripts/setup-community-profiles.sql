-- =============================================================
-- Perfiles de la Comunidad y amistades
-- Pega este SQL en Supabase → SQL Editor → Run (se puede ejecutar más de una vez)
-- =============================================================

-- Perfil público de cada persona en la Comunidad
create table if not exists community_profiles (
  user_id     uuid primary key references auth.users on delete cascade,
  bio         text check (char_length(bio) <= 160),
  is_public   boolean not null default true,
  updated_at  timestamptz not null default now()
);
alter table community_profiles enable row level security;
drop policy if exists "community_profiles_select" on community_profiles;
create policy "community_profiles_select" on community_profiles for select to authenticated using (true);
drop policy if exists "community_profiles_insert" on community_profiles;
create policy "community_profiles_insert" on community_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "community_profiles_update" on community_profiles;
create policy "community_profiles_update" on community_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Amistades: una fila por pareja; pendiente hasta que la otra persona acepta
create table if not exists community_friendships (
  id          uuid primary key default gen_random_uuid(),
  requester   uuid not null references auth.users on delete cascade,
  addressee   uuid not null references auth.users on delete cascade,
  status      text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at  timestamptz not null default now(),
  accepted_at timestamptz,
  check (requester <> addressee)
);
-- Una sola relación por pareja, en cualquier sentido
create unique index if not exists community_friendships_pair
  on community_friendships (least(requester, addressee), greatest(requester, addressee));
create index if not exists community_friendships_addressee on community_friendships (addressee, status);

alter table community_friendships enable row level security;
drop policy if exists "friendships_select" on community_friendships;
create policy "friendships_select" on community_friendships for select to authenticated using (auth.uid() in (requester, addressee));
drop policy if exists "friendships_insert" on community_friendships;
create policy "friendships_insert" on community_friendships for insert to authenticated with check (auth.uid() = requester and status = 'pending');
drop policy if exists "friendships_update" on community_friendships;
create policy "friendships_update" on community_friendships for update to authenticated using (auth.uid() = addressee) with check (auth.uid() = addressee);
drop policy if exists "friendships_delete" on community_friendships;
create policy "friendships_delete" on community_friendships for delete to authenticated using (auth.uid() in (requester, addressee));
