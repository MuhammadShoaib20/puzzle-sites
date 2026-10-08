-- Add per-game platform metadata used by VideoGame structured data.
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS operating_system text DEFAULT 'Android, iOS';

UPDATE public.games
SET operating_system = 'Android, iOS'
WHERE operating_system IS NULL;
