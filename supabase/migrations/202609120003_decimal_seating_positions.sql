-- Room-map coordinates are percentages and may contain decimals after dragging.
alter table public.guest_tables
  alter column position_x type double precision using position_x::double precision,
  alter column position_y type double precision using position_y::double precision;
