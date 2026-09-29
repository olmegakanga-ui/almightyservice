-- Each wedding chooses its presentation; existing invitations keep their current design.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS presentation_style text NOT NULL DEFAULT 'classic';

ALTER TABLE public.events
  ADD CONSTRAINT events_presentation_style_check
  CHECK (presentation_style IN ('classic', 'floral'));
