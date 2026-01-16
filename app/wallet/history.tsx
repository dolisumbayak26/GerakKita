import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getWalletHistory } from '@/lib/api/wallet';
import { useAuth } from '@/lib/hooks/useAuth';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WalletHistoryScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) fetchHistory();
    }, [user?.id]);

    const fetchHistory = async () => {
        if (!user?.id) return;
        try {
            const data = await getWalletHistory(user.id);
            setHistory(data || []);
        } catch (error) {
            console.error('Fetch history error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isIncome = item.type === 'topup' || item.type === 'refund';
        const color = item.status === 'failed' ? theme.textSecondary : (isIncome ? theme.success : theme.error);
        const icon = item.type === 'topup' ? 'add-circle-outline' : (item.type === 'payment' ? 'cart-outline' : 'refresh-outline');

        return (
            <View style={[styles.itemCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <View style={styles.itemContent}>
                    <Text style={[styles.itemType, { color: theme.text }]}>
                        {item.description || (item.type === 'topup' ? 'Top Up Wallet' : 'Pembayaran Tiket')}
                    </Text>
                    <Text style={[styles.itemDate, { color: theme.textSecondary }]}>
                        {formatDate(item.created_at)}
                    </Text>
                </View>
                <View style={styles.amountContainer}>
                    <Text style={[styles.itemAmount, { color: color }]}>
                        {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                    </Text>
                    <Text style={[
                        styles.statusBadge,
                        { color: item.status === 'success' ? theme.success : (item.status === 'pending' ? theme.warning : theme.error) }
                    ]}>
                        {item.status}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Riwayat Transaksi</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={48} color={theme.textSecondary} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Belum ada transaksi</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderBottomWidth: 1,
    },
    backButton: { padding: SPACING.xs },
    headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: SPACING.md },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        marginBottom: SPACING.sm,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    itemContent: { flex: 1 },
    itemType: { fontSize: FONT_SIZE.md, fontWeight: '600', marginBottom: 2 },
    itemDate: { fontSize: FONT_SIZE.xs },
    amountContainer: { alignItems: 'flex-end' },
    itemAmount: { fontSize: FONT_SIZE.md, fontWeight: 'bold', marginBottom: 2 },
    statusBadge: { fontSize: FONT_SIZE.xs, textTransform: 'capitalize' },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: SPACING.xxl * 2 },
    emptyText: { marginTop: SPACING.md, fontSize: FONT_SIZE.md },
});
