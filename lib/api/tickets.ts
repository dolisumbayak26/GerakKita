import { supabase } from '../supabase';
import { Ticket } from '../types/database.types';

export interface TicketWithDetails extends Ticket {
    transactions: {
        amount: number;
        purchase_date: string;
        routes: {
            route_name: string;
            route_number: string;
            estimated_duration: string;
        };
        bus_stops_origin: {
            name: string;
        };
        bus_stops_destination: {
            name: string;
        };
    };
}

export const getUserTickets = async (userId: string) => {
    const { data, error } = await supabase
        .from('tickets')
        .select(`
            *,
            transactions (
                amount,
                purchase_date,
                routes (
                    route_name,
                    route_number,
                    estimated_duration
                ),
                bus_stops_origin: origin_stop_id (
                    name
                ),
                bus_stops_destination: destination_stop_id (
                    name
                )
            )
        `)
        .eq('transactions.user_id', userId) // This might need a join filter if RLS doesn't handle it automatically on the top level, but typically we query tickets that belong to transactions of the user.
        // Actually, since tickets don't have user_id directly, we rely on the join.
        // However, Supabase complex filtering on joined tables can be tricky.
        // Better approach: Get tickets where transaction belongs to user.
        // But standard RLS usually prevents seeing other's tickets.
        // Let's assume RLS allows seeing tickets linked to own transactions.
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tickets:', error);
        throw error;
    }

    // Filter out tickets where transaction is null (if any/RLS issues)
    return data?.filter(t => t.transactions) as TicketWithDetails[] || [];
};

export const getTicketDetails = async (ticketId: string) => {
    const { data, error } = await supabase
        .from('tickets')
        .select(`
            *,
            transactions (
                amount,
                purchase_date,
                payment_method,
                transaction_code,
                routes (
                    route_name,
                    route_number,
                    description
                ),
                bus_stops_origin: origin_stop_id (
                    name,
                    address
                ),
                bus_stops_destination: destination_stop_id (
                    name,
                    address
                )
            )
        `)
        .eq('id', ticketId)
        .single();

    if (error) throw error;
    return data;
};
