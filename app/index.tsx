import { useAuthStore } from '@/lib/store/authStore';
import { Redirect } from 'expo-router';

export default function Index() {
    const user = useAuthStore.getState().user as any;
    const role = user?.user_type;

    if (role === 'driver') {
        return <Redirect href="/portal-driver" />;
    }

    // Default for customers or unauthenticated (protected by _layout)
    return <Redirect href="/(tabs)" />;
}
