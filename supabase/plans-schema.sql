-- CampusCompass: plans table for saving and loading user plans
-- Run this in your Supabase project: SQL Editor → New query → paste and run

-- Table: plans
-- Stores the form data (user_data) so plans can be recomputed when the user returns.
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My plan',
  user_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for listing a user's plans
create index if not exists plans_user_id_idx on public.plans(user_id);
create index if not exists plans_updated_at_idx on public.plans(updated_at desc);

-- RLS: users can only see and modify their own plans
alter table public.plans enable row level security;

drop policy if exists "Users can read own plans" on public.plans;
create policy "Users can read own plans"
  on public.plans for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own plans" on public.plans;
create policy "Users can insert own plans"
  on public.plans for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own plans" on public.plans;
create policy "Users can update own plans"
  on public.plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own plans" on public.plans;
create policy "Users can delete own plans"
  on public.plans for delete
  using (auth.uid() = user_id);

-- Optional: keep updated_at in sync
create or replace function public.set_plans_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists plans_updated_at on public.plans;
create trigger plans_updated_at
  before update on public.plans
  for each row execute function public.set_plans_updated_at();
