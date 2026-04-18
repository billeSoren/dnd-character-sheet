-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Characters table
create table if not exists public.characters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  race text not null,
  class text not null,
  level integer not null default 1,
  background text not null,
  created_at timestamp with time zone default now() not null
);

-- Character stats table
create table if not exists public.character_stats (
  id uuid primary key default uuid_generate_v4(),
  character_id uuid references public.characters(id) on delete cascade not null unique,
  strength integer not null default 10,
  dexterity integer not null default 10,
  constitution integer not null default 10,
  intelligence integer not null default 10,
  wisdom integer not null default 10,
  charisma integer not null default 10
);

-- Character HP table
create table if not exists public.character_hp (
  id uuid primary key default uuid_generate_v4(),
  character_id uuid references public.characters(id) on delete cascade not null unique,
  max_hp integer not null default 10,
  current_hp integer not null default 10,
  temp_hp integer not null default 0
);

-- Row Level Security
alter table public.characters enable row level security;
alter table public.character_stats enable row level security;
alter table public.character_hp enable row level security;

-- Characters policies
create policy "Users can view own characters"
  on public.characters for select
  using (auth.uid() = user_id);

create policy "Users can insert own characters"
  on public.characters for insert
  with check (auth.uid() = user_id);

create policy "Users can update own characters"
  on public.characters for update
  using (auth.uid() = user_id);

create policy "Users can delete own characters"
  on public.characters for delete
  using (auth.uid() = user_id);

-- Character stats policies (via character ownership)
create policy "Users can view own character stats"
  on public.character_stats for select
  using (exists (
    select 1 from public.characters
    where characters.id = character_stats.character_id
    and characters.user_id = auth.uid()
  ));

create policy "Users can insert own character stats"
  on public.character_stats for insert
  with check (exists (
    select 1 from public.characters
    where characters.id = character_stats.character_id
    and characters.user_id = auth.uid()
  ));

create policy "Users can update own character stats"
  on public.character_stats for update
  using (exists (
    select 1 from public.characters
    where characters.id = character_stats.character_id
    and characters.user_id = auth.uid()
  ));

create policy "Users can delete own character stats"
  on public.character_stats for delete
  using (exists (
    select 1 from public.characters
    where characters.id = character_stats.character_id
    and characters.user_id = auth.uid()
  ));

-- Character HP policies (via character ownership)
create policy "Users can view own character hp"
  on public.character_hp for select
  using (exists (
    select 1 from public.characters
    where characters.id = character_hp.character_id
    and characters.user_id = auth.uid()
  ));

create policy "Users can insert own character hp"
  on public.character_hp for insert
  with check (exists (
    select 1 from public.characters
    where characters.id = character_hp.character_id
    and characters.user_id = auth.uid()
  ));

create policy "Users can update own character hp"
  on public.character_hp for update
  using (exists (
    select 1 from public.characters
    where characters.id = character_hp.character_id
    and characters.user_id = auth.uid()
  ));

create policy "Users can delete own character hp"
  on public.character_hp for delete
  using (exists (
    select 1 from public.characters
    where characters.id = character_hp.character_id
    and characters.user_id = auth.uid()
  ));
