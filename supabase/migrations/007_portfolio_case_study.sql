-- Adds case-study depth to portfolio projects so each one can have its own detail page.

alter table portfolio_projects add column if not exists problem text;
alter table portfolio_projects add column if not exists process_text text;
alter table portfolio_projects add column if not exists outcome text;
alter table portfolio_projects add column if not exists designer_quote text;
alter table portfolio_projects add column if not exists client_name text;
alter table portfolio_projects add column if not exists year text;
alter table portfolio_projects add column if not exists gallery jsonb default '[]'::jsonb;
alter table portfolio_projects add column if not exists tags jsonb default '[]'::jsonb;
