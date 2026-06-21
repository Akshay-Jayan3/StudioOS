-- Single-row table holding studio-wide settings editable from /admin/settings.
create table if not exists site_settings (
  id text primary key default 'default',
  studio_name text not null default 'Datrium',
  location text not null default 'Kerala, India',
  contact_email text not null default 'hello@datrium.in',
  updated_at timestamptz default now()
);

insert into site_settings (id, studio_name, location, contact_email)
values ('default', 'Datrium', 'Kerala, India', 'hello@datrium.in')
on conflict (id) do nothing;

alter table site_settings enable row level security;
create policy "allow_all_site_settings" on site_settings for all using (true) with check (true);
