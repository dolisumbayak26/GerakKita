import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getRouteDetails, getRoutes } from '@/lib/api/routes';
import { calculateBusETA, formatETAText, getBusCapacityStatus } from '@/lib/utils/busLogic';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    LayoutAnimation,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function RoutesScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    // Fix: Update state type to hold both stops and buses
    const [routeStops, setRouteStops] = useState<Record<string, { stops: any[]; buses: any[] }>>({});
    const [loadingStops, setLoadingStops] = useState<string | null>(null);

    // Fetch Routes on Mount
    useEffect(() => {
        loadRoutes();
    }, []);

    const loadRoutes = async () => {
        try {
            setLoading(true);
            const data = await getRoutes();
            setRoutes(data);
        } catch (error) {
            console.error('Failed to load routes:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = async (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        const isExpanding = expandedRouteId !== id;
        setExpandedRouteId(isExpanding ? id : null);

        // Fetch stops if expanding and not yet loaded
        if (isExpanding && !routeStops[id]) {
            try {
                setLoadingStops(id);
                const details = await getRouteDetails(id);
                setRouteStops(prev => ({
                    ...prev,
                    [id]: {
                        stops: details.stops || [],
                        buses: details.buses || []
                    }
                }));
            } catch (error) {
                console.error('Failed to load stops:', error);
            } finally {
                setLoadingStops(null);
            }
        }
    };

    const renderRouteItem = ({ item }: { item: any }) => {
        const isExpanded = expandedRouteId === item.id;
        const stops = routeStops[item.id]?.stops || [];
        const buses = routeStops[item.id]?.buses || [];
        const isLoadingStops = loadingStops === item.id;

        return (
            <Card style={styles.routeCard} padding={SPACING.md}>
                {/* Header Card */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleExpand(item.id)}
                    style={styles.cardHeader}
                >
                    <View style={styles.headerLeft}>
                        {/* Route Number Badge */}
                        <Text style={[styles.routeCode, { color: theme.text }]}>
                            Rute {item.route_number}
                        </Text>
                        <Text style={[styles.routePath, { color: theme.textSecondary }]}>
                            {item.route_name}
                        </Text>
                    </View>

                    <View style={styles.headerRight}>
                        <View style={styles.timeBadge}>
                            <Ionicons name="time-outline" size={14} color={theme.success} />
                            <Text style={[styles.timeText, { color: theme.success }]}>
                                {item.estimated_duration || '...'}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        onPress={() => toggleExpand(item.id)}
                        style={styles.expandButton}
                    >
                        <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={16}
                            color={theme.primary}
                        />
                        <Text style={[styles.expandText, { color: theme.primary }]}>
                            Lihat {item.stops_count} Halte
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/booking/confirm', params: { routeId: item.id } })}
                        style={[styles.bookButton, { backgroundColor: theme.primary }]}
                    >
                        <Text style={styles.bookButtonText}>Beli Tiket</Text>
                    </TouchableOpacity>
                </View>

                {isExpanded && (
                    <View style={[styles.stopsList, { borderTopColor: theme.border }]}>
                        {isLoadingStops ? (
                            <Text style={{ textAlign: 'center', padding: 10, color: theme.textSecondary }}>Memuat halte...</Text>
                        ) : (
                            <>
                                {stops.map((stop: any, index: number) => (
                                    <React.Fragment key={stop.id}>
                                        <View style={styles.timelineItem}>
                                            <View style={[
                                                styles.dot,
                                                { backgroundColor: index === 0 || index === stops.length - 1 ? item.color : theme.textSecondary }
                                            ]} />
                                            <Text style={[styles.stopName, { color: theme.text }]}>
                                                {stop.bus_stops?.name || 'Halte'}
                                            </Text>
                                        </View>
                                        {index < stops.length - 1 && (
                                            <View style={[styles.line, { backgroundColor: theme.border }]} />
                                        )}
                                    </React.Fragment>
                                ))}

                                {/* Bus Information Section */}
                                {buses.length > 0 && (
                                    <View style={[styles.busInfoContainer, { backgroundColor: theme.card }]}>
                                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                            Armada Tersedia ({buses.filter((b: any) => b.status === 'available').length})
                                        </Text>
                                        {buses.map((bus: any) => {
                                            const capacityInfo = getBusCapacityStatus(bus.total_seats, bus.available_seats);
                                            const etaMinutes = calculateBusETA(bus);

                                            return (
                                                <View key={bus.id} style={{ marginBottom: 12 }}>
                                                    <View style={[styles.busItem, { borderColor: theme.border }]}>
                                                        {/* Left: Bus Icon */}
                                                        <View style={[styles.busIconBadge, { backgroundColor: theme.primary + '15', alignSelf: 'flex-start', marginTop: 2 }]}>
                                                            <Ionicons name="bus" size={18} color={theme.primary} />
                                                        </View>

                                                        {/* Middle: Details */}
                                                        <View style={{ flex: 1, paddingRight: 8 }}>
                                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Text style={[styles.busNumber, { color: theme.text }]}>{bus.bus_number}</Text>
                                                            </View>

                                                            <View style={[
                                                                styles.capacityBadge,
                                                                { backgroundColor: capacityInfo.color + '15', alignSelf: 'flex-start', marginBottom: 4 }
                                                            ]}>
                                                                <Ionicons name={capacityInfo.icon as any} size={10} color={capacityInfo.color} />
                                                                <Text style={[
                                                                    styles.capacityText,
                                                                    { color: capacityInfo.color }
                                                                ]}>
                                                                    {capacityInfo.label}
                                                                </Text>
                                                            </View>

                                                            <Text style={[styles.etaText, { color: theme.primary, textAlign: 'left', fontSize: 12 }]}>
                                                                {formatETAText(etaMinutes)}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {/* Schedule for this bus */}
                                                    {bus.bus_schedules && bus.bus_schedules.length > 0 && (
                                                        <View style={[styles.scheduleContainer, { backgroundColor: theme.background }]}>
                                                            <Text style={[styles.scheduleTitle, { color: theme.textSecondary }]}>Jadwal:</Text>
                                                            <View style={styles.scheduleGrid}>
                                                                {bus.bus_schedules
                                                                    .sort((a: any, b: any) => a.departure_time.localeCompare(b.departure_time))
                                                                    .slice(0, 3) // Show top 3
                                                                    .map((schedule: any, idx: number) => (
                                                                        <View key={idx} style={[styles.scheduleBadge, { borderColor: theme.border }]}>
                                                                            <Text style={[styles.scheduleText, { color: theme.text }]}>
                                                                                {schedule.departure_time.substring(0, 5)}
                                                                            </Text>
                                                                        </View>
                                                                    ))}
                                                                {bus.bus_schedules.length > 3 && (
                                                                    <Text style={[styles.moreText, { color: theme.primary }]}>+{bus.bus_schedules.length - 3}</Text>
                                                                )}
                                                            </View>
                                                        </View>
                                                    )}
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                )}
            </Card>
        );
    };

    const filteredRoutes = routes.filter(r =>
        r.route_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.route_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Daftar Rute Bus</Text>
                <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="filter" size={24} color={theme.primary} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: colorScheme === 'dark' ? '#374151' : '#F3F4F6' }]}>
                    <Ionicons name="search" size={20} color={theme.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Cari rute atau tujuan..."
                        placeholderTextColor={theme.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Content */}
            <FlatList
                data={filteredRoutes}
                keyExtractor={(item) => item.id}
                renderItem={renderRouteItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshing={loading}
                onRefresh={loadRoutes}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    filterButton: {
        padding: SPACING.xs,
    },
    searchContainer: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        height: 48,
        borderRadius: BORDER_RADIUS.lg,
        gap: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: FONT_SIZE.md,
        height: '100%',
    },
    listContent: {
        padding: SPACING.lg,
        gap: SPACING.md,
    },
    routeCard: {
        marginBottom: SPACING.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    routeCode: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    routePath: {
        fontSize: FONT_SIZE.sm,
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: SPACING.xs,
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    expandText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
    },
    stopsList: {
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        gap: 4,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        height: 24,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginLeft: 4,
    },
    line: {
        width: 2,
        height: 16,
        marginLeft: 8,
        marginVertical: 2,
    },
    stopName: {
        fontSize: FONT_SIZE.sm,
    },
    busInfoContainer: {
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        gap: SPACING.xs,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.sm,
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
    },
    busItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    busItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    busIconBadge: {
        width: 36,
        height: 36,
        borderRadius: BORDER_RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    busNumber: {
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    etaText: {
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    capacityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    capacityText: {
        fontSize: 10,
        fontWeight: '600',
    },
    scheduleContainer: {
        marginTop: 6,
        marginLeft: 48, // Indent to align with text
        padding: 0,
    },
    scheduleTitle: {
        fontSize: 10,
        marginBottom: 4,
        fontWeight: '500',
    },
    scheduleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        alignItems: 'center',
    },
    scheduleBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    scheduleText: {
        fontSize: 10,
        fontWeight: '600',
    },
    moreText: {
        fontSize: 10,
        fontWeight: '600',
    },
    bookButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        marginLeft: 'auto', // Push to right
    },
    bookButtonText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: 'bold',
        color: '#FFF',
    },
});
