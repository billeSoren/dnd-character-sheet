-- character_items: links characters to magic items
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/rhwgnomfkchgzpmqiubb/sql/new

CREATE TABLE IF NOT EXISTS public.character_items (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id uuid REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  item_id      uuid REFERENCES public.magic_items(id) ON DELETE CASCADE NOT NULL,
  added_at     timestamptz DEFAULT now(),
  equipped     boolean DEFAULT false,
  attuned      boolean DEFAULT false,
  quantity     integer DEFAULT 1,
  notes        text,
  UNIQUE (character_id, item_id)
);

ALTER TABLE public.character_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner" ON public.character_items
  FOR ALL USING (
    character_id IN (
      SELECT id FROM public.characters WHERE user_id = auth.uid()
    )
  );
