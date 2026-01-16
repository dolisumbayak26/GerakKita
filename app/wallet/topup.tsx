import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createTopUpTransaction } from '@/lib/api/wallet';
import { useAuth } from '@/lib/hooks/useAuth';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { formatCurrency } from '@/lib/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

export default function TopUpScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTopUp = async () => {
        if (!user) return;

        const value = parseInt(amount.replace(/\D/g, ''), 10);
        if (!value || value < 10000) {
            Alert.alert('Eror', 'Minimal top up Rp 10.000');
            return;
        }

        try {
            setLoading(true);
            // 1. Generate Order ID
            const orderId = `TOPUP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            // 2. Create pending transaction
            await createTopUpTransaction(user.id, value, orderId);

            // 3. Call Midtrans (Mock for MVP: Navigate to Payment Webview Logic)
            // In a real app, we would call our backend to get Snap Token.
            // For this sandbox client-side impl, we'll simulate the payment flow
            // or reuse the payment screen logic if adaptable. 
            // BUT, since we don't have a backend to snap token, 
            // we will simulate the "Action" by showing an alert for now
            // or implementing a basic "Mock Payment".

            // NOTE: Since we need Snap Token, and we don't have a backend server running,
            // we cannot easily generate one without exposing Server Key (which is risky but we did for booking).
            // Let's implement a direct call to Midtrans Snap API similar to booking.tsx logic.

            // We'll call the same createTransaction logic? No, bookings are different.
            // We need a specific endpoint. 
            // Let's reuse the logic: We need a Snap Token.

            const serverKey = process.env.EXPO_PUBLIC_MIDTRANS_SERVER_KEY;
            const authString = btoa(`${serverKey}:`);

            const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${authString}`,
                },
                body: JSON.stringify({
                    transaction_details: {
                        order_id: orderId,
                        gross_amount: value,
                    },
                    customer_details: {
                        first_name: user.full_name?.split(' ')[0],
                        email: user.email,
                        phone: user.phone_number,
                    },
                    item_details: [{
                        id: 'topup_wallet',
                        price: value,
                        quantity: 1,
                        name: 'Top Up Wallet',
                    }]
                }),
            });

            const data = await response.json();

            if (data.redirect_url) {
                // Navigate to Payment Webview
                // We can reuse a generic WebView screen or open in Browser
                // Let's open in browser for simplicity or use same logic as tickets
                // router.push({ pathname: '/booking/payment', params: { url: data.redirect_url } }); --> Ini untuk ticket
                // Kita butuh screen payment yang generic.

                // For now, let's assume we navigate to a payment handler
                // We need to pass the orderId to verify later.
                router.push({
                    pathname: '/booking/payment-webview', // New Generic Webview
                    params: {
                        url: data.redirect_url,
                        title: 'Selesaikan Pembayaran',
                        returnUrl: '/(tabs)/', // Redirect to Home
                        orderId: orderId, // Pass Explicitly
                        amount: value.toString(), // Pass Explicitly
                        callbackParams: JSON.stringify({ orderId, amount: value, type: 'topup' })
                    }
                } as any);

            } else {
                throw new Error('Gagal mendapatkan link pembayaran');
            }

        } catch (error: any) {
            console.error('TopUp Error:', error);
            Alert.alert('Gagal', error.message || 'Terjadi kesalahan saat memproses top up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Top Up Saldo</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Pilih Nominal Top Up</Text>

                <View style={styles.grid}>
                    {PRESET_AMOUNTS.map((val) => (
                        <TouchableOpacity
                            key={val}
                            style={[
                                styles.presetButton,
                                {
                                    backgroundColor: theme.card,
                                    borderColor: amount === val.toString() ? theme.primary : theme.border
                                }
                            ]}
                            onPress={() => setAmount(val.toString())}
                        >
                            <Text style={[
                                styles.presetText,
                                { color: amount === val.toString() ? theme.primary : theme.text }
                            ]}>
                                {formatCurrency(val)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.label, { color: theme.textSecondary, marginTop: SPACING.lg }]}>Atau Masukkan Nominal</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.currencyPrefix, { color: theme.text }]}>Rp</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={theme.textSecondary}
                    />
                </View>

                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        { backgroundColor: theme.primary, opacity: (!amount || loading) ? 0.7 : 1 }
                    ]}
                    onPress={handleTopUp}
                    disabled={!amount || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>Lanjut Pembayaran</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
    },
    content: {
        padding: SPACING.lg,
    },
    label: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        marginBottom: SPACING.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
    },
    presetButton: {
        width: '47%', // roughly half - gap
        paddingVertical: SPACING.md,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
    },
    presetText: {
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        height: 56,
    },
    currencyPrefix: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        marginRight: SPACING.xs,
    },
    input: {
        flex: 1,
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
    },
    submitButton: {
        marginTop: SPACING.xxl,
        paddingVertical: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
    },
});
