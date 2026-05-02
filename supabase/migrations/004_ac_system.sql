-- Active effects that modify AC (Mage Armor, Shield of Faith, etc.)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/rhwgnomfkchgzpmqiubb/sql/new

CREATE TABLE IF NOT EXISTS public.character_active_effects (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id uuid REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  effect_name  text NOT NULL,
  effect_type  text NOT NULL, -- 'ac_bonus' | 'ac_override' | 'ac_set_minimum' | 'natural_armor'
  value        integer NOT NULL,
  source       text,
  source_name  text,
  expires_at   timestamptz,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.character_active_effects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner" ON public.character_active_effects
  FOR ALL USING (
    character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid())
  );
