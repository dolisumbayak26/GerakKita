import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { finalizeTopUp } from '@/lib/api/wallet';
import { useAuth } from '@/lib/hooks/useAuth';
import { BORDER_RADIUS } from '@/lib/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PaymentWebviewScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useLocalSearchParams();
    const { url, title, returnUrl, callbackParams, orderId, amount } = params;
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [loading, setLoading] = useState(true);

    const handleFinish = async () => {
        try {
            setLoading(true);
            console.log('PaymentWebview Finish Check:', { orderId, amount, userId: user?.id, returnUrl });

            // For TopUp:
            if (user?.id && orderId && amount) {
                // Try finalize (if already finalized on server, it handles it)
                try {
                    console.log('Finalizing TopUp...');
                    await finalizeTopUp(user.id, orderId as string, parseInt(amount as string));
                    console.log('Finalize Success');
                } catch (e: any) {
                    console.log('Finalize check error:', e.message);
                }
            } else {
                console.log('Missing params for finalize:', { orderId, amount, userId: user?.id });
            }

            Alert.alert('Sukses', 'Transaksi berhasil!', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Reset stack to Home
                        if (router.canDismiss()) router.dismissAll();
                        router.replace('/(tabs)/');
                    }
                }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Info', 'Proses selesai. Silakan cek saldo Anda.');
            if (router.canDismiss()) router.dismissAll();
            router.replace('/(tabs)/');
        } finally {
            setLoading(false);
        }
    };

    const INJECTED_JS = `
        (function() {
            // Periodic check for success message
            setInterval(function() {
                var bodyText = document.body.innerText;
                if (bodyText.includes('Transaction is successful') || 
                    bodyText.includes('PAID') || 
                    bodyText.includes('Pembayaran Berhasil')) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({status: 'success'}));
                }
            }, 1000);
        })();
    `;

    const handleWebViewMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.status === 'success') {
                // Auto-redirect success
                handleFinish();
            }
        } catch (e) {
            // Ignore parse errors from other messages
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>{title || 'Pembayaran'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <WebView
                source={{ uri: url as string }}
                style={{ flex: 1 }}
                injectedJavaScript={INJECTED_JS}
                onMessage={handleWebViewMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => <ActivityIndicator size="large" color={theme.primary} style={StyleSheet.absoluteFill} />}
                onLoadEnd={() => setLoading(false)}
            />

            <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
                <Text style={[styles.footerHint, { color: theme.textSecondary }]}>
                    Selesaikan pembayaran di halaman web di atas.
                </Text>
                <TouchableOpacity
                    style={[styles.confirmButton, { backgroundColor: theme.primary }]}
                    onPress={handleFinish}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.confirmButtonText}>Saya Sudah Bayar</Text>
                    )}
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
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        alignItems: 'center',
    },
    footerHint: {
        fontSize: 12,
        marginBottom: 12,
    },
    confirmButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
