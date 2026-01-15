import { Stack } from 'expo-router';
import { COLORS } from '../../lib/utils/constants';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: COLORS.white,
                },
                headerTintColor: COLORS.primary,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen
                name="login"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="register"
                options={{
                    title: 'Daftar Akun',
                    headerBackTitle: 'Kembali',
                }}
            />
        </Stack>
    );
}
