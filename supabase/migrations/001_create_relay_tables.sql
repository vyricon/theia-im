-- Theia Smart Relay Mode Database Schema

-- User status tracking table
create table if not exists theia_user_status (
  id uuid primary key default gen_random_uuid(),
  user_phone text not null unique,
  status text not null check (status in ('available', 'busy', 'away', 'sleep', 'dnd')),
  auto_respond_enabled boolean default true,
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Relay message log table
create table if not exists theia_relay_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  from_user text not null,
  to_user text not null,
  original_text text not null,
  relayed_text text,
  relay_method text check (relay_method in ('manual', 'auto', 'urgent')),
  was_auto_responded boolean default false,
  is_urgent boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Contact preferences table
create table if not exists theia_contact_preferences (
  id uuid primary key default gen_random_uuid(),
  user_phone text not null,
  contact_phone text not null,
  contact_name text,
  allow_auto_respond boolean default true,
  urgency_keywords text[] default array[]::text[],
  custom_away_message text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_phone, contact_phone)
);

-- User communication style profile table
create table if not exists theia_user_profile (
  id uuid primary key default gen_random_uuid(),
  user_phone text not null unique,
  typical_tone text default 'friendly',
  common_phrases text[] default array[]::text[],
  emoji_usage text default 'moderate',
  avg_response_length integer default 100,
  timezone text default 'UTC',
  work_hours jsonb default '{"start": "09:00", "end": "17:00"}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for performance
create index if not exists idx_relay_messages_from_user on theia_relay_messages(from_user);
create index if not exists idx_relay_messages_to_user on theia_relay_messages(to_user);
create index if not exists idx_relay_messages_created_at on theia_relay_messages(created_at desc);
create index if not exists idx_relay_messages_conversation_id on theia_relay_messages(conversation_id);
create index if not exists idx_contact_preferences_user_phone on theia_contact_preferences(user_phone);
create index if not exists idx_user_status_user_phone on theia_user_status(user_phone);

-- Enable Row Level Security (RLS)
alter table theia_user_status enable row level security;
alter table theia_relay_messages enable row level security;
alter table theia_contact_preferences enable row level security;
alter table theia_user_profile enable row level security;

-- Create policies for service role access
create policy "Service role can do everything on user_status"
  on theia_user_status for all
  using (true)
  with check (true);

create policy "Service role can do everything on relay_messages"
  on theia_relay_messages for all
  using (true)
  with check (true);

create policy "Service role can do everything on contact_preferences"
  on theia_contact_preferences for all
  using (true)
  with check (true);

create policy "Service role can do everything on user_profile"
  on theia_user_profile for all
  using (true)
  with check (true);
