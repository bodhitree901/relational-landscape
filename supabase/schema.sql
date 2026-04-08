-- Relational Landscape — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Profiles table (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Connections table (synced from localStorage)
create table if not exists public.connections (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  color text,
  data jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.connections enable row level security;

create policy "Users can read own connections"
  on public.connections for select
  using (auth.uid() = user_id);

create policy "Users can insert own connections"
  on public.connections for insert
  with check (auth.uid() = user_id);

create policy "Users can update own connections"
  on public.connections for update
  using (auth.uid() = user_id);

create policy "Users can delete own connections"
  on public.connections for delete
  using (auth.uid() = user_id);


-- 3. Invitations table (share links)
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  connection_id uuid not null references public.connections(id) on delete cascade,
  profile_snapshot jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz default now()
);

alter table public.invitations enable row level security;

-- Owner can do everything
create policy "Users can manage own invitations"
  on public.invitations for all
  using (auth.uid() = user_id);

-- Anyone can read by token (for the /share/[token] page)
create policy "Anyone can read invitation by token"
  on public.invitations for select
  using (true);


-- 4. Responses table (Person B's anonymous reply)
create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid unique not null references public.invitations(id) on delete cascade,
  responder_name text not null,
  responder_color text,
  response_data jsonb not null,
  created_at timestamptz default now()
);

alter table public.responses enable row level security;

-- Anyone can insert a response (anonymous Person B) but only to pending invitations
create policy "Anyone can respond to pending invitation"
  on public.responses for insert
  with check (
    exists (
      select 1 from public.invitations
      where invitations.id = invitation_id
      and invitations.status = 'pending'
    )
  );

-- Owner of the invitation can read responses
create policy "Invitation owner can read responses"
  on public.responses for select
  using (
    exists (
      select 1 from public.invitations
      where invitations.id = invitation_id
      and invitations.user_id = auth.uid()
    )
  );

-- Anonymous users can also read their own response (by invitation_id, right after submitting)
create policy "Anyone can read response by invitation"
  on public.responses for select
  using (true);


-- 5. Auto-mark invitation as completed when a response is inserted
create or replace function public.mark_invitation_completed()
returns trigger as $$
begin
  update public.invitations
  set status = 'completed'
  where id = new.invitation_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_response_created on public.responses;
create trigger on_response_created
  after insert on public.responses
  for each row execute procedure public.mark_invitation_completed();


-- 6. Indexes for performance
create index if not exists idx_connections_user_id on public.connections(user_id);
create index if not exists idx_invitations_token on public.invitations(token);
create index if not exists idx_invitations_user_id on public.invitations(user_id);
create index if not exists idx_invitations_connection_id on public.invitations(connection_id);
create index if not exists idx_responses_invitation_id on public.responses(invitation_id);
