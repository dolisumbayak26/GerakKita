import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getUserTickets, TicketWithDetails } from '@/lib/api/tickets';
import { useAuthStore } from '@/lib/store/authStore';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Modal,
    Platform,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

export default function TicketsScreen() {
    const { user } = useAuthStore();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);

    useEffect(() => {
        fetchTickets();
    }, [user]);

    const fetchTickets = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await getUserTickets(user.id);
            setTickets(data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchTickets().finally(() => setRefreshing(false));
    }, [user]);

    const activeTickets = tickets.filter(t => t.status === 'active');
    const pastTickets = tickets.filter(t => t.status !== 'active');

    const renderTicketItem = ({ item }: { item: TicketWithDetails }) => {
        const isActive = item.status === 'active';
        const routeName = item.transactions?.routes?.route_name || 'Rute Tidak Diketahui';
        const purchaseDate = item.transactions?.purchase_date
            ? format(new Date(item.transactions.purchase_date), 'dd MMM yyyy, HH:mm', { locale: id })
            : '-';
        const validUntil = item.valid_until
            ? format(new Date(item.valid_until), 'HH:mm', { locale: id })
            : '-';

        return (
            <TouchableOpacity
                onPress={() => setSelectedTicket(item)}
                activeOpacity={0.9}
            >
                <Card style={[styles.ticketCard, { borderColor: isActive ? theme.primary : theme.border }]}>
                    {/* Header: Route & Status */}
                    <View style={styles.cardHeader}>
                        <View style={styles.routeInfo}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                                <Ionicons name="bus" size={20} color={theme.primary} />
                            </View>
                            <View>
                                <Text style={[styles.routeName, { color: theme.text }]}>{routeName}</Text>
                                <Text style={[styles.routeNumber, { color: theme.textSecondary }]}>
                                    {item.transactions?.routes?.route_number}
                                </Text>
                            </View>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            {
                                backgroundColor: isActive ? theme.success + '20' : theme.textSecondary + '20'
                            }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                { color: isActive ? theme.success : theme.textSecondary }
                            ]}>
                                {isActive ? 'Aktif' : 'Selesai'}
                            </Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Details: Date & Time */}
                    <View style={styles.cardBody}>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Tanggal Pembelian</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]}>{purchaseDate}</Text>
                        </View>
                        {isActive && (
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Valid Hingga</Text>
                                <Text style={[styles.detailValue, { color: theme.error }]}>Hari ini, {validUntil}</Text>
                            </View>
                        )}
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Kode Tiket</Text>
                            <Text style={[styles.detailValue, { color: theme.text, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>
                                {item.ticket_code}
                            </Text>
                        </View>
                    </View>

                    {/* QR Code Preview (Small) */}
                    {isActive && (
                        <View style={styles.qrPreview}>
                            <Text style={[styles.tapToView, { color: theme.primary }]}>Ketuk untuk lihat QR Code</Text>
                            <Ionicons name="qr-code-outline" size={20} color={theme.primary} />
                        </View>
                    )}
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Tiket Saya</Text>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={tickets}
                    renderItem={renderTicketItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="ticket-outline" size={64} color={theme.textSecondary} />
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>Belum ada tiket</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                                Tiket aktif dan riwayat perjalananmu akan muncul di sini.
                            </Text>
                            <TouchableOpacity
                                style={[styles.buyButton, { backgroundColor: theme.primary }]}
                                onPress={() => router.push('/(tabs)/buy-ticket')}
                            >
                                <Text style={styles.buyButtonText}>Beli Tiket Sekarang</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    ListHeaderComponent={
                        activeTickets.length > 0 ? (
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Tiket Aktif ({activeTickets.length})</Text>
                        ) : null
                    }
                />
            )}

            {/* Ticket Detail Modal */}
            <Modal
                visible={!!selectedTicket}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedTicket(null)}
            >
                <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Detail Tiket</Text>
                        <TouchableOpacity onPress={() => setSelectedTicket(null)}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {selectedTicket && (
                        <View style={styles.ticketDetailContent}>
                            <View style={[styles.qrContainer, { backgroundColor: '#FFF' }]}>
                                <QRCode
                                    value={selectedTicket.qr_code_data}
                                    size={200}
                                />
                                <Text style={[styles.qrCodeText, { color: '#000' }]}>{selectedTicket.ticket_code}</Text>
                            </View>
                            <Text style={[styles.scanHint, { color: theme.textSecondary }]}>
                                Tunjukkan QR Code ini kepada petugas Bus
                            </Text>

                            <View style={[styles.detailCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <View style={styles.modalDetailRow}>
                                    <View>
                                        <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Dari</Text>
                                        <Text style={[styles.modalValue, { color: theme.text }]}>{selectedTicket.transactions.bus_stops_origin?.name}</Text>
                                    </View>
                                    <Ionicons name="arrow-forward" size={20} color={theme.textSecondary} />
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Ke</Text>
                                        <Text style={[styles.modalValue, { color: theme.text }]}>{selectedTicket.transactions.bus_stops_destination?.name}</Text>
                                    </View>
                                </View>
                                <View style={[styles.modalDivider, { backgroundColor: theme.border }]} />
                                <View style={styles.modalDetailRow}>
                                    <View>
                                        <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Status</Text>
                                        <Text style={[styles.modalValue, { color: selectedTicket.status === 'active' ? theme.success : theme.textSecondary }]}>
                                            {selectedTicket.status === 'active' ? 'Aktif' : 'Sudah Digunakan'}
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Harga</Text>
                                        <Text style={[styles.modalValue, { color: theme.text }]}>
                                            Rp {selectedTicket.transactions.amount.toLocaleString('id-ID')}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    headerTitle: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
    },
    listContent: {
        padding: SPACING.lg,
        paddingTop: SPACING.xs,
        flexGrow: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
        marginTop: SPACING.sm,
    },
    ticketCard: {
        marginBottom: SPACING.md,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    routeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    routeName: {
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
    },
    routeNumber: {
        fontSize: FONT_SIZE.xs,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    statusText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: SPACING.sm,
    },
    cardBody: {
        gap: SPACING.xs,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: FONT_SIZE.sm,
    },
    detailValue: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '500',
    },
    qrPreview: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: SPACING.xs,
        marginTop: SPACING.sm,
    },
    tapToView: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
        marginTop: 60,
    },
    emptyTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    emptySubtitle: {
        textAlign: 'center',
        fontSize: FONT_SIZE.md,
        marginBottom: SPACING.xl,
    },
    buyButton: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.full,
    },
    buyButtonText: {
        color: '#FFF',
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        padding: SPACING.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    modalTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
    },
    ticketDetailContent: {
        alignItems: 'center',
    },
    qrContainer: {
        padding: SPACING.xl,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        marginBottom: SPACING.md,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    qrCodeText: {
        marginTop: SPACING.md,
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    scanHint: {
        marginBottom: SPACING.xl,
        fontSize: FONT_SIZE.sm,
    },
    detailCard: {
        width: '100%',
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
    },
    modalDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalLabel: {
        fontSize: FONT_SIZE.sm,
        marginBottom: 4,
    },
    modalValue: {
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
    },
    modalDivider: {
        height: 1,
        width: '100%',
        marginVertical: SPACING.md,
    },
});
