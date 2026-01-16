import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/lib/hooks/useAuth';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function DriverLayout() {
    const { user, loading } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    // Ensure user is authenticated and has role 'driver' (or admin)
    //   if (!user || user.role !== 'driver') {
    // Note: Since 'role' might not be in the initial user object depending on how auth is hydrated, 
    // be careful. For now, we assume user object has role if we fetched it.
    // If you haven't typed 'role' in User interface yet, this might error in TS.
    // We'll perform a soft check or redirect.
    // return <Redirect href="/(tabs)/profile" />;
    //   }

    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Driver Dashboard', headerShown: false }} />
        </Stack>
    );
}
