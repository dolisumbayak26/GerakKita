import { supabase } from '../supabase';

export interface Review {
    id: string;
    user_id: string;
    bus_id?: string;
    route_id?: string;
    rating: number;
    comment?: string;
    created_at: string;
    // Joined data
    buses?: { bus_number: string };
    routes?: { route_name: string };
    users?: { full_name: string };
}

/**
 * Get all reviews submitted by the current user
 */
export async function getUserReviews(userId: string): Promise<Review[]> {
    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            buses(bus_number),
            routes(route_name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user reviews:', error);
        throw error;
    }

    return data as Review[];
}

/**
 * Submit a new review for a bus or route
 */
export async function submitReview(
    userId: string,
    rating: number,
    comment: string,
    busId?: string,
    routeId?: string
): Promise<void> {
    if (!busId && !routeId) {
        throw new Error('Either busId or routeId must be provided');
    }

    const { error } = await supabase.from('reviews').insert({
        user_id: userId,
        bus_id: busId || null,
        route_id: routeId || null,
        rating,
        comment: comment || null,
    });

    if (error) {
        console.error('Error submitting review:', error);
        throw error;
    }
}

/**
 * Get all reviews for a specific bus
 */
export async function getBusReviews(busId: string): Promise<Review[]> {
    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            users(full_name)
        `)
        .eq('bus_id', busId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching bus reviews:', error);
        throw error;
    }

    return data as Review[];
}

/**
 * Get all reviews for a specific route
 */
export async function getRouteReviews(routeId: string): Promise<Review[]> {
    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            users(full_name)
        `)
        .eq('route_id', routeId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching route reviews:', error);
        throw error;
    }

    return data as Review[];
}

/**
 * Delete a review (only if user is the owner)
 */
export async function deleteReview(reviewId: string, userId: string): Promise<void> {
    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting review:', error);
        throw error;
    }
}
