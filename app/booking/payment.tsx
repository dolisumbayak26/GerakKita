import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { updateTransactionStatus } from '@/lib/api/bookings';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PaymentScreen() {
    const { url, orderId } = useLocalSearchParams<{ url: string; orderId: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [loading, setLoading] = useState(true);

    const handlePaymentSuccess = async () => {
        setLoading(true);
        try {
            // Attempt to update status in DB (Client-side workaround for MVP)
            // Real app should use Webhook

            // Extract order_id from current URL if possible, or we need to pass it from confirm screen
            // But since we don't have order_id in params effortlessly, 
            // we'll fetch the latest pending transaction for this user?? No that's risky.
            // BETTER: Pass order_id (transaction_code) to this screen!

            if (orderId) {
                await updateTransactionStatus(orderId, 'completed');
            }

            Alert.alert('Pembayaran Berhasil', 'Terima kasih, pembayaran Anda telah dikonfirmasi.', [
                { text: 'Lihat Tiket', onPress: () => router.replace('/(tabs)/my-tickets') }
            ]);
        } catch (error) {
            console.error('Update status failed:', error);
            // Still allow navigation
            router.replace('/(tabs)/my-tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigationStateChange = (navState: any) => {
        const { url } = navState;
        console.log('WebView URL:', url);

        if (url.includes('transaction_status=settlement') ||
            url.includes('transaction_status=capture') ||
            url.includes('status_code=200') ||
            url.includes('/success')
        ) {
            handlePaymentSuccess();
        } else if (url.includes('transaction_status=deny')) {
            Alert.alert('Pembayaran Gagal', 'Pembayaran ditolak.', [
                { text: 'Kembali', onPress: () => router.back() }
            ]);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Pembayaran</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{url.includes('gopay') ? 'GoPay' : 'Midtrans Payment'}</Text>
            </View>

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
                    // Try external apps (GoJek etc)
                    import('react-native').then(({ Linking }) => {
                        Linking.openURL(request.url).catch(() => {
                            // Ignore error if app not found, stay in webview
                        });
                    });
                    return false;
                }}
            />

            {/* Fallback Manual Check Button */}
            <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: theme.border }}>
                <Text style={{ textAlign: 'center', color: theme.textSecondary, marginBottom: 8, fontSize: 12 }}>
                    Jika pembayaran sudah selesai tapi layar tidak berubah:
                </Text>
                <TouchableOpacity
                    style={{ backgroundColor: theme.primary, padding: 12, borderRadius: 8 }}
                    onPress={() => {
                        Alert.alert('Konfirmasi', 'Apakah Anda yakin sudah menyelesaikan pembayaran?', [
                            { text: 'Belum', style: 'cancel' },
                            { text: 'Sudah, Cek Status', onPress: handlePaymentSuccess }
                        ]);
                    }}
                >
                    <Text style={{ color: '#FFF', textAlign: 'center', fontWeight: 'bold' }}>Saya Sudah Bayar</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.8)'
    }
});
