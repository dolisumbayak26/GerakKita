import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getUserTransactions } from '@/lib/api/bookings';
import { getWalletHistory } from '@/lib/api/wallet';
import { useAuth } from '@/lib/hooks/useAuth';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TabType = 'topup' | 'ticket';

export default function HistoryScreen() {
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [activeTab, setActiveTab] = useState<TabType>('topup');
    const [loading, setLoading] = useState(false);
    const [topupHistory, setTopupHistory] = useState<any[]>([]);
    const [ticketHistory, setTicketHistory] = useState<any[]>([]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch both in parallel or based on tab? Parallel is fine for now
            const [walletTxs, ticketTxs] = await Promise.all([
                getWalletHistory(user.id),
                getUserTransactions(user.id)
            ]);

            // Filter wallet transactions for TopUp
            // Note: getWalletHistory returns all types. We filter for 'topup'
            const topups = walletTxs?.filter(tx => tx.type === 'topup') || [];
            setTopupHistory(topups);

            setTicketHistory(ticketTxs || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const renderTopUpItem = ({ item }: { item: any }) => (
        <Card style={styles.card}>
            <View style={styles.cardRow}>
                <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
                    <Ionicons name="wallet" size={24} color={theme.primary} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Top Up Saldo</Text>
                    <Text style={[styles.cardDate, { color: theme.textSecondary }]}>{formatDate(item.created_at)}</Text>
                </View>
                <View style={styles.cardAmountContainer}>
                    <Text style={[styles.amountPlus, { color: '#00AA13' }]}>+ {formatCurrency(item.amount)}</Text>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.status === 'success' ? '#E8F5E9' : '#FFEBEE' }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: item.status === 'success' ? '#2E7D32' : '#C62828' }
                        ]}>
                            {item.status === 'success' ? 'Berhasil' : item.status}
                        </Text>
                    </View>
                </View>
            </View>
        </Card>
    );

    const renderTicketItem = ({ item }: { item: any }) => (
        <Card style={styles.card}>
            <View style={styles.cardRow}>
                <View style={[styles.iconBox, { backgroundColor: theme.secondary + '15' }]}>
                    <Ionicons name="bus" size={24} color={theme.secondary} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Rute {item.routes?.route_number}</Text>
                    <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                        {item.origin_stop?.name} → {item.destination_stop?.name}
                    </Text>
                    <Text style={[styles.cardDate, { color: theme.textSecondary }]}>{formatDate(item.purchase_date)}</Text>
                </View>
                <View style={styles.cardAmountContainer}>
                    <Text style={[styles.amountMinus, { color: theme.text }]}>{formatCurrency(item.amount)}</Text>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.payment_status === 'completed' ? '#E8F5E9' : (item.payment_status === 'pending' ? '#FFF3E0' : '#FFEBEE') }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: item.payment_status === 'completed' ? '#2E7D32' : (item.payment_status === 'pending' ? '#EF6C00' : '#C62828') }
                        ]}>
                            {item.payment_status === 'completed' ? 'Lunas' : item.payment_status}
                        </Text>
                    </View>
                </View>
            </View>
        </Card>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Riwayat Transaksi</Text>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <View style={[styles.tabContent, { backgroundColor: theme.border + '40' }]}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === 'topup' && { backgroundColor: theme.background, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }
                        ]}
                        onPress={() => setActiveTab('topup')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'topup' ? theme.primary : theme.textSecondary, fontWeight: activeTab === 'topup' ? 'bold' : 'normal' }]}>Top Up</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === 'ticket' && { backgroundColor: theme.background, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }
                        ]}
                        onPress={() => setActiveTab('ticket')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'ticket' ? theme.primary : theme.textSecondary, fontWeight: activeTab === 'ticket' ? 'bold' : 'normal' }]}>Tiket</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading && !topupHistory.length && !ticketHistory.length ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={activeTab === 'topup' ? topupHistory : ticketHistory}
                    renderItem={activeTab === 'topup' ? renderTopUpItem : renderTicketItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="time-outline" size={48} color={theme.textSecondary} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                Belum ada riwayat {activeTab === 'topup' ? 'top up' : 'pembelian tiket'}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: SPACING.md,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
    },
    tabContainer: {
        padding: SPACING.md,
    },
    tabContent: {
        flexDirection: 'row',
        borderRadius: BORDER_RADIUS.lg,
        padding: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.md,
    },
    tabText: {
        fontSize: FONT_SIZE.md,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: SPACING.md,
        gap: SPACING.md,
    },
    card: {
        padding: SPACING.md,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.md,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: FONT_SIZE.sm,
        marginBottom: 4,
    },
    cardDate: {
        fontSize: FONT_SIZE.xs,
    },
    cardAmountContainer: {
        alignItems: 'flex-end',
    },
    amountPlus: {
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    amountMinus: {
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
        marginTop: SPACING.xl,
    },
    emptyText: {
        marginTop: SPACING.md,
        fontSize: FONT_SIZE.md,
    }
});
