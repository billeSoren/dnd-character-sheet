-- Add source-preference column to characters so level-up subclass filtering
-- respects the choices made at character-creation time.
-- Default '{PHB,BR}' matches DEFAULT_FORM_DATA.allowedSources in types.ts.
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/rhwgnomfkchgzpmqiubb/sql/new

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS allowed_sources text[] DEFAULT '{PHB,BR}';
