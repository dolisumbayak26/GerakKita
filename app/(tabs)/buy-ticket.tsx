import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getRoutes } from '@/lib/api/routes';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface RouteItem {
    id: string;
    route_number: string;
    route_name: string;
    description: string | null;
    estimated_duration: string | null;
    stops_count: number;
    color: string;
}

export default function BuyTicketScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [routes, setRoutes] = useState<RouteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            const data = await getRoutes();
            setRoutes(data);
        } catch (error) {
            console.error('Error fetching routes:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchRoutes().finally(() => setRefreshing(false));
    }, []);

    const handleRoutePress = (routeId: string) => {
        router.push({
            pathname: '/booking/confirm',
            params: { routeId }
        });
    };

    const renderRouteItem = ({ item }: { item: RouteItem }) => (
        <TouchableOpacity
            onPress={() => handleRoutePress(item.id)}
            activeOpacity={0.9}
        >
            <Card style={styles.routeCard}>
                <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                        <Ionicons name="bus" size={24} color={item.color} />
                    </View>
                    <View style={styles.routeInfo}>
                        <Text style={[styles.routeNumber, { color: theme.text }]}>
                            Rute {item.route_number}
                        </Text>
                        <Text style={[styles.routeName, { color: theme.textSecondary }]} numberOfLines={1}>
                            {item.route_name}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
                        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                            {item.stops_count} Halte
                        </Text>
                    </View>
                    {item.estimated_duration && (
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                                {item.estimated_duration}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={[styles.priceContainer, { backgroundColor: theme.primary + '10' }]}>
                    <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Mulai dari</Text>
                    <Text style={[styles.priceValue, { color: theme.primary }]}>Rp 3.500</Text>
                </View>
            </Card>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Beli Tiket</Text>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                    Pilih rute perjalananmu
                </Text>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={routes}
                    renderItem={renderRouteItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="bus-outline" size={64} color={theme.textSecondary} />
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>Tidak ada rute</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                                Belum ada rute bus yang tersedia saat ini.
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
        padding: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    headerTitle: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: FONT_SIZE.md,
        marginTop: SPACING.xs,
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
    routeCard: {
        marginBottom: SPACING.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
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
        fontSize: FONT_SIZE.sm,
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: SPACING.md,
    },
    cardBody: {
        flexDirection: 'row',
        gap: SPACING.lg,
        marginBottom: SPACING.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    infoText: {
        fontSize: FONT_SIZE.sm,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    priceLabel: {
        fontSize: FONT_SIZE.sm,
    },
    priceValue: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
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
    },
});
