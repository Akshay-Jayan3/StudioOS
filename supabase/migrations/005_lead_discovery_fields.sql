-- Adds the deeper discovery fields to leads so the AI chatbot's conversation
-- can carry through to a real Discovery Agent pre-fill, not just name/project_type/budget.

alter table leads add column if not exists space_description text;
alter table leads add column if not exists style_preferences text;
alter table leads add column if not exists must_haves text;
alter table leads add column if not exists pain_points text;
alter table leads add column if not exists timeline text;
