create extension if not exists pgcrypto;

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  created_at timestamptz not null default now()
);

create table if not exists public.columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  position numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  column_id uuid not null references public.columns(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text default '',
  position numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  card_id uuid references public.cards(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  from_column_id uuid references public.columns(id) on delete set null,
  to_column_id uuid references public.columns(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_columns_board_position on public.columns(board_id, position);
create index if not exists idx_cards_column_position on public.cards(column_id, position);
create index if not exists idx_cards_board on public.cards(board_id);
create index if not exists idx_activity_board_created on public.activity(board_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_cards_updated_at on public.cards;
create trigger set_cards_updated_at
before update on public.cards
for each row execute function public.set_updated_at();

alter table public.boards enable row level security;
alter table public.columns enable row level security;
alter table public.cards enable row level security;
alter table public.activity enable row level security;

drop policy if exists "Board owner can manage boards" on public.boards;
create policy "Board owner can manage boards"
on public.boards for all
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Board owner can manage columns" on public.columns;
create policy "Board owner can manage columns"
on public.columns for all
to authenticated
using (exists (
  select 1 from public.boards b where b.id = columns.board_id and b.owner_id = auth.uid()
))
with check (exists (
  select 1 from public.boards b where b.id = columns.board_id and b.owner_id = auth.uid()
));

drop policy if exists "Board owner can manage cards" on public.cards;
create policy "Board owner can manage cards"
on public.cards for all
to authenticated
using (exists (
  select 1 from public.boards b where b.id = cards.board_id and b.owner_id = auth.uid()
))
with check (exists (
  select 1 from public.boards b where b.id = cards.board_id and b.owner_id = auth.uid()
));

drop policy if exists "Board owner can manage activity" on public.activity;
create policy "Board owner can manage activity"
on public.activity for all
to authenticated
using (exists (
  select 1 from public.boards b where b.id = activity.board_id and b.owner_id = auth.uid()
))
with check (exists (
  select 1 from public.boards b where b.id = activity.board_id and b.owner_id = auth.uid()
));
