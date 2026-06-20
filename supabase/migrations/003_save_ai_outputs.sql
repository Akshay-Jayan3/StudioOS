-- Allows saving AI-generated outputs back onto the entity they're about,
-- so they survive page refresh/navigation instead of living only in browser state.

alter table leads add column if not exists discovery_brief jsonb;
alter table leads add column if not exists discovery_brief_saved_at timestamptz;

alter table projects add column if not exists latest_proposal jsonb;
alter table projects add column if not exists latest_proposal_saved_at timestamptz;
