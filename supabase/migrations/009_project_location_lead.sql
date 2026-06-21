-- Lets a project carry its location/category (handy later for turning it into a
-- portfolio case study without retyping) and trace back to the lead it came from.
alter table projects add column if not exists location text;
alter table projects add column if not exists category text;
alter table projects add column if not exists lead_id uuid references leads(id);
