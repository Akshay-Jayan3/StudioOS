-- DesignOS Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- LEADS
create table leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  project_type text,
  budget numeric,
  source text,
  status text not null default 'New Lead'
    check (status in ('New Lead', 'Discovery Scheduled', 'Proposal Sent', 'Won', 'Lost')),
  notes text,
  ai_score integer,
  ai_qualification jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CLIENTS
create table clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text,
  preferences text,
  notes text,
  lead_id uuid references leads(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PROJECTS
create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  client_id uuid references clients(id),
  status text not null default 'Discovery'
    check (status in ('Discovery', 'Design', 'Approval', 'Execution', 'Completed')),
  start_date date,
  end_date date,
  budget numeric,
  spent numeric default 0,
  designer text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AI TASK RUNS (log of every agent execution)
create table ai_task_runs (
  id uuid primary key default uuid_generate_v4(),
  agent text not null,
  trigger_type text not null check (trigger_type in ('manual', 'webhook', 'scheduled')),
  trigger_entity text,
  trigger_entity_id uuid,
  status text not null default 'running'
    check (status in ('running', 'completed', 'failed')),
  input jsonb,
  output jsonb,
  error text,
  duration_ms integer,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- MILESTONES
create table milestones (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  due_date date,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- updated_at auto-update trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at before update on leads
  for each row execute function update_updated_at();

create trigger clients_updated_at before update on clients
  for each row execute function update_updated_at();

create trigger projects_updated_at before update on projects
  for each row execute function update_updated_at();

-- Row Level Security (enable when you add auth)
alter table leads enable row level security;
alter table clients enable row level security;
alter table projects enable row level security;
alter table ai_task_runs enable row level security;
alter table milestones enable row level security;

-- Temp policy: allow all (replace with auth policies in Phase 2)
create policy "allow_all_leads" on leads for all using (true) with check (true);
create policy "allow_all_clients" on clients for all using (true) with check (true);
create policy "allow_all_projects" on projects for all using (true) with check (true);
create policy "allow_all_ai_runs" on ai_task_runs for all using (true) with check (true);
create policy "allow_all_milestones" on milestones for all using (true) with check (true);
