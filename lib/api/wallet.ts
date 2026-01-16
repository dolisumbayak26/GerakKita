import { supabase } from '../supabase';
import { Wallet, WalletTransaction } from '../types/database.types';

// Get user wallet balance
export const getWalletBalance = async (userId: string): Promise<Wallet | null> => {
    const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        // If wallet not found, try to create one (auto-init)
        if (error.code === 'PGRST116') {
            const { data: newWallet, error: createError } = await supabase
                .from('wallets')
                .insert({ user_id: userId, balance: 0 })
                .select()
                .single();

            if (createError) throw createError;
            return newWallet;
        }
        throw error;
    }
    return data;
};

// Create topup pending transaction
export const createTopUpTransaction = async (
    userId: string,
    amount: number,
    midtransOrderId: string
): Promise<WalletTransaction> => {
    // 1. Ensure wallet exists
    const wallet = await getWalletBalance(userId);
    if (!wallet) throw new Error('Wallet not found');

    // 2. Create transaction record
    const { data, error } = await supabase
        .from('wallet_transactions')
        .insert({
            wallet_id: wallet.user_id, // wallet_id is user_id in our schema (1:1)
            amount: amount,
            type: 'topup',
            status: 'pending',
            description: 'Top Up Wallet via Midtrans',
            payment_reference: midtransOrderId
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Verify and finalize topup (In production this should be protected/server-side only)
export const finalizeTopUp = async (userId: string, orderId: string, amount: number) => {
    // 1. Get transaction
    const { data: transaction, error: fetchError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('payment_reference', orderId)
        .eq('status', 'pending')
        .single();

    if (fetchError || !transaction) {
        // Maybe already processed, check success
        const { data: successTx } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('payment_reference', orderId)
            .eq('status', 'success')
            .single();

        if (successTx) return successTx; // Already done
        throw new Error('Transaction not found or invalid status');
    }

    // 2. Update transaction status
    const { error: updateTxError } = await supabase
        .from('wallet_transactions')
        .update({ status: 'success' })
        .eq('id', transaction.id);

    if (updateTxError) throw updateTxError;

    // 3. Update wallet balance
    // Note: This is not atomic without RPC/Stored Procedure, which is risky for high concurrency.
    // For MVP it's acceptable, but strongly advise moving to RPC 'increment_balance'.
    const wallet = await getWalletBalance(userId);
    if (!wallet) throw new Error('Wallet missing');

    const newBalance = (wallet.balance || 0) + amount;

    const { data: updatedWallet, error: updateWalletError } = await supabase
        .from('wallets')
        .update({
            balance: newBalance,
            last_updated: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

    if (updateWalletError) throw updateWalletError;

    return updatedWallet;
};

// Get transaction history
export const getWalletHistory = async (userId: string) => {
    const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', userId) // Assuming wallet_id = user_id
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

// Pay with wallet
export const payWithWallet = async (userId: string, amount: number, transactionRef: string) => {
    // 1. Get Wallet Balance
    const wallet = await getWalletBalance(userId);
    if (!wallet) throw new Error('Wallet belum aktif');

    if ((wallet.balance || 0) < amount) {
        throw new Error('Saldo Wallet tidak mencukupi');
    }

    // 2. Create Payment Transaction (Pending -> Success logic could be better, but we do direct)
    const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
            wallet_id: userId,
            amount: amount,
            type: 'payment',
            status: 'success', // Instant success
            payment_reference: transactionRef,
            description: 'Pembayaran Tiket'
        });

    if (txError) throw txError;

    // 3. Deduct Balance
    const newBalance = wallet.balance - amount;
    const { error: updateError } = await supabase
        .from('wallets')
        .update({
            balance: newBalance,
            last_updated: new Date().toISOString()
        })
        .eq('user_id', userId);

    if (updateError) throw updateError;

    return true;
};
