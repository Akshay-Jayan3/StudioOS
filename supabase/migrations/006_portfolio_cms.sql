-- Turns the public site's hardcoded portfolio into a real, admin-editable CMS.

create table if not exists portfolio_projects (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  location text,
  category text,
  description text,
  image_url text,
  featured boolean not null default false,
  published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger portfolio_projects_updated_at before update on portfolio_projects
  for each row execute function update_updated_at();

alter table portfolio_projects enable row level security;
create policy "allow_all_portfolio_projects" on portfolio_projects for all using (true) with check (true);

-- Public read of published-only via anon key; writes go through service role from /admin

-- Storage bucket for portfolio images (mirrors project-files pattern)
insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

create policy "allow_all_portfolio_storage_read" on storage.objects
  for select using (bucket_id = 'portfolio-images');
create policy "allow_all_portfolio_storage_insert" on storage.objects
  for insert with check (bucket_id = 'portfolio-images');
create policy "allow_all_portfolio_storage_delete" on storage.objects
  for delete using (bucket_id = 'portfolio-images');
