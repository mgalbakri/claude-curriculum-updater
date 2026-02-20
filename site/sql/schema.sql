-- Agent Code Academy — Supabase Schema
-- Run this in the Supabase SQL Editor

-- Profiles table (auto-created on signup)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  is_premium boolean default false,
  order_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Progress table (tracks week completion)
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  week_number integer not null check (week_number between 1 and 12),
  completed_at timestamptz default now(),
  unique(user_id, week_number)
);

-- Indexes
create index if not exists idx_progress_user_id on public.progress(user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.progress enable row level security;

-- Profiles: users can read and update their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Progress: users can read, insert, and delete their own progress
create policy "Users can view own progress" on public.progress
  for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own progress" on public.progress
  for delete using (auth.uid() = user_id);
