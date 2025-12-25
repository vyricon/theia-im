-- Smart Relay Mode migrations
-- 1) Pending drafts table with expiry
-- 2) Add send_policy + context columns to theia_user_status

begin;

create table if not exists public.theia_pending_drafts (
  id bigserial primary key,
  contact_handle text not null,
  chat_guid text not null,
  draft_body text not null,
  context text null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists theia_pending_drafts_contact_handle_idx
  on public.theia_pending_drafts (contact_handle);

create index if not exists theia_pending_drafts_expires_at_idx
  on public.theia_pending_drafts (expires_at);

-- Add send_policy + context to user status
alter table if exists public.theia_user_status
  add column if not exists send_policy text not null default 'draft',
  add column if not exists context text null;

-- Basic constraint for send_policy
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'theia_user_status_send_policy_check'
  ) then
    alter table public.theia_user_status
      add constraint theia_user_status_send_policy_check
      check (send_policy in ('draft','yolo'));
  end if;
end $$;

commit;
