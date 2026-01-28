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
 * Clears a bus's location data when driver stops tracking.
 * No longer needs to unassign driver since we use drivers.bus_id now.
 */
export async function clearBusLocation(busId: string) {
    const { error } = await supabase
        .from('buses')
        .update({
            status: 'available', // Reset status
            current_latitude: null,
            current_longitude: null,
            last_location_update: null // Clear timestamp to prevent ghost data
        })
        .eq('id', busId);

    if (error) {
        console.error('Error clearing bus location:', error);
        throw error;
    }
}
