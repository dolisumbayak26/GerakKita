import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function DriverRouteInfo() {
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [assignedBus, setAssignedBus] = useState<any>(null);
    const [routeStops, setRouteStops] = useState<any[]>([]);

    useEffect(() => {
        loadDriverRoute();
    }, [user]);

    const loadDriverRoute = async () => {
        try {
            setLoading(true);

            // Get driver's assigned bus
            const { data: driver, error: driverError } = await supabase
                .from('drivers')
                .select('bus_id, buses(id, bus_number, route_id, routes(*))')
                .eq('id', user?.id)
                .single();

            if (driverError) throw driverError;

            if (driver?.buses) {
                const busData = driver.buses as any; // Type assertion for nested query
                setAssignedBus(busData);

                // Get route stops if route exists
                if (busData.routes) {
                    const { data: stops, error: stopsError } = await supabase
                        .from('route_stops')
                        .select('*, bus_stops(*)')
                        .eq('route_id', busData.route_id)
                        .order('stop_order');

                    if (!stopsError && stops) {
                        setRouteStops(stops);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading route:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadDriverRoute();
    };

    if (loading) {
        return (
            <SafeAreaView style={[
                styles.container,
                {
                    backgroundColor: theme.background,
                    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
                }
            ]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!assignedBus) {
        return (
            <SafeAreaView style={[
                styles.container,
                {
                    backgroundColor: theme.background,
                    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
                }
            ]}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="bus-outline" size={64} color={theme.textSecondary} />
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        Belum ada bus yang di-assign
                    </Text>
                    <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                        Hubungi admin untuk mendapatkan assignment bus
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: theme.background,
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
        }}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Rute Saya</Text>
                </View>

                {/* Bus Info Card */}
                <View style={[styles.card, { backgroundColor: theme.card }]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="bus" size={24} color={theme.primary} />
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Bus Assigned</Text>
                    </View>
                    <Text style={[styles.busNumber, { color: theme.text }]}>
                        {assignedBus.bus_number}
                    </Text>
                    {assignedBus.routes && (
                        <Text style={[styles.routeName, { color: theme.textSecondary }]}>
                            {assignedBus.routes.route_number} - {assignedBus.routes.route_name}
                        </Text>
                    )}
                </View>

                {/* Route Stops */}
                {routeStops.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Halte di Rute ({routeStops.length})
                        </Text>
                        {routeStops.map((stop, index) => (
                            <View
                                key={stop.id}
                                style={[
                                    styles.stopCard,
                                    { backgroundColor: theme.card, borderLeftColor: theme.primary }
                                ]}
                            >
                                <View style={styles.stopHeader}>
                                    <View style={[styles.stopNumber, { backgroundColor: theme.primary }]}>
                                        <Text style={styles.stopNumberText}>{stop.stop_order}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.stopName, { color: theme.text }]}>
                                            {stop.bus_stops?.name}
                                        </Text>
                                        <Text style={[styles.stopAddress, { color: theme.textSecondary }]}>
                                            {stop.bus_stops?.address}
                                        </Text>
                                    </View>
                                </View>
                                {stop.fare_from_origin > 0 && (
                                    <Text style={[styles.fare, { color: theme.textSecondary }]}>
                                        Tarif dari awal: Rp{stop.fare_from_origin.toLocaleString('id-ID')}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="map-outline" size={48} color={theme.textSecondary} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            Tidak ada data halte
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    card: {
        margin: 20,
        marginTop: 10,
        padding: 20,
        borderRadius: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    busNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    routeName: {
        fontSize: 14,
    },
    section: {
        padding: 20,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    stopCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
    },
    stopHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    stopNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stopNumberText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    stopName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    stopAddress: {
        fontSize: 13,
        lineHeight: 18,
    },
    fare: {
        fontSize: 12,
        marginTop: 8,
        marginLeft: 44,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        minHeight: 300,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});
