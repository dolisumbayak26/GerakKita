import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { clearBusLocation, updateBusLocation } from '@/lib/api/tracking';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
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

export default function DriverDashboard() {
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [loading, setLoading] = useState(true);
    const [assignedBus, setAssignedBus] = useState<any>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [locationPermission, setLocationPermission] = useState<string | null>(null);

    // Guard to strictly prevent async leaks
    const isTrackingRef = useRef(false);
    const trackingInterval = useRef<any>(null);

    useEffect(() => {
        loadDriverBus();
        checkPermissions();
        return () => {
            // Force cleanup on unmount
            stopTracking();
        };
    }, [user]);

    const checkPermissions = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setLocationPermission(status);
            if (status !== 'granted') {
                Alert.alert('Izin Lokasi', 'Aplikasi membutuhkan izin lokasi untuk melacak bus.');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const loadDriverBus = async () => {
        try {
            setLoading(true);

            // Get driver's assigned bus from drivers table
            const { data: driver, error } = await supabase
                .from('drivers')
                .select(`
                    bus_id,
                    buses(
                        id,
                        bus_number,
                        route_id,
                        status,
                        routes(route_number, route_name)
                    )
                `)
                .eq('id', user?.id)
                .single();

            if (error) throw error;

            if (driver?.buses) {
                setAssignedBus(driver.buses);
            }
        } catch (error) {
            console.error('Error loading driver bus:', error);
            Alert.alert('Error', 'Gagal memuat info bus Anda');
        } finally {
            setLoading(false);
        }
    };

    const handleStartTrip = async () => {
        if (isTracking) return; // Prevent double start

        if (!assignedBus) {
            Alert.alert('Tidak Ada Bus', 'Anda belum memiliki bus yang di-assign. Hubungi admin.');
            return;
        }
        if (locationPermission !== 'granted') {
            await checkPermissions();
            if (locationPermission !== 'granted') return;
        }

        try {
            setIsTracking(true);
            isTrackingRef.current = true;

            Alert.alert('Perjalanan Dimulai', 'Lokasi Anda sekarang sedang disiarkan.');

            // Send initial update immediately
            await sendLocationUpdate();

            // Start new interval
            if (trackingInterval.current) clearInterval(trackingInterval.current);
            const id = setInterval(sendLocationUpdate, 10000);
            trackingInterval.current = id;
            console.log('Tracking started with Interval ID:', id);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Gagal memulai perjalanan.');
            setIsTracking(false);
            isTrackingRef.current = false;
            stopTracking();
        }
    };

    const handleStopTrip = async () => {
        console.log('User pressed Stop.');
        // 1. Stop tracking locally immediately
        stopTracking();
        setIsTracking(false);
        isTrackingRef.current = false;

        // 2. Clear bus location from DB
        if (assignedBus?.id) {
            try {
                await clearBusLocation(assignedBus.id);
                Alert.alert('Selesai', 'Perjalanan dihentikan. Anda telah offline.');
            } catch (error) {
                console.error("Failed to clear bus location:", error);
                Alert.alert('Perhatian', 'Gagal mengupdate status offline di server, tapi tracking lokal telah berhenti.');
            }
        } else {
            Alert.alert('Selesai', 'Tracking dihentikan.');
        }
    };

    const stopTracking = () => {
        if (trackingInterval.current !== null) {
            console.log('Clearing Interval ID:', trackingInterval.current);
            clearInterval(trackingInterval.current);
            trackingInterval.current = null;
        }
        isTrackingRef.current = false;
    };

    const sendLocationUpdate = async () => {
        // Double check tracking state inside the callback using Ref (synchronous)
        if (!isTrackingRef.current || !assignedBus?.id) {
            return;
        }

        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });

            // Re-check after async wait
            if (!isTrackingRef.current) return;

            console.log('Sending update:', location.coords.latitude, location.coords.longitude);

            await updateBusLocation(
                assignedBus.id,
                location.coords.latitude,
                location.coords.longitude
            );
        } catch (error: any) {
            // Log error but DON'T stop tracking - network issues are temporary
            console.log('Location update failed (will retry):', error?.message || error);
        }
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

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: theme.background,
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
        }}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Dashboard Driver</Text>
                </View>

                {/* Status Card */}
                <View style={[styles.card, { backgroundColor: theme.card }]}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Status Tracking</Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: isTracking ? theme.success : theme.textSecondary }]} />
                        <Text style={[styles.statusText, { color: theme.text }]}>
                            {isTracking ? 'Sedang Berjalan' : 'Tidak Aktif'}
                        </Text>
                    </View>
                </View>

                {/* Bus Info Card */}
                {assignedBus ? (
                    <View style={[styles.busCard, { backgroundColor: theme.primary }]}>
                        <View style={styles.busHeader}>
                            <Ionicons name="bus" size={32} color="#FFF" />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.busLabel}>Bus Anda</Text>
                                <Text style={styles.busNumber}>{assignedBus.bus_number}</Text>
                            </View>
                        </View>
                        {assignedBus.routes && (
                            <View style={styles.routeInfo}>
                                <Ionicons name="map-outline" size={16} color="#FFF" />
                                <Text style={styles.routeText}>
                                    {assignedBus.routes.route_number} - {assignedBus.routes.route_name}
                                </Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={[styles.card, { backgroundColor: theme.card }]}>
                        <View style={styles.emptyState}>
                            <Ionicons name="alert-circle-outline" size={48} color={theme.textSecondary} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                Belum ada bus yang di-assign
                            </Text>
                            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                                Hubungi admin untuk mendapatkan bus
                            </Text>
                        </View>
                    </View>
                )}

                {/* Quick Stats */}
                {isTracking && (
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                            <Ionicons name="time-outline" size={24} color={theme.primary} />
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Durasi</Text>
                            <Text style={[styles.statValue, { color: theme.text }]}>Live</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                            <Ionicons name="location-outline" size={24} color={theme.primary} />
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Status</Text>
                            <Text style={[styles.statValue, { color: theme.text }]}>Aktif</Text>
                        </View>
                    </View>
                )}

            </ScrollView>

            {/* Footer Actions */}
            <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                {!isTracking ? (
                    <TouchableOpacity
                        style={[styles.actionButton, {
                            backgroundColor: assignedBus ? theme.primary : theme.textSecondary
                        }]}
                        onPress={handleStartTrip}
                        disabled={!assignedBus}
                    >
                        <Ionicons name="play-circle" size={24} color="#FFF" />
                        <Text style={styles.actionButtonText}>Mulai Perjalanan</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.error }]}
                        onPress={handleStopTrip}
                    >
                        <Ionicons name="stop-circle" size={24} color="#FFF" />
                        <Text style={styles.actionButtonText}>Berhenti & Offline</Text>
                    </TouchableOpacity>
                )}
            </View>

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
        paddingBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
        paddingTop: 10,
    },
    card: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 18,
        fontWeight: '600',
    },
    busCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    busHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 12,
    },
    busLabel: {
        color: '#FFF',
        fontSize: 12,
        opacity: 0.9,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    busNumber: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: 'bold',
    },
    routeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    routeText: {
        color: '#FFF',
        fontSize: 14,
        opacity: 0.95,
    },
    emptyState: {
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 8,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 4,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    actionButton: {
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
