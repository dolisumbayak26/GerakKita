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

// Register new user
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

    // 3. Check if profile exists
    let { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    // 4. If profile doesn't exist, create it manually (fallback)
    if (profileError || !profileData) {
        console.log('Trigger not found, creating profile manually...');

        const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email: userData.email,
                full_name: userData.full_name,
                phone_number: userData.phone_number || null,
            })
            .select()
            .single();

        if (insertError) {
            // If still fails, it might be RLS issue - user needs to enable trigger
            console.error('Failed to create profile:', insertError);
            throw new Error('Profile creation failed. Please contact support.');
        }

        profileData = newProfile;
    }

    return { user: authData.user, profile: profileData };
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

// Get user profile
export const getUserProfile = async (userId: string): Promise<User> => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
};

// Update user profile
export const updateUserProfile = async (
    userId: string,
    updates: Partial<User>
) => {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
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
