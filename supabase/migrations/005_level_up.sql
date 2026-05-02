-- Per-class level tracking for multiclass support
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/rhwgnomfkchgzpmqiubb/sql/new

CREATE TABLE IF NOT EXISTS public.character_classes (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id   uuid REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  class_id       uuid REFERENCES public.dnd_classes(id) ON DELETE SET NULL,
  class_name     text NOT NULL,
  level          integer NOT NULL DEFAULT 1,
  is_primary     boolean DEFAULT true,
  subclass       text,
  subclass_level integer,
  hit_die        integer NOT NULL DEFAULT 8,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE public.character_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner" ON public.character_classes
  FOR ALL USING (
    character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid())
  );

-- Audit log of every level-up action
CREATE TABLE IF NOT EXISTS public.character_level_history (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id uuid REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  total_level  integer NOT NULL,
  class_name   text NOT NULL,
  hp_gained    integer NOT NULL,
  choices      jsonb,   -- { asi: {stat: +n}, feat: 'name', subclass: 'name' }
  leveled_at   timestamptz DEFAULT now()
);

ALTER TABLE public.character_level_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner" ON public.character_level_history
  FOR ALL USING (
    character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid())
  );
