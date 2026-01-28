import { supabase } from '../supabase';
import { LoginCredentials, RegisterData, User } from '../types/database.types';

// Login with email/password
export const login = async (credentials: LoginCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
    });

    if (error) throw error;

    return data;
};

// Register new user (customers only - drivers created by admin)
export const register = async (userData: RegisterData) => {
    // 1. Create auth user with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
            data: {
                full_name: userData.full_name,
                phone_number: userData.phone_number || null,
            }
        }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    // 2. Wait for trigger to create profile (if trigger exists)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Check if profile exists in customers table
    let { data: profileData, error: profileError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    // 4. If profile doesn't exist, create it manually (fallback)
    if (profileError || !profileData) {
        console.log('Trigger not found, creating customer profile manually...');

        const { data: newProfile, error: insertError } = await supabase
            .from('customers')
            .insert({
                id: authData.user.id,
                email: userData.email,
                full_name: userData.full_name,
                phone_number: userData.phone_number || null,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Failed to create customer profile:', insertError);
            throw new Error('Profile creation failed. Please contact support.');
        }

        profileData = newProfile;
    }

    return { user: authData.user, profile: { ...profileData, user_type: 'customer' as const } };
};

// Logout
export const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

// Get current session
export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
};

// Get user profile - checks both customers and drivers tables
export const getUserProfile = async (userId: string): Promise<User> => {
    // First, try to find user in customers table
    const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', userId)
        .single();

    if (customerData && !customerError) {
        return { ...customerData, user_type: 'customer' as const };
    }

    // If not found in customers, try drivers table
    const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', userId)
        .single();

    if (driverData && !driverError) {
        return { ...driverData, user_type: 'driver' as const };
    }

    // If not found in either table, throw error
    throw new Error('User profile not found');
};

// Update user profile
export const updateUserProfile = async (
    userId: string,
    updates: Partial<User>
) => {
    // Determine which table to update by checking current user
    const currentUser = await getUserProfile(userId);

    if (currentUser.user_type === 'customer') {
        // Update customers table
        const { data, error } = await supabase
            .from('customers')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return { ...data, user_type: 'customer' as const };
    } else {
        // Update drivers table (exclude encrypted_pin as drivers don't have it)
        const { encrypted_pin, ...driverUpdates } = updates as any;
        const { data, error } = await supabase
            .from('drivers')
            .update(driverUpdates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return { ...data, user_type: 'driver' as const };
    }
};

// Verify OTP
export const verifyOtp = async (email: string, token: string) => {
    // Try 'signup' verification first (for new users)
    let { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
    });

    // If 'signup' fails, try 'email' (for other verifications)
    if (error) {
        const result = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email'
        });
        if (result.error) {
            // Check for specific error messages and translate them
            const msg = result.error.message.toLowerCase();
            if (msg.includes('token has expired') || msg.includes('invalid')) {
                throw new Error('Kode OTP kedaluwarsa atau salah. Silakan minta kode baru.');
            }
            throw result.error;
        }

        // If second attempt succeeds, use that data
        data = result.data;
        error = result.error;
    }

    if (!data.user || !data.session) {
        throw new Error('Verification failed: User or session missing');
    }

    // Fetch user profile
    const profile = await getUserProfile(data.user.id);

    return { user: profile, session: data.session };
};

// Resend OTP
export const resendOtp = async (email: string) => {
    // We assume this is for signup verification since we are in the register flow
    const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
    });

    if (error) throw error;
    return data;
};

// Reset password
export const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'gerakkita://reset-password',
    });

    if (error) throw error;
};

// Update password
export const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) throw error;
};
