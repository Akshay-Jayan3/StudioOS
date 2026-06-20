-- Extends the save/view pattern to Content and Update agent outputs.
-- Testimonial agent already has a dedicated `testimonials` table — we attach to that instead.

alter table projects add column if not exists latest_content jsonb;
alter table projects add column if not exists latest_content_saved_at timestamptz;

alter table projects add column if not exists latest_update jsonb;
alter table projects add column if not exists latest_update_saved_at timestamptz;
