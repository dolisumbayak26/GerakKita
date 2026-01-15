import { useEffect } from 'react';
import { getUserProfile } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../supabase';

export const useAuth = () => {
    const { user, session, loading, setUser, setSession, setLoading, logout: storeLogout } = useAuthStore();

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);

            if (session?.user) {
                // Fetch user profile
                getUserProfile(session.user.id)
                    .then((profile) => {
                        setUser(profile);
                        setLoading(false);
                    })
                    .catch((error) => {
                        console.error('Error fetching user profile:', error);
                        setLoading(false);
                    });
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);

            if (session?.user) {
                try {
                    const profile = await getUserProfile(session.user.id);
                    setUser(profile);
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            } else {
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            storeLogout();
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    return {
        user,
        session,
        loading,
        isAuthenticated: !!user,
        logout,
    };
};
