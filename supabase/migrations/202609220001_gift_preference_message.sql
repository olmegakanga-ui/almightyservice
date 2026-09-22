alter table public.events
  add column if not exists gift_preference_type text not null default 'none'
    check (gift_preference_type in ('none', 'envelope', 'present', 'contribution', 'custom')),
  add column if not exists gift_preference_message text,
  add column if not exists gift_message_channels text[] not null default '{}';
