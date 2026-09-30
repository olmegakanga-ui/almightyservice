BEGIN;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS couple_cutout_url text;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_presentation_style_check;
ALTER TABLE public.events ADD CONSTRAINT events_presentation_style_check CHECK (presentation_style IN ('classic', 'floral', 'animated'));
COMMIT;
