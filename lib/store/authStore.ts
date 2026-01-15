import { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { User } from '../types/database.types';

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    setLoading: (loading: boolean) => void;
    setAuth: (user: User | null, session: Session | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    loading: true,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setLoading: (loading) => set({ loading }),
    setAuth: (user, session) => set({ user, session }),
    logout: () => set({ user: null, session: null }),
}));
