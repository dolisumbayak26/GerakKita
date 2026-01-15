import { supabase } from '../supabase';

export interface CreateBookingParams {
    userId: string;
    routeId: string;
    originStopId: string;
    destinationStopId: string;
    amount: number;
    paymentMethod: string;
    quantity?: number;
}

import { getSnapToken } from '../utils/midtrans';

export interface CreateBookingParams {
    userId: string;
    routeId: string;
    originStopId: string;
    destinationStopId: string;
    amount: number;
    paymentMethod: string;
    quantity?: number;
    userEmail: string; // Added for Midtrans
    userName: string; // Added for Midtrans
}

export const createBooking = async (params: CreateBookingParams) => {
    const transactionCode = `TXN-${Date.now()}`;

    // 1. Create Transaction (Pending)
    const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
            user_id: params.userId,
            route_id: params.routeId,
            origin_stop_id: params.originStopId,
            destination_stop_id: params.destinationStopId,
            amount: params.amount,
            quantity: params.quantity || 1,
            payment_method: params.paymentMethod,
            payment_status: 'pending',
            midtrans_order_id: transactionCode,
            purchase_date: new Date().toISOString(),
            transaction_code: transactionCode
        })
        .select()
        .single();

    if (transactionError) throw transactionError;

    // 2. Get Snap Token
    let snapData;
    try {
        snapData = await getSnapToken({
            order_id: transactionCode,
            gross_amount: params.amount,
            customer_details: {
                first_name: params.userName,
                email: params.userEmail
            }
        });

        // Update transaction with Midtrans token (optional, or just use it once)
        // ideally we store the snap token, but for now we just return it
    } catch (error) {
        console.error('Failed to get Snap Token:', error);
        // Clean up transaction if snap fails? Or verify handling
        throw error;
    }

    // 3. Create Ticket (Inactive/Pending) 
    // Note: In a real app, tickets might be created only after payment webhook success. 
    // But for this flow we can create them as 'cancelled' or similar, or just create them and set status 'active' later.
    // However, the RLS policy issue was blocking this step.
    // Assuming RLS is fixed, we create the ticket now.

    // For now, let's create the ticket as 'active' assuming payment will succeed in demo,
    // OR create as 'cancelled' and update to 'active' on success.
    // But simplistic approach: Create ticket now.

    const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
            transaction_id: transaction.id,
            valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'active' // Pre-create as active for smoother demo, or 'pending' if schema supported it
        })
        .select()
        .single();

    if (ticketError) {
        console.error('Ticket creation failed:', ticketError);
        // Important: If ticket creation fails (e.g. RLS), we should probably fail the whole booking
        throw ticketError;
    }

    return { transaction, ticket, redirect_url: snapData.redirect_url, token: snapData.token };
};
