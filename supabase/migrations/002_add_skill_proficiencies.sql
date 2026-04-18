-- Add skill_proficiencies column to characters table
alter table public.characters
  add column if not exists skill_proficiencies text[] default null;
