-- Tier 1 features: Lost Reason, Testimonials, Onboarding Files
-- Run this in Supabase SQL Editor after schema.sql

-- Lost reason tracking on leads
alter table leads add column if not exists lost_reason text;
alter table leads add column if not exists lost_notes text;
alter table leads add column if not exists revisit_date date;

-- Onboarding files (measurements, floor plans, inspiration images)
create table if not exists project_files (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text not null check (file_type in ('measurement', 'floor_plan', 'inspiration', 'other')),
  uploaded_at timestamptz default now()
);

alter table project_files enable row level security;
create policy "allow_all_project_files" on project_files for all using (true) with check (true);

-- Testimonials / reviews
create table if not exists testimonials (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  client_name text not null,
  status text not null default 'Requested'
    check (status in ('Requested', 'Received', 'Published', 'Declined')),
  request_message text,
  testimonial_text text,
  rating integer check (rating between 1 and 5),
  requested_at timestamptz default now(),
  received_at timestamptz
);

alter table testimonials enable row level security;
create policy "allow_all_testimonials" on testimonials for all using (true) with check (true);

-- Storage bucket for project files (run separately if needed via Supabase Storage UI)
-- Or via SQL:
insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', true)
on conflict (id) do nothing;

create policy "allow_all_storage_read" on storage.objects
  for select using (bucket_id = 'project-files');
create policy "allow_all_storage_insert" on storage.objects
  for insert with check (bucket_id = 'project-files');
create policy "allow_all_storage_delete" on storage.objects
  for delete using (bucket_id = 'project-files');
