-- NextGen AI Coach - Supabase Schema (Free Tier Compatible)
-- Run this entire file in Supabase SQL Editor

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  membership_type text default 'Club Member', -- Club Member, Club Pro, Club Legend
  handicap numeric,
  goals text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sessions (one per bay visit + analysis)
create table public.sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  bay_number int not null check (bay_number between 1 and 5),
  started_at timestamptz default now(),
  ended_at timestamptz,
  video_url text, -- Supabase Storage path
  gspro_csv_url text,
  gspro_metrics jsonb, -- parsed averages + raw shots
  analysis jsonb, -- full AI analysis output
  swing_score numeric,
  notes text,
  created_at timestamptz default now()
);

-- Training Plans (adaptive)
create table public.training_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  session_id uuid references public.sessions,
  title text not null,
  focus_areas text[] not null,
  drills jsonb not null, -- array of {name, description, duration_min, completed: bool}
  start_date date default current_date,
  end_date date,
  status text default 'active', -- active, completed, archived
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.training_plans enable row level security;

-- RLS Policies (users can only see their own data)
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.sessions for update
  using (auth.uid() = user_id);

create policy "Users can view own training plans"
  on public.training_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert own training plans"
  on public.training_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update own training plans"
  on public.training_plans for update
  using (auth.uid() = user_id);

-- Function to handle new user profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$;

-- Trigger for new users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Optional: Seed some example data for testing (remove in production)
-- You can manually add test users via Supabase Auth UI