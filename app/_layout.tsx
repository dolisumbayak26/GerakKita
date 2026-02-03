import { Loading } from '@/components/common/Loading';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/lib/store/authStore';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

export default function RootLayout() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inDriverGroup = segments[0] === 'portal-driver' || segments[0] === 'driver';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (isAuthenticated) {
      // Redirect based on role if authenticated
      // Check user_type (User type definition might need update, casting to any for now if needed)
      const user = useAuthStore.getState().user as any;
      const role = user?.user_type || 'customer';

      if (role === 'driver') {
        // Driver authenticated
        const atRoot = segments.length === 0;
        if (inAuthGroup || inTabsGroup || atRoot) {
          // If in auth pages, customer tabs, OR ROOT, force redirect to driver tabs
          router.replace('/portal-driver');
        }
      } else {
        // Customer authenticated
        if (inAuthGroup || inDriverGroup) {
          // If in auth pages or driver pages, force redirect to customer tabs
          router.replace('/(tabs)');
        }
      }
    }
  }, [isAuthenticated, loading, segments]);

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="portal-driver" options={{ headerShown: false }} />
        <Stack.Screen name="driver" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
