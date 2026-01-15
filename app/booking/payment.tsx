import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PaymentScreen() {
    const { url } = useLocalSearchParams<{ url: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [loading, setLoading] = useState(true);

    const handleNavigationStateChange = (navState: any) => {
        const { url } = navState;

        // Check for success/finish pattern in redirect URL (Midtrans default is usually app://...)
        // Or if using standard callback. For sandbox usually it redirects to something like:
        // http://example.com/notification?order_id=...&status_code=200&transaction_status=settlement

        if (url.includes('transaction_status=settlement') || url.includes('transaction_status=capture')) {
            Alert.alert('Pembayaran Berhasil', 'Terima kasih, pembayaran Anda telah dikonfirmasi.', [
                { text: 'OK', onPress: () => router.replace('/(tabs)/tickets') }
            ]);
        } else if (url.includes('transaction_status=pending')) {
            Alert.alert('Menunggu Pembayaran', 'Silakan selesaikan pembayaran Anda.', [
                { text: 'OK', onPress: () => router.replace('/(tabs)/tickets') }
            ]);
        } else if (url.includes('transaction_status=deny') || url.includes('transaction_status=expire')) {
            Alert.alert('Pembayaran Gagal', 'Pembayaran ditolak atau kadaluarsa.', [
                { text: 'Coba Lagi', onPress: () => router.back() }
            ]);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="dark-content" />

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            )}

            <WebView
                source={{ uri: url }}
                style={{ flex: 1 }}
                onLoadEnd={() => setLoading(false)}
                onNavigationStateChange={handleNavigationStateChange}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => <View />} // Handled by custom loader
                onShouldStartLoadWithRequest={(request) => {
                    // Handle deep links (gojek://, shopeepay://, etc.)
                    if (request.url.startsWith('http') || request.url.startsWith('https') || request.url.startsWith('about:blank')) {
                        return true;
                    }

                    // Try to open other schemes in external app
                    import('react-native').then(({ Linking }) => {
                        Linking.canOpenURL(request.url).then((supported) => {
                            if (supported) {
                                Linking.openURL(request.url);
                            } else {
                                Alert.alert('Aplikasi tidak ditemukan', 'Silakan instal aplikasi pembayaran terkait atau gunakan metode lain.');
                            }
                        });
                    });

                    return false;
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.8)'
    }
});
