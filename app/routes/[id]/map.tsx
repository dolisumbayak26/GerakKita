import { BusMarker } from '@/components/BusMarker';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getRouteDetails } from '@/lib/api/routes';
import { fetchRouteBuses, RouteBus } from '@/lib/api/tracking';
import { BORDER_RADIUS, FONT_SIZE } from '@/lib/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

export default function RouteMapScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const mapRef = useRef<MapView>(null);

    const [route, setRoute] = useState<any>(null);
    const [stops, setStops] = useState<any[]>([]);
    const [buses, setBuses] = useState<RouteBus[]>([]);
    // Default location (Medan) to prevent null issues
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [loading, setLoading] = useState(true);

    // Initial load
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted' && mounted) {
                    const location = await Location.getCurrentPositionAsync({});
                    if (mounted) setUserLocation(location);
                }
            } catch (e) {
                console.log('Location permission error or timeout');
            }
        })();

        loadRouteData();

        return () => { mounted = false; };
    }, [id]);

    // Polling Effect
    useEffect(() => {
        const interval = setInterval(() => {
            if (userLocation && id) {
                updateBusLocations();
            }
        }, 15000);

        return () => clearInterval(interval);
    }, [id, userLocation]);

    const loadRouteData = async () => {
        try {
            setLoading(true);
            const details = await getRouteDetails(id!);
            setRoute(details);
            setStops(details.stops || []);

            const lat = userLocation?.coords.latitude || 3.5952;
            const lon = userLocation?.coords.longitude || 98.6722;

            // Safe fetch
            const busData = await fetchRouteBuses(id!, lat, lon).catch(() => []);
            setBuses(busData || []);

        } catch (error) {
            console.error('Error loading route map:', error);
            Alert.alert('Error', 'Gagal memuat data rute.');
        } finally {
            setLoading(false);
        }
    };

    const updateBusLocations = async () => {
        if (!userLocation) return;
        try {
            const busData = await fetchRouteBuses(
                id!,
                userLocation.coords.latitude,
                userLocation.coords.longitude
            );
            if (busData) setBuses(busData);
        } catch (error) {
            console.log('Silent update error:', error);
        }
    };

    const fitToRoute = () => {
        if (!stops.length || !mapRef.current) return;

        const coordinates: { latitude: number; longitude: number; }[] = [];

        // Add valid stops
        stops.forEach(stop => {
            if (stop.bus_stops?.latitude && stop.bus_stops?.longitude) {
                coordinates.push({
                    latitude: Number(stop.bus_stops.latitude),
                    longitude: Number(stop.bus_stops.longitude)
                });
            }
        });

        // Add user location
        if (userLocation) {
            coordinates.push({
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude
            });
        }

        // Add valid bus locations
        buses.forEach(bus => {
            if (bus.current_latitude && bus.current_longitude) {
                coordinates.push({
                    latitude: Number(bus.current_latitude),
                    longitude: Number(bus.current_longitude)
                });
            }
        });

        if (coordinates.length > 1) { // Need at least 2 points to fit nicely
            mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
                animated: true
            });
        } else if (coordinates.length === 1) {
            mapRef.current.animateToRegion({
                latitude: coordinates[0].latitude,
                longitude: coordinates[0].longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
        }
    };

    useEffect(() => {
        if (!loading && stops.length > 0) {
            // Increased delay to 1s to ensure map native view is ready on slower devices
            setTimeout(fitToRoute, 1000);
        }
    }, [loading, stops]);

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ marginTop: 10, color: theme.textSecondary }}>Memuat peta...</Text>
            </View>
        );
    }

    // Filter valid stops for polyline
    const routeCoordinates = stops
        .filter(s => s.bus_stops?.latitude && s.bus_stops?.longitude)
        .map(stop => ({
            latitude: Number(stop.bus_stops.latitude),
            longitude: Number(stop.bus_stops.longitude)
        }));

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <MapView
                ref={mapRef}
                style={styles.map}
                // Removed explicit provider to allow auto-detection (fixes some iOS crashes)
                initialRegion={{
                    latitude: 3.5952,
                    longitude: 98.6722,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
            >
                {/* Route Path */}
                {routeCoordinates.length > 1 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor={theme.primary}
                        strokeWidth={4}
                    />
                )}

                {/* Bus Stops */}
                {stops.map((stop, index) => {
                    if (!stop.bus_stops?.latitude || !stop.bus_stops?.longitude) return null;
                    return (
                        <Marker
                            key={`stop-${stop.id}`}
                            coordinate={{
                                latitude: Number(stop.bus_stops.latitude),
                                longitude: Number(stop.bus_stops.longitude)
                            }}
                            title={stop.bus_stops.name}
                            description={`Halte ke-${index + 1}`}
                        >
                            <View style={[styles.stopMarker, { backgroundColor: '#FFF', borderColor: theme.primary }]}>
                                <View style={[styles.stopDot, { backgroundColor: theme.primary }]} />
                            </View>
                        </Marker>
                    );
                })}

                {/* Live Buses */}
                {buses.map((bus) => (
                    <BusMarker
                        key={`bus-${bus.id}`}
                        bus={bus}
                    />
                ))}
            </MapView>

            {/* Header Overlay */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: theme.card }]}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={[styles.routeInfoCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.routeTitle, { color: theme.text }]}>
                        {route?.route_number} - {route?.route_name}
                    </Text>
                    <Text style={[styles.routeSubtitle, { color: theme.textSecondary }]}>
                        {buses.length} Bus Aktif • {stops.length} Halte
                    </Text>
                </View>
            </View>

            {/* Floating Action Buttons */}
            <View style={styles.fabContainer}>
                <TouchableOpacity
                    onPress={fitToRoute}
                    style={[styles.fab, { backgroundColor: theme.card }]}
                >
                    <Ionicons name="map-outline" size={24} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={updateBusLocations}
                    style={[styles.fab, { backgroundColor: theme.card }]}
                >
                    <Ionicons name="refresh" size={24} color={theme.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: width,
        height: height,
    },
    header: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 50, // Adjust for top safe area
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    routeInfoCard: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    routeTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
    },
    routeSubtitle: {
        fontSize: FONT_SIZE.xs,
        marginTop: 2,
    },
    stopMarker: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stopDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        gap: 12,
    },
    fab: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
});
