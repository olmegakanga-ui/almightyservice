-- The seating layout API authenticates the caller first, then performs the
-- update with Supabase's server-only service role. Keep browser roles read-only
-- while restoring only the privileges required by that server operation.
grant select, update on table public.events to service_role;
grant select, update on table public.guest_tables to service_role;
