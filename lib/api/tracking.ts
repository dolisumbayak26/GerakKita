import { supabase } from '../supabase';

export interface RouteBus {
    id: string;
    bus_number: string;
    status: string;
    current_latitude: number | null;
    current_longitude: number | null;
    last_location_update: string | null;
    distance_meters: number;
    eta_minutes: number;
    driver_id?: string;
}

/**
 * Fetches active buses for a specific route with distance/ETA calculation relative to a user's location.
 * Uses the PostGIS function `get_route_buses_with_location`.
 */
export async function fetchRouteBuses(
    routeId: string,
    userLat: number,
    userLon: number
): Promise<RouteBus[]> {
    const { data, error } = await supabase.rpc('get_route_buses_with_location', {
        p_route_id: routeId,
        user_lat: userLat,
        user_lon: userLon,
    });

    if (error) {
        console.error('Error fetching route buses:', error);
        return [];
    }

    return data as RouteBus[];
}

/**
 * Updates a bus's location. 
 * Should only be called by a Driver.
 */
export async function updateBusLocation(
    busId: string,
    latitude: number,
    longitude: number
) {
    const { error } = await supabase
        .from('buses')
        .update({
            current_latitude: latitude,
            current_longitude: longitude,
            last_location_update: new Date().toISOString(),
        })
        .eq('id', busId);

    if (error) {
        console.error('Error updating bus location:', error);
        throw error;
    }
}

/**
 * Assigns a driver to a bus.
 */
export async function assignBusToDriver(busId: string, driverId: string) {
    const { error } = await supabase
        .from('buses')
        .update({
            driver_id: driverId,
            status: 'available', // Use 'available' to match check constraint of the database
        })
        .eq('id', busId);

    if (error) {
        console.error('Error assigning driver to bus:', error);
        throw error;
    }
}
