-- Recipe AI Database Schema for Supabase (shared recipes, no auth)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  ingredients TEXT[] NOT NULL,
  steps TEXT[] NOT NULL,
  duration TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  filters TEXT[] DEFAULT '{}',
  cuisine_type TEXT,
  nutrition JSONB,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON public.recipes(created_at DESC);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipes are public" ON public.recipes FOR ALL USING (true);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
