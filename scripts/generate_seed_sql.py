import csv
import uuid
from typing import Dict, List

def generate_deterministic_uuid(namespace: str, name: str) -> str:
    """Generate deterministic UUID from namespace and name"""
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{namespace}:{name}"))

def main():
    # Read CSV file
    csv_file = 'halte.csv'
    output_file = 'supabase/seed_bus_data.sql'
    
    routes: Dict[str, Dict] = {}
    bus_stops_dict: Dict[str, Dict] = {}  # Use dict to deduplicate by stop_id
    route_stops: List[Dict] = {}
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            koridor = row['koridor']
            
            # Track routes
            if koridor not in routes:
                route_num = koridor.replace('Koridor ', 'K')
                routes[koridor] = {
                    'id': generate_deterministic_uuid('route', koridor),
                    'route_number': route_num,
                    'route_name': koridor,
                    'stops': []
                }
            
            # Create bus stop (deduplicated by ID)
            stop_id = generate_deterministic_uuid('stop', row['nama_halte'] + row['latitude'])
            
            # Only add to bus_stops_dict if not already present
            if stop_id not in bus_stops_dict:
                bus_stops_dict[stop_id] = {
                    'id': stop_id,
                    'name': row['nama_halte'],
                    'latitude': float(row['latitude']),
                    'longitude': float(row['longitude']),
                    'address': row['alamat_area']
                }
            
            # Track route stops
            routes[koridor]['stops'].append(stop_id)
    
    # Convert bus_stops_dict to list for easier iteration
    bus_stops = list(bus_stops_dict.values())
    
    # Generate SQL
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("-- Generated seed data for bus routes and stops\n")
        f.write("-- Run this in Supabase SQL Editor\n\n")
        
        # Delete existing data (CASCADE will handle route_stops)
        f.write("-- Clean existing data\n")
        f.write("TRUNCATE TABLE routes CASCADE;\n")
        f.write("TRUNCATE TABLE bus_stops CASCADE;\n\n")
        
        # Insert routes
        f.write("-- Insert routes\n")
        for koridor, route_data in routes.items():
            first_stop_name = None
            last_stop_name = None
            
            # Find first and last stop names for description
            for stop in bus_stops:
                if stop['id'] == route_data['stops'][0]:
                    first_stop_name = stop['name']
                if stop['id'] == route_data['stops'][-1]:
                    last_stop_name = stop['name']
            
            description = f"{first_stop_name} - {last_stop_name}"
            
            f.write(f"INSERT INTO routes (id, route_number, route_name, description, status) VALUES\n")
            f.write(f"  ('{route_data['id']}', '{route_data['route_number']}', '{route_data['route_name']}', '{description}', 'active');\n\n")
        
        # Insert bus stops
        f.write("-- Insert bus stops\n")
        for i, stop in enumerate(bus_stops):
            f.write(f"INSERT INTO bus_stops (id, name, latitude, longitude, address) VALUES\n")
            f.write(f"  ('{stop['id']}', '{stop['name']}', {stop['latitude']}, {stop['longitude']}, '{stop['address']}');\n")
            if (i + 1) % 5 == 0:  # Add blank line every 5 stops for readability
                f.write("\n")
        
        f.write("\n")
        
        # Insert route_stops
        f.write("-- Insert route_stops (linking routes to stops)\n")
        for koridor, route_data in routes.items():
            for order, stop_id in enumerate(route_data['stops'], start=1):
                # Calculate fare: base 3000 + (stop_order - 1) * 1000
                fare = 3000 + (order - 1) * 1000
                f.write(f"INSERT INTO route_stops (route_id, bus_stop_id, stop_order, fare_from_origin) VALUES\n")
                f.write(f"  ('{route_data['id']}', '{stop_id}', {order}, {fare});\n")
            f.write("\n")
        
        # Insert buses (2 buses per route)
        f.write("-- Insert buses\n")
        buses = []
        for idx, (koridor, route_data) in enumerate(routes.items()):
            koridor_num = koridor.replace('Koridor ', '')
            for bus_num in range(1, 3):  # 2 buses per route
                bus_id = generate_deterministic_uuid('bus', f"{koridor}-{bus_num}")
                bus_number = f"K{koridor_num}-{bus_num:02d}"
                buses.append({
                    'id': bus_id,
                    'bus_number': bus_number,
                    'route_id': route_data['id']
                })
                f.write(f"INSERT INTO buses (id, bus_number, route_id, total_seats, available_seats, status) VALUES\n")
                f.write(f"  ('{bus_id}', '{bus_number}', '{route_data['id']}', 40, 40, 'available');\n")
        f.write("\n")
        
        # Insert bus_schedules (4 departure times per bus)
        f.write("-- Insert bus_schedules\n")
        departure_times = ['06:00:00', '09:00:00', '13:00:00', '17:00:00']
        for bus in buses:
            for dep_time in departure_times:
                # Calculate arrival time (assume 60 min journey)
                dep_hour, dep_min, dep_sec = map(int, dep_time.split(':'))
                arr_hour = (dep_hour + 1) % 24
                arr_time = f"{arr_hour:02d}:{dep_min:02d}:{dep_sec:02d}"
                
                schedule_id = generate_deterministic_uuid('schedule', f"{bus['id']}-{dep_time}")
                f.write(f"INSERT INTO bus_schedules (id, bus_id, departure_time, arrival_time, active) VALUES\n")
                f.write(f"  ('{schedule_id}', '{bus['id']}', '{dep_time}', '{arr_time}', true);\n")
        f.write("\n")
    
    print(f"[SUCCESS] SQL seed file generated: {output_file}")
    print(f"   - {len(routes)} routes")
    print(f"   - {len(bus_stops)} bus stops")
    print(f"   - {len(buses)} buses")
    print(f"   - {len(buses) * len(departure_times)} schedules")

if __name__ == '__main__':
    main()
