import { supabase } from '../supabase';

export interface CreateBookingParams {
    userId: string;
    routeId: string;
    originStopId: string;
    destinationStopId: string;
    amount: number;
    paymentMethod: string;
    quantity?: number;
    userEmail: string;
    userName: string;
}

import { getSnapToken } from '../utils/midtrans';

export interface UpdateTransactionParams {
    transactionId: string; // Actually using order_id/transaction_code for lookup
    status: 'completed' | 'failed' | 'pending';
}

export const updateTransactionStatus = async (orderId: string, status: 'completed' | 'failed') => {
    // 1. Update Transaction
    const { data: transaction, error: txnError } = await supabase
        .from('transactions')
        .update({
            payment_status: status,
            midtrans_transaction_id: orderId // Storing orderId here for ref if needed
        })
        .eq('midtrans_order_id', orderId)
        .select()
        .single();

    if (txnError) throw txnError;

    // 2. If Completed, Ensure Ticket Exists and is Active
    if (status === 'completed' && transaction) {
        // Check if ticket exists
        const { data: existingTicket } = await supabase
            .from('tickets')
            .select('*')
            .eq('transaction_id', transaction.id)
            .single();

        if (existingTicket) {
            // Update status to active if needed
            if (existingTicket.status !== 'active') {
                await supabase
                    .from('tickets')
                    .update({ status: 'active' })
                    .eq('id', existingTicket.id);
            }
        } else {
            // Create Ticket if missing (should be created in createBooking but just in case)
            await supabase
                .from('tickets')
                .insert({
                    transaction_id: transaction.id,
                    valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    status: 'active',
                    qr_code_data: `QR-${orderId}-${Math.floor(Math.random() * 1000)}`
                });
        }
    }

    return transaction;
};

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
    let enabledPayments = ['gopay', 'shopeepay', 'qris', 'bank_transfer'];

    // Map selection to specific Snap payment method to skip selection screen if desired
    if (params.paymentMethod === 'gopay') enabledPayments = ['gopay'];
    if (params.paymentMethod === 'shopeepay') enabledPayments = ['shopeepay'];
    if (params.paymentMethod === 'qris') enabledPayments = ['qris'];

    try {
        snapData = await getSnapToken({
            order_id: transactionCode,
            gross_amount: params.amount,
            customer_details: {
                first_name: params.userName,
                email: params.userEmail
            },
            parameter: {
                enabled_payments: enabledPayments
            }
        });

        // Update transaction with Midtrans token (optional, or just use it once)
        // ideally we store the snap token, but for now we just return it
    } catch (error) {
        console.error('Failed to get Snap Token:', error);
        // Clean up transaction if snap fails? Or verify handling
        throw error;
    }

    // 3. Create Tickets based on quantity
    // Create a ticket for each quantity requested
    const quantity = params.quantity || 1;
    const ticketsToCreate = [];

    for (let i = 0; i < quantity; i++) {
        ticketsToCreate.push({
            transaction_id: transaction.id,
            valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            qr_code_data: `QR-${transactionCode}-${i + 1}-${Math.floor(Math.random() * 10000)}` // Unique QR for each ticket
        });
    }

    const { data: tickets, error: ticketError } = await supabase
        .from('tickets')
        .insert(ticketsToCreate)
        .select();

    if (ticketError) {
        console.error('Ticket creation failed:', ticketError);
        throw ticketError;
    }

    return { transaction, tickets, redirect_url: snapData.redirect_url, token: snapData.token };
};
