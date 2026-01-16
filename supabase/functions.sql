-- Enable PostGIS extension if not already enabled (User says it is, but good to have)
create extension if not exists postgis;

-- Function 1: Calculate distance between two points (in meters)
create or replace function calculate_distance_meters(
  lat1 numeric,
  lon1 numeric,
  lat2 numeric,
  lon2 numeric
)
returns float
language plpgsql
as $$
declare
  dist float;
begin
  select st_distance(
    st_setsrid(st_makepoint(lon1, lat1), 4326)::geography,
    st_setsrid(st_makepoint(lon2, lat2), 4326)::geography
  ) into dist;
  return dist;
end;
$$;

-- Function 2: Get active buses for a route with distance to user and simple ETA
-- Note: 'eta_minutes' is a rough estimate using average speed (e.g., 20 km/h)
create or replace function get_route_buses_with_location(
  p_route_id uuid,
  user_lat numeric,
  user_lon numeric
)
returns table (
  id uuid,
  bus_number text,
  status text,
  current_latitude numeric,
  current_longitude numeric,
  last_location_update timestamptz,
  distance_meters float,
  eta_minutes int
)
language plpgsql
as $$
begin
  return query
  select
    b.id,
    b.bus_number,
    b.status,
    b.current_latitude,
    b.current_longitude,
    b.last_location_update,
    -- Calculate distance
    st_distance(
      st_setsrid(st_makepoint(b.current_longitude, b.current_latitude), 4326)::geography,
      st_setsrid(st_makepoint(user_lon, user_lat), 4326)::geography
    ) as distance_meters,
    -- Estimate ETA: distance (m) / speed (m/min). 
    -- Avg bus speed ~20 km/h = ~333 m/min.
    -- We'll use a conservative 300 m/min.
    (
      st_distance(
        st_setsrid(st_makepoint(b.current_longitude, b.current_latitude), 4326)::geography,
        st_setsrid(st_makepoint(user_lon, user_lat), 4326)::geography
      ) / 300
    )::int as eta_minutes
  from
    buses b
  where
    b.route_id = p_route_id
    and b.status = 'available'
    and b.current_latitude is not null
    and b.current_longitude is not null;
end;
$$;
