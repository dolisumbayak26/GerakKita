import { supabase } from '../supabase';
import { Route, RouteStop } from '../types/database.types';

export interface RouteWithDetails extends Route {
    stops_count?: number;
    stops?: (RouteStop & { bus_stops: { name: string } })[];
}

// Fetch all active routes
export const getRoutes = async () => {
    // Fetch routes
    const { data: routes, error: routesError } = await supabase
        .from('routes')
        .select('*')
        .eq('status', 'active');

    if (routesError) throw routesError;

    // Fetch stops count for each route (simulated join/count for performance)
    const routesWithCount = await Promise.all(routes.map(async (route) => {
        const { count, error } = await supabase
            .from('route_stops')
            .select('*', { count: 'exact', head: true })
            .eq('route_id', route.id);

        if (error) console.error('Error counting stops:', error);

        return {
            ...route,
            stops_count: count || 0,
            // Assign color based on route number (Mock for now, could be in DB)
            color: getRouteColor(route.route_number)
        };
    }));

    return routesWithCount;
};

// Fetch route details with ordered stops
export const getRouteDetails = async (routeId: string) => {
    // Fetch route info
    const { data: route, error: routeError } = await supabase
        .from('routes')
        .select('*')
        .eq('id', routeId)
        .single();

    if (routeError) throw routeError;

    // Fetch stops ordered by stop_order
    const { data: stops, error: stopsError } = await supabase
        .from('route_stops')
        .select(`
            *,
            bus_stops (
                id,
                name,
                address,
                latitude,
                longitude
            )
        `)
        .eq('route_id', routeId)
        .order('stop_order', { ascending: true });

    if (stopsError) throw stopsError;

    // Fetch active buses for this route
    const { data: buses, error: busesError } = await supabase
        .from('buses')
        .select('*')
        .eq('route_id', routeId);

    if (busesError) console.error('Error fetching buses:', busesError);

    return { ...route, stops, buses: buses || [] };
};

// Search routes
export const searchRoutes = async (query: string) => {
    const { data, error } = await supabase
        .from('routes')
        .select('*')
        .or(`route_name.ilike.%${query}%,route_number.ilike.%${query}%`)
        .eq('status', 'active');

    if (error) throw error;
    return data;
};

// Get real-time bus locations with distance/ETA using PostGIS
export const getBusLocations = async (routeId: string, userLat: number, userLon: number) => {
    const { data, error } = await supabase
        .rpc('get_route_buses_with_location', {
            p_route_id: routeId,
            user_lat: userLat,
            user_lon: userLon
        });

    if (error) throw error;
    return data;
};

// Helper: Get consistent color for route
const getRouteColor = (code: string) => {
    const colors = ['#F43F5E', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6'];
    const index = code.charCodeAt(0) % colors.length;
    return colors[index];
};

// Fetch all bus stops
export const getAllBusStops = async () => {
    const { data, error } = await supabase
        .from('bus_stops')
        .select('id, name, latitude, longitude, address');

    if (error) throw error;
    return data;
};
