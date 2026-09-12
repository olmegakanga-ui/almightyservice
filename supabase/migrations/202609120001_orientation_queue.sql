alter table public.events
  add column if not exists room_map_url text;

alter table public.checkin_logs
  add column if not exists orientation_status text not null default 'new'
    check (orientation_status in ('new', 'claimed', 'seated')),
  add column if not exists orientation_updated_at timestamptz,
  add column if not exists orientation_by text;

create index if not exists checkin_logs_orientation_queue_idx
  on public.checkin_logs (event_id, orientation_status, performed_at desc)
  where action = 'checkin';

-- Realtime doit inclure checkin_logs pour que le poste Orientation reçoive les arrivées.
do $$
begin
  alter publication supabase_realtime add table public.checkin_logs;
exception
  when duplicate_object then null;
end $$;
