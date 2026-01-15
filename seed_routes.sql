-- Seed Data for GerakKita (Medan Context) - VALID UUIDs

-- 1. Insert Bus Stops (Halte)
-- UUIDs: 1...1 to a...a (Valid hex)
INSERT INTO public.bus_stops (id, name, latitude, longitude, address, city) VALUES
('11111111-1111-1111-1111-111111111111', 'Terminal Amplas', 3.5400, 98.7100, 'Jl. Panglima Denai', 'Medan'),
('22222222-2222-2222-2222-222222222222', 'Pusat Pasar', 3.5900, 98.6800, 'Jl. Pusat Pasar', 'Medan'),
('33333333-3333-3333-3333-333333333333', 'Lapangan Merdeka', 3.5950, 98.6770, 'Jl. Balai Kota', 'Medan'),
('44444444-4444-4444-4444-444444444444', 'Bandara Kualanamu', 3.6300, 98.8800, 'Deli Serdang', 'Deli Serdang'),
('55555555-5555-5555-5555-555555555555', 'Stasiun Medan', 3.5930, 98.6790, 'Jl. Stasiun Kereta', 'Medan'),
('66666666-6666-6666-6666-666666666666', 'Belawan', 3.7800, 98.6700, 'Jl. Pelabuhan Belawan', 'Medan'),
('77777777-7777-7777-7777-777777777777', 'Plaza Medan Fair', 3.5970, 98.6650, 'Jl. Gatot Subroto', 'Medan'),
('88888888-8888-8888-8888-888888888888', 'Universitas Sumatera Utara', 3.5650, 98.6550, 'Jl. Dr. Mansyur', 'Medan'),
('99999999-9999-9999-9999-999999999999', 'Polonia Sky Park', 3.5600, 98.6700, 'Jl. Imam Bonjol', 'Medan'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Marelan', 3.6800, 98.6500, 'Jl. Marelan Raya', 'Medan');

-- 2. Insert Routes
-- UUIDs: Use digits 0-9 to form valid hex (e.g. 1010...)
INSERT INTO public.routes (id, route_number, route_name, description, estimated_duration, status) VALUES
('10101010-1010-1010-1010-101010101010', '1A', 'Terminal Amplas - Pusat Kota', 'Rute utama dari terminal selatan ke pusat kota', '45 minutes', 'active'),
('20202020-2020-2020-2020-202020202020', '2B', 'Lapangan Merdeka - Bandara Kualanamu', 'Rute ekspres ke bandara', '1 hour 15 minutes', 'active'),
('30303030-3030-3030-3030-303030303030', '3C', 'Stasiun Medan - Belawan', 'Rute utara ke pelabuhan', '55 minutes', 'active');

-- 3. Insert Route Stops (Linking Routes to Stops)
-- Route 1A (1010...): Amplas -> USU -> Plaza Medan Fair -> Pusat Pasar
INSERT INTO public.route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
('10101010-1010-1010-1010-101010101010', '11111111-1111-1111-1111-111111111111', 1, 0),
('10101010-1010-1010-1010-101010101010', '88888888-8888-8888-8888-888888888888', 2, 3000),
('10101010-1010-1010-1010-101010101010', '77777777-7777-7777-7777-777777777777', 3, 5000),
('10101010-1010-1010-1010-101010101010', '22222222-2222-2222-2222-222222222222', 4, 7000);

-- Route 2B (2020...): Lapangan Merdeka -> Polonia -> Kualanamu
INSERT INTO public.route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
('20202020-2020-2020-2020-202020202020', '33333333-3333-3333-3333-333333333333', 1, 0),
('20202020-2020-2020-2020-202020202020', '99999999-9999-9999-9999-999999999999', 2, 5000),
('20202020-2020-2020-2020-202020202020', '44444444-4444-4444-4444-444444444444', 3, 40000);

-- Route 3C (3030...): Stasiun Medan -> Marelan -> Belawan
INSERT INTO public.route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
('30303030-3030-3030-3030-303030303030', '55555555-5555-5555-5555-555555555555', 1, 0),
('30303030-3030-3030-3030-303030303030', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, 4000),
('30303030-3030-3030-3030-303030303030', '66666666-6666-6666-6666-666666666666', 3, 8000);

-- 4. Insert Buses
INSERT INTO public.buses ("id", "bus_number", "route_id", "total_seats", "available_seats", "status", "current_latitude", "current_longitude", "last_location_update", "created_at", "updated_at") VALUES 
('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b1', 'BK 1001 AA', '10101010-1010-1010-1010-101010101010', '40', '35', 'available', null, null, null, '2026-01-15 09:57:23', '2026-01-15 09:57:23'), -- Low occupancy (5/40 used)
('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b2', 'BK 2002 BB', '20202020-2020-2020-2020-202020202020', '40', '15', 'available', null, null, null, '2026-01-15 09:57:23', '2026-01-15 09:57:23'), -- Half full (25/40 used)
('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b3', 'BK 3003 CC', '30303030-3030-3030-3030-303030303030', '40', '2', 'available', null, null, null, '2026-01-15 09:57:23', '2026-01-15 09:57:23'); -- Full (38/40 used)

-- 5. Insert Bus Schedules
-- Bus 1A Schedules
INSERT INTO public.bus_schedules (bus_id, departure_time, arrival_time, days_of_week) VALUES
('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b1', '06:00:00', '07:30:00', ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b1', '08:00:00', '09:30:00', ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b1', '10:00:00', '11:30:00', ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b1', '07:00:00', '08:30:00', ARRAY['Saturday', 'Sunday']);

-- Bus 2B Schedules
INSERT INTO public.bus_schedules (bus_id, departure_time, arrival_time, days_of_week) VALUES
('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b2', '05:30:00', '07:00:00', ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b2', '09:00:00', '10:30:00', ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b2', '14:00:00', '15:30:00', ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);

-- Bus 3C Schedules
INSERT INTO public.bus_schedules (bus_id, departure_time, arrival_time, days_of_week) VALUES
('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b3', '06:15:00', '07:45:00', ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
