import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createBooking } from '@/lib/api/bookings';
import { getRouteDetails } from '@/lib/api/routes';
import { useAuthStore } from '@/lib/store/authStore';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function BookingConfirmScreen() {
    const { routeId } = useLocalSearchParams<{ routeId: string }>();
    const router = useRouter();
    const { user } = useAuthStore();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [route, setRoute] = useState<any>(null);
    const [stops, setStops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [originId, setOriginId] = useState<string | null>(null);
    const [destinationId, setDestinationId] = useState<string | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('qris');
    const [quantity, setQuantity] = useState<number>(1);

    // Fixed price for MVP
    const UNIT_PRICE = 3500;
    const totalPrice = UNIT_PRICE * quantity;
    const MAX_QUANTITY = 10;

    useEffect(() => {
        if (routeId) {
            loadRouteDetails();
        }
    }, [routeId]);

    const loadRouteDetails = async () => {
        try {
            setLoading(true);
            const data = await getRouteDetails(routeId);
            setRoute(data);
            setStops(data.stops || []);

            // Auto-select first and last stop as default
            if (data.stops && data.stops.length >= 2) {
                setOriginId(data.stops[0].bus_stop_id);
                setDestinationId(data.stops[data.stops.length - 1].bus_stop_id);
            }
        } catch (error) {
            console.error('Error loading route:', error);
            Alert.alert('Error', 'Gagal memuat detail rute');
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!user || !originId || !destinationId) return;

        try {
            setSubmitting(true);
            const result = await createBooking({
                userId: user.id,
                routeId: routeId,
                originStopId: originId,
                destinationStopId: destinationId,
                amount: totalPrice,
                quantity: quantity,
                paymentMethod: selectedPaymentMethod,
                userEmail: user.email || 'customer@example.com',
                userName: user.full_name || 'Customer'
            });

            if (result.redirect_url) {
                router.push({
                    pathname: '/booking/payment',
                    params: {
                        url: result.redirect_url,
                        orderId: result.transaction.midtrans_order_id
                    }
                });
            } else {
                Alert.alert('Sukses', 'Tiket berhasil dibeli!', [
                    { text: 'OK', onPress: () => router.replace('/(tabs)/tickets') }
                ]);
            }
        } catch (error) {
            console.error('Booking failed:', error);
            Alert.alert('Gagal', 'Terjadi kesalahan saat pemesanan.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const originStop = stops.find(s => s.bus_stop_id === originId)?.bus_stops;
    const destStop = stops.find(s => s.bus_stop_id === destinationId)?.bus_stops;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Konfirmasi Pesanan</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Route Info */}
                <Card style={styles.card}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                        <Ionicons name="bus" size={24} color={theme.primary} />
                    </View>
                    <View style={styles.routeInfo}>
                        <Text style={[styles.routeNumber, { color: theme.text }]}>Rute {route?.route_number}</Text>
                        <Text style={[styles.routeName, { color: theme.textSecondary }]}>{route?.route_name}</Text>
                    </View>
                </Card>

                {/* Selection Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Pilih Perjalanan</Text>

                    <View style={styles.timelineContainer}>
                        {/* Origin Selection (Mock Dropdown logic) */}
                        <View style={styles.timelineItem}>
                            <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                            <View style={styles.timelineContent}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Dari</Text>
                                <TouchableOpacity style={[styles.selector, { borderColor: theme.border }]}>
                                    <Text style={[styles.selectorText, { color: theme.text }]}>{originStop?.name || 'Pilih Halte'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={[styles.line, { backgroundColor: theme.border }]} />

                        {/* Destination Selection */}
                        <View style={styles.timelineItem}>
                            <View style={[styles.dot, { backgroundColor: theme.secondary }]} />
                            <View style={styles.timelineContent}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Ke</Text>
                                <TouchableOpacity style={[styles.selector, { borderColor: theme.border }]}>
                                    <Text style={[styles.selectorText, { color: theme.text }]}>{destStop?.name || 'Pilih Halte'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Payment Method Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Metode Pembayaran</Text>

                    {[
                        { id: 'qris', name: 'QRIS', icon: 'qr-code', color: theme.text },
                        { id: 'gopay', name: 'GoPay', icon: 'wallet', color: '#00AED6' }, // Gojek Blue
                        { id: 'shopeepay', name: 'ShopeePay', icon: 'cart', color: '#EE4D2D' } // Shopee Orange
                    ].map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.paymentOption,
                                {
                                    borderColor: selectedPaymentMethod === method.id ? theme.primary : theme.border,
                                    backgroundColor: selectedPaymentMethod === method.id ? theme.primary + '10' : 'transparent'
                                }
                            ]}
                            onPress={() => setSelectedPaymentMethod(method.id)}
                        >
                            <View style={styles.paymentOptionContent}>
                                <View style={[styles.paymentIconContainer, { backgroundColor: theme.background }]}>
                                    <View>
                                        {/* Using generic icons for MVP since we don't have assets yet */}
                                        <Ionicons name={method.icon as any} size={24} color={method.color} />
                                    </View>
                                </View>
                                <Text style={[styles.paymentOptionText, { color: theme.text }]}>{method.name}</Text>
                            </View>

                            <View style={[
                                styles.radioButton,
                                { borderColor: selectedPaymentMethod === method.id ? theme.primary : theme.textSecondary }
                            ]}>
                                {selectedPaymentMethod === method.id && (
                                    <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quantity Selector */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Jumlah Tiket</Text>
                    <Card style={styles.quantityCard}>
                        <View style={styles.quantityRow}>
                            <TouchableOpacity
                                onPress={() => setQuantity(q => Math.max(1, q - 1))}
                                style={[styles.quantityButton, { backgroundColor: theme.border }]}
                                disabled={quantity <= 1}
                            >
                                <Ionicons name="remove" size={24} color={quantity <= 1 ? theme.textSecondary : theme.text} />
                            </TouchableOpacity>
                            <View style={styles.quantityDisplay}>
                                <Text style={[styles.quantityValue, { color: theme.text }]}>{quantity}</Text>
                                <Text style={[styles.quantityLabel, { color: theme.textSecondary }]}>tiket</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setQuantity(q => Math.min(MAX_QUANTITY, q + 1))}
                                style={[styles.quantityButton, { backgroundColor: theme.primary + '20' }]}
                                disabled={quantity >= MAX_QUANTITY}
                            >
                                <Ionicons name="add" size={24} color={quantity >= MAX_QUANTITY ? theme.textSecondary : theme.primary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.quantityHint, { color: theme.textSecondary }]}>
                            Maksimal {MAX_QUANTITY} tiket per transaksi
                        </Text>
                    </Card>
                </View>

                {/* Payment Summary */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Rincian Pembayaran</Text>
                    <Card style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Harga per Tiket</Text>
                            <Text style={[styles.summaryValue, { color: theme.text }]}>Rp {UNIT_PRICE.toLocaleString('id-ID')}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Jumlah Tiket</Text>
                            <Text style={[styles.summaryValue, { color: theme.text }]}>{quantity}x</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <View style={styles.summaryRow}>
                            <Text style={[styles.totalLabel, { color: theme.text }]}>Total Bayar</Text>
                            <Text style={[styles.totalValue, { color: theme.primary }]}>Rp {totalPrice.toLocaleString('id-ID')}</Text>
                        </View>
                    </Card>
                </View>
            </ScrollView>

            {/* Bottom Action */}
            <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
                <View>
                    <Text style={[styles.footerLabel, { color: theme.textSecondary }]}>Total ({quantity} tiket)</Text>
                    <Text style={[styles.footerPrice, { color: theme.primary }]}>Rp {totalPrice.toLocaleString('id-ID')}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.payButton, { backgroundColor: theme.primary, opacity: submitting ? 0.7 : 1 }]}
                    onPress={handleBooking}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.payButtonText}>Bayar Sekarang</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
    },
    content: {
        padding: SPACING.lg,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    routeInfo: {
        flex: 1,
    },
    routeNumber: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
    },
    routeName: {
        fontSize: FONT_SIZE.md,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
    },
    timelineContainer: {
        paddingHorizontal: SPACING.xs,
    },
    timelineItem: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 6,
    },
    line: {
        width: 2,
        height: 40,
        marginLeft: 5,
        marginVertical: 4,
    },
    timelineContent: {
        flex: 1,
        marginTop: -4,
    },
    label: {
        fontSize: FONT_SIZE.xs,
        marginBottom: 4,
    },
    selector: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
    },
    selectorText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '500',
    },
    summaryCard: {
        padding: SPACING.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: FONT_SIZE.md,
    },
    summaryValue: {
        fontSize: FONT_SIZE.md,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: SPACING.md,
    },
    totalLabel: {
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
    },
    footer: {
        padding: SPACING.lg,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: FONT_SIZE.sm,
    },
    footerPrice: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
    },
    payButton: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: 12,
        borderRadius: BORDER_RADIUS.full,
        minWidth: 160,
        alignItems: 'center',
    },
    payButtonText: {
        color: '#FFF',
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
    },
    paymentOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    paymentIconContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    paymentOptionText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '500',
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    quantityCard: {
        padding: SPACING.md,
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xl,
    },
    quantityButton: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityDisplay: {
        alignItems: 'center',
        minWidth: 60,
    },
    quantityValue: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
    },
    quantityLabel: {
        fontSize: FONT_SIZE.sm,
    },
    quantityHint: {
        fontSize: FONT_SIZE.xs,
        textAlign: 'center',
        marginTop: SPACING.md,
    },
});
