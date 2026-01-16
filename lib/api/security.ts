import * as Crypto from 'expo-crypto';
import { supabase } from '../supabase';

/**
 * Hash a 6-digit PIN using SHA-256
 */
export const hashPin = async (pin: string): Promise<string> => {
    const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        pin
    );
    return digest;
};

/**
 * Verify a plain PIN against the stored hash for a user
 */
export const verifyPin = async (userId: string, plainPin: string): Promise<boolean> => {
    // 1. Get user's encrypted pin
    const { data: user, error } = await supabase
        .from('users')
        .select('encrypted_pin')
        .eq('id', userId)
        .single();

    if (error || !user) return false;
    if (!user.encrypted_pin) return false; // No PIN set

    // 2. Hash input
    const inputHash = await hashPin(plainPin);

    // 3. Compare
    return inputHash === user.encrypted_pin;
};

/**
 * Update user's PIN
 */
export const updatePin = async (userId: string, newPin: string): Promise<void> => {
    const hashedPin = await hashPin(newPin);

    const { error } = await supabase
        .from('users')
        .update({ encrypted_pin: hashedPin })
        .eq('id', userId);

    if (error) throw error;
};

/**
 * Check if user has a PIN set
 */
export const hasPinSet = async (userId: string): Promise<boolean> => {
    const { data: user, error } = await supabase
        .from('users')
        .select('encrypted_pin')
        .eq('id', userId)
        .single();

    if (error) return false;
    return !!user?.encrypted_pin;
};
