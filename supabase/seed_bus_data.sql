-- Generated seed data for bus routes and stops
-- Run this in Supabase SQL Editor

-- Clean existing data
TRUNCATE TABLE routes CASCADE;
TRUNCATE TABLE bus_stops CASCADE;

-- Insert routes
INSERT INTO routes (id, route_number, route_name, description, status) VALUES
  ('519ce1c0-dc03-59fd-ad7c-9a749cc28e22', 'K1', 'Koridor 1', 'Terminal Pinang Baris - Halte Lapangan Merdeka (Pusat)', 'active');

INSERT INTO routes (id, route_number, route_name, description, status) VALUES
  ('06e3256e-739c-5b35-94fa-6b9c96da28f0', 'K2', 'Koridor 2', 'Terminal Amplas - Halte Lapangan Merdeka (Pusat)', 'active');

INSERT INTO routes (id, route_number, route_name, description, status) VALUES
  ('ed5ecaaf-f4ab-5848-83f1-483b13320c8f', 'K3', 'Koridor 3', 'Terminal Belawan - Halte Kantor Pos Besar', 'active');

INSERT INTO routes (id, route_number, route_name, description, status) VALUES
  ('d5f5dfc7-f7b1-5ed4-8979-07ed89e5d967', 'K4', 'Koridor 4', 'Simpang Tuntungan - Halte Iskandar Muda', 'active');

INSERT INTO routes (id, route_number, route_name, description, status) VALUES
  ('fb1de59c-4112-59f2-9976-164ccb95671e', 'K5', 'Koridor 5', 'Pasar Tembung (Simpang Jodoh) - Halte Lapangan Merdeka (Pusat)', 'active');

-- Insert bus stops
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('9858ccac-272e-59a2-ac4d-af32c14c84ad', 'Terminal Pinang Baris', 3.5938, 98.6074, 'Jl. TB Simatupang');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('536dc2a1-6671-5d41-b3bb-b0d19fc90dc6', 'Halte Simpang Pinang Baris', 3.5925, 98.6112, 'Jl. TB Simatupang');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('2299148e-d7df-57a5-adde-378194f82262', 'Halte Lotte Mart', 3.5901, 98.6185, 'Jl. Gatot Subroto');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('8d7375e0-8517-5b57-ab45-9fac3cf0ddd7', 'Halte Kodam I/BB', 3.588, 98.625, 'Jl. Gatot Subroto');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('d66e0246-0202-5bea-873c-a422957fffcf', 'Halte Imigrasi', 3.5875, 98.632, 'Jl. Gatot Subroto');

INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('f2f3a7fb-8d86-5265-ab66-eca0587ab669', 'Halte Tomang Elok', 3.589, 98.641, 'Jl. Gatot Subroto');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('76203c08-964e-594c-84a6-7aecd0ef6d6a', 'Halte RS Advent', 3.5912, 98.652, 'Jl. Gatot Subroto');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('6996438c-5ddc-5a10-b4e0-5adbbb89eb56', 'Halte Berastagi Supermarket', 3.5925, 98.658, 'Jl. Gatot Subroto');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('288a7303-48ce-501d-8320-1b54d15a77fb', 'Halte Gajah Mada', 3.5885, 98.665, 'Jl. Gajah Mada');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('0796525a-addc-5938-94dc-947730506609', 'Halte Cambridge City Square', 3.5845, 98.6695, 'Jl. S. Parman');

INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('00e8d299-0549-54bd-acb2-90effc03b7f4', 'Halte Kantor Walikota', 3.5905, 98.675, 'Jl. Kapten Maulana Lubis');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('9884c2a0-05ce-5798-a0ac-c6ffe928a129', 'Halte Lapangan Merdeka (Pusat)', 3.5915, 98.6775, 'Jl. Balai Kota');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('19db27ff-741a-5a95-ad50-96f558e36bdd', 'Terminal Amplas', 3.5385, 98.7115, 'Jl. Panglima Denai');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('2e5e9f9b-7a35-5245-a77a-5bfccd2ef8aa', 'Halte ALS', 3.542, 98.709, 'Jl. Sisingamangaraja');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('80f4dcf3-0a38-540c-a57a-832134b05c4a', 'Halte Simpang Limun', 3.551, 98.703, 'Jl. Sisingamangaraja');

INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('69c68b89-728e-511d-ba53-6493b336924e', 'Halte Stadion Teladan', 3.5655, 98.694, 'Jl. Sisingamangaraja');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('724bfd3c-7224-5704-b8c6-afc4c481c3ba', 'Halte Juanda', 3.572, 98.689, 'Jl. Ir. H. Juanda');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('67f075fb-6b8d-550c-93a2-75db56e66342', 'Halte Taman Sri Deli', 3.5765, 98.687, 'Jl. Mesjid Raya');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('614cafbf-e41b-577f-a87e-8e029a2eb027', 'Halte Kesawan', 3.589, 98.679, 'Jl. Ahmad Yani');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('7843337f-2599-5a90-a9d3-f3b64c8b2cd7', 'Terminal Belawan', 3.7845, 98.679, 'Jl. Stasiun');

INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('31df03ea-7b86-51f4-8acd-f1457e9e7c93', 'Halte Stasiun Belawan', 3.78, 98.678, 'Jl. Sumatera');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('1adbddaf-0a2b-5be3-aff0-a28a112f09a5', 'Halte Simpang Kantor', 3.745, 98.67, 'Jl. KL Yos Sudarso');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('6dd6dcf5-9c3d-5db1-bc85-57753439d19a', 'Halte Pasar Titi Papan', 3.705, 98.668, 'Jl. KL Yos Sudarso');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('6f802337-7c95-50ba-840d-9b9151ec3207', 'Halte Simpang Martubung', 3.692, 98.665, 'Jl. KL Yos Sudarso');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('c3220c3b-dba7-595e-90a6-0e1a769fc5d4', 'Halte Brayan (Maju Bersama)', 3.628, 98.673, 'Jl. KL Yos Sudarso');

INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('ccc9c698-7b52-5d23-b81e-170cc8ec4271', 'Halte Glugur (Putri Hijau)', 3.605, 98.675, 'Jl. Putri Hijau');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('5c75bb81-930f-513d-8478-051ec1ee40de', 'Halte Kantor Pos Besar', 3.593, 98.6765, 'Jl. Balai Kota');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('0e7c8daa-d304-54cc-991f-3a08f0dd3405', 'Simpang Tuntungan', 3.505, 98.595, 'Jl. Jamin Ginting');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('b9bbc7eb-a48a-5a9f-b3bd-3ab28aaad627', 'Halte RS Adam Malik', 3.518, 98.605, 'Jl. Bunga Lau');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('b383e617-b8bf-5d55-a0ac-a39ded3e4bae', 'Halte Simpang Selayang', 3.525, 98.615, 'Jl. Jamin Ginting');

INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('f802bc7b-c95f-50f0-a81e-456d68c0c2f2', 'Halte Simpang Pos', 3.542, 98.635, 'Jl. Jamin Ginting');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('33daf7d6-e362-5a58-8a5b-db259cca8114', 'Halte Citra Garden', 3.548, 98.642, 'Jl. Jamin Ginting');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('b27f2066-8de4-5c82-afee-c97fee030103', 'Halte Pajus (USU)', 3.562, 98.653, 'Jl. Jamin Ginting');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('96846c1c-b2f6-584c-b2f7-082f71834835', 'Halte Dr. Mansyur', 3.568, 98.655, 'Jl. Dr. Mansyur');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('05bb09e7-01dc-508b-a3b6-9e03119c62f5', 'Halte Iskandar Muda', 3.58, 98.66, 'Jl. Iskandar Muda');

INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('0c43548c-44b1-5e8f-a513-c0c203bfa25a', 'Pasar Tembung (Simpang Jodoh)', 3.595, 98.74, 'Jl. Besar Tembung');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('2e6ed517-d570-57bd-8154-60d076333de1', 'Halte UNIMED', 3.61, 98.725, 'Jl. Williem Iskandar');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('a9a2c273-d512-5f21-9b76-6a616d43b154', 'Halte RS Haji', 3.605, 98.72, 'Jl. RS Haji');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('3b7f07a8-6a42-57a9-aaed-854bf25407d4', 'Halte Simpang Aksara', 3.6, 98.71, 'Jl. Letda Sujono');
INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('9f98c571-9254-5588-8362-8393ae51d45c', 'Halte Sentosa', 3.598, 98.7, 'Jl. HM Yamin');

INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES
  ('a6e9bc8f-5bb9-5bea-a8f1-87e10864b804', 'Halte Moh. Yamin', 3.595, 98.69, 'Jl. HM Yamin');

-- Insert route_stops (linking routes to stops)
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('519ce1c0-dc03-59fd-ad7c-9a749cc28e22', '9858ccac-272e-59a2-ac4d-af32c14c84ad', 1, 3000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('519ce1c0-dc03-59fd-ad7c-9a749cc28e22', '536dc2a1-6671-5d41-b3bb-b0d19fc90dc6', 2, 4000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('519ce1c0-dc03-59fd-ad7c-9a749cc28e22', '2299148e-d7df-57a5-adde-378194f82262', 3, 5000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('519ce1c0-dc03-59fd-ad7c-9a749cc28e22', '8d7375e0-8517-5b57-ab45-9fac3cf0ddd7', 4, 6000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('519ce1c0-dc03-59fd-ad7c-9a749cc28e22', 'd66e0246-0202-5bea-873c-a422957fffcf', 5, 7000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('519ce1c0-dc03-59fd-ad7c-9a749cc28e22', 'f2f3a7fb-8d86-5265-ab66-eca0587ab669', 6, 8000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('519ce1c0-dc03-59fd-ad7c-9a749cc28e22', '76203c08-964e-594c-84a6-7aecd0ef6d6a', 7, 9000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('519ce1c0-dc03-59fd-ad7c-9a749cc28e22', '6996438c-5ddc-5a10-b4e0-5adbbb89eb56', 8, 10000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('519ce1c0-dc03-59fd-ad7c-9a749cc28e22', '288a7303-48ce-501d-8320-1b54d15a77fb', 9, 11000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('519ce1c0-dc03-59fd-ad7c-9a749cc28e22', '0796525a-addc-5938-94dc-947730506609', 10, 12000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('519ce1c0-dc03-59fd-ad7c-9a749cc28e22', '00e8d299-0549-54bd-acb2-90effc03b7f4', 11, 13000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('519ce1c0-dc03-59fd-ad7c-9a749cc28e22', '9884c2a0-05ce-5798-a0ac-c6ffe928a129', 12, 14000);

INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('06e3256e-739c-5b35-94fa-6b9c96da28f0', '19db27ff-741a-5a95-ad50-96f558e36bdd', 1, 3000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('06e3256e-739c-5b35-94fa-6b9c96da28f0', '2e5e9f9b-7a35-5245-a77a-5bfccd2ef8aa', 2, 4000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('06e3256e-739c-5b35-94fa-6b9c96da28f0', '80f4dcf3-0a38-540c-a57a-832134b05c4a', 3, 5000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('06e3256e-739c-5b35-94fa-6b9c96da28f0', '69c68b89-728e-511d-ba53-6493b336924e', 4, 6000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('06e3256e-739c-5b35-94fa-6b9c96da28f0', '724bfd3c-7224-5704-b8c6-afc4c481c3ba', 5, 7000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('06e3256e-739c-5b35-94fa-6b9c96da28f0', '67f075fb-6b8d-550c-93a2-75db56e66342', 6, 8000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('06e3256e-739c-5b35-94fa-6b9c96da28f0', '614cafbf-e41b-577f-a87e-8e029a2eb027', 7, 9000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('06e3256e-739c-5b35-94fa-6b9c96da28f0', '9884c2a0-05ce-5798-a0ac-c6ffe928a129', 8, 10000);

INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('ed5ecaaf-f4ab-5848-83f1-483b13320c8f', '7843337f-2599-5a90-a9d3-f3b64c8b2cd7', 1, 3000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('ed5ecaaf-f4ab-5848-83f1-483b13320c8f', '31df03ea-7b86-51f4-8acd-f1457e9e7c93', 2, 4000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('ed5ecaaf-f4ab-5848-83f1-483b13320c8f', '1adbddaf-0a2b-5be3-aff0-a28a112f09a5', 3, 5000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('ed5ecaaf-f4ab-5848-83f1-483b13320c8f', '6dd6dcf5-9c3d-5db1-bc85-57753439d19a', 4, 6000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('ed5ecaaf-f4ab-5848-83f1-483b13320c8f', '6f802337-7c95-50ba-840d-9b9151ec3207', 5, 7000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('ed5ecaaf-f4ab-5848-83f1-483b13320c8f', 'c3220c3b-dba7-595e-90a6-0e1a769fc5d4', 6, 8000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('ed5ecaaf-f4ab-5848-83f1-483b13320c8f', 'ccc9c698-7b52-5d23-b81e-170cc8ec4271', 7, 9000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('ed5ecaaf-f4ab-5848-83f1-483b13320c8f', '5c75bb81-930f-513d-8478-051ec1ee40de', 8, 10000);

INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('d5f5dfc7-f7b1-5ed4-8979-07ed89e5d967', '0e7c8daa-d304-54cc-991f-3a08f0dd3405', 1, 3000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('d5f5dfc7-f7b1-5ed4-8979-07ed89e5d967', 'b9bbc7eb-a48a-5a9f-b3bd-3ab28aaad627', 2, 4000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('d5f5dfc7-f7b1-5ed4-8979-07ed89e5d967', 'b383e617-b8bf-5d55-a0ac-a39ded3e4bae', 3, 5000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('d5f5dfc7-f7b1-5ed4-8979-07ed89e5d967', 'f802bc7b-c95f-50f0-a81e-456d68c0c2f2', 4, 6000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('d5f5dfc7-f7b1-5ed4-8979-07ed89e5d967', '33daf7d6-e362-5a58-8a5b-db259cca8114', 5, 7000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('d5f5dfc7-f7b1-5ed4-8979-07ed89e5d967', 'b27f2066-8de4-5c82-afee-c97fee030103', 6, 8000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('d5f5dfc7-f7b1-5ed4-8979-07ed89e5d967', '96846c1c-b2f6-584c-b2f7-082f71834835', 7, 9000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('d5f5dfc7-f7b1-5ed4-8979-07ed89e5d967', '05bb09e7-01dc-508b-a3b6-9e03119c62f5', 8, 10000);

INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('fb1de59c-4112-59f2-9976-164ccb95671e', '0c43548c-44b1-5e8f-a513-c0c203bfa25a', 1, 3000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('fb1de59c-4112-59f2-9976-164ccb95671e', '2e6ed517-d570-57bd-8154-60d076333de1', 2, 4000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('fb1de59c-4112-59f2-9976-164ccb95671e', 'a9a2c273-d512-5f21-9b76-6a616d43b154', 3, 5000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('fb1de59c-4112-59f2-9976-164ccb95671e', '3b7f07a8-6a42-57a9-aaed-854bf25407d4', 4, 6000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('fb1de59c-4112-59f2-9976-164ccb95671e', '9f98c571-9254-5588-8362-8393ae51d45c', 5, 7000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('fb1de59c-4112-59f2-9976-164ccb95671e', 'a6e9bc8f-5bb9-5bea-a8f1-87e10864b804', 6, 8000);
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES
  ('fb1de59c-4112-59f2-9976-164ccb95671e', '9884c2a0-05ce-5798-a0ac-c6ffe928a129', 7, 9000);

-- Insert buses
INSERT INTO buses (id, bus_number, route_id, total_seats, available_seats, status) VALUES
  ('bec7a363-059e-53e4-99f1-37f755305ccc', 'K1-01', '519ce1c0-dc03-59fd-ad7c-9a749cc28e22', 40, 40, 'available');
INSERT INTO buses (id, bus_number, route_id, total_seats, available_seats, status) VALUES
  ('a5d5e19a-eb3d-5e4c-bcc3-559d2771d241', 'K1-02', '519ce1c0-dc03-59fd-ad7c-9a749cc28e22', 40, 40, 'available');
INSERT INTO buses (id, bus_number, route_id, total_seats, available_seats, status) VALUES
  ('4e17c7f6-36a5-5158-864f-6e9bce124ba0', 'K2-01', '06e3256e-739c-5b35-94fa-6b9c96da28f0', 40, 40, 'available');
INSERT INTO buses (id, bus_number, route_id, total_seats, available_seats, status) VALUES
  ('8f5adb9f-8140-52f3-ad28-93223a7dc601', 'K2-02', '06e3256e-739c-5b35-94fa-6b9c96da28f0', 40, 40, 'available');
INSERT INTO buses (id, bus_number, route_id, total_seats, available_seats, status) VALUES
  ('8cfe98b0-7348-5a2c-bee4-48799df3283c', 'K3-01', 'ed5ecaaf-f4ab-5848-83f1-483b13320c8f', 40, 40, 'available');
INSERT INTO buses (id, bus_number, route_id, total_seats, available_seats, status) VALUES
  ('f339fdcb-b76f-5703-af4f-d977a90fe398', 'K3-02', 'ed5ecaaf-f4ab-5848-83f1-483b13320c8f', 40, 40, 'available');
INSERT INTO buses (id, bus_number, route_id, total_seats, available_seats, status) VALUES
  ('de635dce-fd56-52d6-b633-feec69ab4056', 'K4-01', 'd5f5dfc7-f7b1-5ed4-8979-07ed89e5d967', 40, 40, 'available');
INSERT INTO buses (id, bus_number, route_id, total_seats, available_seats, status) VALUES
  ('1d4e8398-4cd8-5423-b187-a55942e11647', 'K4-02', 'd5f5dfc7-f7b1-5ed4-8979-07ed89e5d967', 40, 40, 'available');
INSERT INTO buses (id, bus_number, route_id, total_seats, available_seats, status) VALUES
  ('e0c3e001-f94e-5865-8067-314152fc067a', 'K5-01', 'fb1de59c-4112-59f2-9976-164ccb95671e', 40, 40, 'available');
INSERT INTO buses (id, bus_number, route_id, total_seats, available_seats, status) VALUES
  ('5e4c60b6-b38c-5193-89bd-9642464f7b3d', 'K5-02', 'fb1de59c-4112-59f2-9976-164ccb95671e', 40, 40, 'available');

-- Insert bus_schedules
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('00256ab8-29a4-5021-b6cf-7f9a25f2b496', 'bec7a363-059e-53e4-99f1-37f755305ccc', '06:00:00', '07:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('12beee57-0b69-5e47-99e9-19e453f0771d', 'bec7a363-059e-53e4-99f1-37f755305ccc', '09:00:00', '10:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('4456a021-8438-5b6d-b2ab-9226f0bc72cc', 'bec7a363-059e-53e4-99f1-37f755305ccc', '13:00:00', '14:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('f6579358-6498-5d46-a091-2da358642baa', 'bec7a363-059e-53e4-99f1-37f755305ccc', '17:00:00', '18:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('7e243771-f235-51e3-aa1f-923f45b73c69', 'a5d5e19a-eb3d-5e4c-bcc3-559d2771d241', '06:00:00', '07:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('c405cc93-21d4-5824-9c0e-169f2f7de657', 'a5d5e19a-eb3d-5e4c-bcc3-559d2771d241', '09:00:00', '10:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('17fc3486-905d-5dca-bd10-d9bec65a4959', 'a5d5e19a-eb3d-5e4c-bcc3-559d2771d241', '13:00:00', '14:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('e9eeb73a-562c-5feb-93af-55c445e3cc7a', 'a5d5e19a-eb3d-5e4c-bcc3-559d2771d241', '17:00:00', '18:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('be311d4f-93a9-5327-994b-ff6e50f7d608', '4e17c7f6-36a5-5158-864f-6e9bce124ba0', '06:00:00', '07:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('945ba83f-cb91-5030-b792-f0f1aef20259', '4e17c7f6-36a5-5158-864f-6e9bce124ba0', '09:00:00', '10:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('dd395cd1-5b9d-5191-bdd5-123063fdaa9c', '4e17c7f6-36a5-5158-864f-6e9bce124ba0', '13:00:00', '14:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('16a33413-d0f8-5a66-9e1d-4b8a897dc831', '4e17c7f6-36a5-5158-864f-6e9bce124ba0', '17:00:00', '18:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('895c46bb-8541-536b-8640-120fea92dda8', '8f5adb9f-8140-52f3-ad28-93223a7dc601', '06:00:00', '07:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('e8551dbc-2fb0-5ff5-b82f-afc657e74b5e', '8f5adb9f-8140-52f3-ad28-93223a7dc601', '09:00:00', '10:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('23ee491f-355b-544c-8a41-7b2b45a166e7', '8f5adb9f-8140-52f3-ad28-93223a7dc601', '13:00:00', '14:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('04df5412-17bb-5748-a627-1ca903ca3f2f', '8f5adb9f-8140-52f3-ad28-93223a7dc601', '17:00:00', '18:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('c6f976b0-5194-57c3-9183-8696e1872249', '8cfe98b0-7348-5a2c-bee4-48799df3283c', '06:00:00', '07:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('ff3ba400-7375-5299-809b-c682f1187653', '8cfe98b0-7348-5a2c-bee4-48799df3283c', '09:00:00', '10:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('2cc0a7ca-bec0-587a-a768-573897d3318c', '8cfe98b0-7348-5a2c-bee4-48799df3283c', '13:00:00', '14:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('d2e3b5cc-7dd7-504e-810b-9dfc1d3b086a', '8cfe98b0-7348-5a2c-bee4-48799df3283c', '17:00:00', '18:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('8321b199-b8b2-5edd-a3b9-4b948a0f6c01', 'f339fdcb-b76f-5703-af4f-d977a90fe398', '06:00:00', '07:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('4e5510c9-a0af-5c5e-867a-53645a70ad27', 'f339fdcb-b76f-5703-af4f-d977a90fe398', '09:00:00', '10:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('56bc700b-c300-52b0-8d7b-72c431d80e0c', 'f339fdcb-b76f-5703-af4f-d977a90fe398', '13:00:00', '14:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('46f35d14-52d5-5eea-a83d-f79522b94dff', 'f339fdcb-b76f-5703-af4f-d977a90fe398', '17:00:00', '18:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('0c457d5c-3eff-53b2-bd5b-11707d59a2ce', 'de635dce-fd56-52d6-b633-feec69ab4056', '06:00:00', '07:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('70153f55-515a-5f17-a3c2-178df32ca734', 'de635dce-fd56-52d6-b633-feec69ab4056', '09:00:00', '10:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('cad2d927-ef56-558e-98b6-0d47a7fa24d1', 'de635dce-fd56-52d6-b633-feec69ab4056', '13:00:00', '14:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('5ca3d541-6e9a-5daa-ba7d-9231eedfd9fa', 'de635dce-fd56-52d6-b633-feec69ab4056', '17:00:00', '18:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('3697be44-63ca-5c5c-9c0c-6c47ea07b298', '1d4e8398-4cd8-5423-b187-a55942e11647', '06:00:00', '07:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('b434d050-57f9-56fe-8d48-1f9a46c093db', '1d4e8398-4cd8-5423-b187-a55942e11647', '09:00:00', '10:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('1d2f8248-6025-5eb7-b15f-25a7970f51e8', '1d4e8398-4cd8-5423-b187-a55942e11647', '13:00:00', '14:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('c9f6d624-c2fc-5a81-93d0-cb705d658f7c', '1d4e8398-4cd8-5423-b187-a55942e11647', '17:00:00', '18:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('b87da5cd-92ff-5352-9b74-d6919076cb9a', 'e0c3e001-f94e-5865-8067-314152fc067a', '06:00:00', '07:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('678320b7-44c0-58d7-96c6-71196870f457', 'e0c3e001-f94e-5865-8067-314152fc067a', '09:00:00', '10:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('238501fa-a4f6-5bd1-8f07-d8e6632f091c', 'e0c3e001-f94e-5865-8067-314152fc067a', '13:00:00', '14:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('507eebfb-7771-5fbc-b747-f1134ab53ec9', 'e0c3e001-f94e-5865-8067-314152fc067a', '17:00:00', '18:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('908cf303-062d-5d50-a059-94cab6af7fc9', '5e4c60b6-b38c-5193-89bd-9642464f7b3d', '06:00:00', '07:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('6148bd79-19a2-569f-ab8a-908815098e2c', '5e4c60b6-b38c-5193-89bd-9642464f7b3d', '09:00:00', '10:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('70541436-dd11-53bd-a20c-47b23bf37ae6', '5e4c60b6-b38c-5193-89bd-9642464f7b3d', '13:00:00', '14:00:00', true);
INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES
  ('8986ed48-a2fb-5bc8-af9d-50c3f7276366', '5e4c60b6-b38c-5193-89bd-9642464f7b3d', '17:00:00', '18:00:00', true);

