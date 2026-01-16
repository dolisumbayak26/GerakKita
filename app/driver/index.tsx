import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { assignBusToDriver, updateBusLocation } from '@/lib/api/tracking';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function DriverDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [buses, setBuses] = useState<any[]>([]);
    const [selectedBus, setSelectedBus] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [locationPermission, setLocationPermission] = useState<string | null>(null);

    // Use any to avoid NodeJS.Timeout vs number conflicts in RN
    const trackingInterval = useRef<any>(null);

    useEffect(() => {
        loadBuses();
        checkPermissions();
        return () => stopTracking(); // Cleanup on unmount
    }, []);

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

    const loadBuses = async () => {
        const { data, error } = await supabase
            .from('buses')
            .select('*, routes(route_number, route_name)')
            .order('bus_number');

        if (data) setBuses(data);
        if (error) Alert.alert('Error', 'Gagal memuat data bus');
    };

    const handleStartTrip = async () => {
        if (!selectedBus || !user?.id) {
            Alert.alert('Pilih Bus', 'Silakan pilih bus terlebih dahulu.');
            return;
        }
        if (locationPermission !== 'granted') {
            await checkPermissions();
            if (locationPermission !== 'granted') return;
        }

        try {
            await assignBusToDriver(selectedBus, user.id);

            setIsTracking(true);
            Alert.alert('Perjalanan Dimulai', 'Lokasi Anda sekarang sedang disiarkan.');

            await sendLocationUpdate();

            trackingInterval.current = setInterval(sendLocationUpdate, 10000);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Gagal memulai perjalanan.');
            setIsTracking(false);
        }
    };

    const handleStopTrip = async () => {
        stopTracking();
        setIsTracking(false);
        Alert.alert('Selesai', 'Perjalanan dihentikan. Lokasi tidak lagi diperbarui.');
    };

    const stopTracking = () => {
        if (trackingInterval.current) {
            clearInterval(trackingInterval.current);
            trackingInterval.current = null;
        }
    };

    const sendLocationUpdate = async () => {
        if (!selectedBus) return;
        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });

            console.log('Sending update:', location.coords.latitude, location.coords.longitude);

            await updateBusLocation(
                selectedBus,
                location.coords.latitude,
                location.coords.longitude
            );
        } catch (error) {
            console.log('Location update failed:', error);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Panel Pengemudi</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Status Card */}
                <View style={[styles.card, { backgroundColor: theme.card }]}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Status Pengemudi</Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: isTracking ? theme.success : theme.textSecondary }]} />
                        <Text style={[styles.statusText, { color: theme.text }]}>
                            {isTracking ? 'Sedang Berjalan' : 'Tidak Aktif'}
                        </Text>
                    </View>
                </View>

                {/* Bus Selection */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Pilih Armada</Text>
                <View style={styles.busGrid}>
                    {buses.map((bus) => (
                        <TouchableOpacity
                            key={bus.id}
                            style={[
                                styles.busItem,
                                {
                                    backgroundColor: selectedBus === bus.id ? theme.primary : theme.card,
                                    borderColor: theme.border
                                }
                            ]}
                            onPress={() => !isTracking && setSelectedBus(bus.id)}
                            disabled={isTracking}
                        >
                            <Ionicons
                                name="bus"
                                size={24}
                                color={selectedBus === bus.id ? '#FFF' : theme.text}
                            />
                            <View>
                                <Text style={[
                                    styles.busNumber,
                                    { color: selectedBus === bus.id ? '#FFF' : theme.text }
                                ]}>
                                    {bus.bus_number}
                                </Text>
                                <Text style={[
                                    styles.routeInfo,
                                    { color: selectedBus === bus.id ? '#FFF' : theme.textSecondary }
                                ]}>
                                    {bus.routes?.route_number || 'No Route'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>

            {/* Footer Actions */}
            <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                {!isTracking ? (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.primary }]}
                        onPress={handleStartTrip}
                        disabled={!selectedBus}
                    >
                        <Text style={styles.actionButtonText}>Mulai Perjalanan</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.error }]}
                        onPress={handleStopTrip}
                    >
                        <Text style={styles.actionButtonText}>Selesai / Berhenti</Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    label: {
        fontSize: 12,
        marginBottom: 8,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    busGrid: {
        gap: 12,
    },
    busItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 16,
        borderWidth: 1,
    },
    busNumber: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    routeInfo: {
        fontSize: 12,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    actionButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
