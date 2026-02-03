import { PulsingMarker } from '@/components/map/PulsingMarker';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAllBusStops } from '@/lib/api/routes';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Linking, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function MapScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const mapRef = useRef<MapView>(null);

    const {
        userLat,
        userLon,
        destLat,
        destLon,
        destName,
        destAddress
    } = params;
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [allBusStops, setAllBusStops] = useState<any[]>([]);

    useEffect(() => {
        loadBusStops();
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setUserLocation(location);

            if (mapRef.current) {
                const coordinates = [];
                if (location) {
                    coordinates.push({ latitude: location.coords.latitude, longitude: location.coords.longitude });
                } else if (userLat && userLon) {
                    coordinates.push({ latitude: parseFloat(userLat as string), longitude: parseFloat(userLon as string) });
                }

                if (destLat && destLon) {
                    coordinates.push({ latitude: parseFloat(destLat as string), longitude: parseFloat(destLon as string) });
                }

                if (coordinates.length > 0) {
                    mapRef.current.fitToCoordinates(
                        coordinates,
                        {
                            edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
                            animated: true,
                        }
                    );
                }
            }
        })();
    }, [userLat, destLat]);

    const loadBusStops = async () => {
        try {
            const stops = await getAllBusStops();
            if (stops) {
                setAllBusStops(stops);
            }
        } catch (error) {
            console.error('Error loading bus stops:', error);
        }
    };

    const openGoogleMaps = () => {
        if (destLat && destLon) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLon}&travelmode=driving`;
            Linking.openURL(url).catch(err => console.error("Couldn't open Google Maps", err));
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFillObject}
                initialRegion={{
                    latitude: userLat ? parseFloat(userLat as string) : (userLocation?.coords.latitude || 3.5952),
                    longitude: userLon ? parseFloat(userLon as string) : (userLocation?.coords.longitude || 98.6722),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                {/* User Location with Pulse */}
                {userLocation && (
                    <Marker
                        coordinate={{
                            latitude: userLocation.coords.latitude,
                            longitude: userLocation.coords.longitude
                        }}
                        title="Lokasi Anda"
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <PulsingMarker size={24} color={theme.primary} />
                    </Marker>
                )}

                {/* All Bus Stops (Filter out destination to avoid double marker) */}
                {allBusStops
                    .filter(stop =>
                        // Don't render if it's the destination (because we render a special red marker for it below)
                        !(destLat && destLon &&
                            Math.abs(parseFloat(stop.latitude) - parseFloat(destLat as string)) < 0.0001 &&
                            Math.abs(parseFloat(stop.longitude) - parseFloat(destLon as string)) < 0.0001)
                    )
                    .map((stop) => (
                        <Marker
                            key={stop.id}
                            coordinate={{
                                latitude: parseFloat(stop.latitude),
                                longitude: parseFloat(stop.longitude)
                            }}
                            title={stop.name}
                            description={stop.address}
                        >
                            <View style={[styles.busStopMarker, {
                                backgroundColor: '#90EE90', // Light green
                                borderColor: '#FFF'
                            }]}>
                                <Ionicons name="bus" size={14} color="#FFF" />
                            </View>
                        </Marker>
                    ))}

                {/* Destination Marker (Slow Red Pulse) */}
                {destLat && destLon && (
                    <Marker
                        coordinate={{
                            latitude: parseFloat(destLat as string),
                            longitude: parseFloat(destLon as string)
                        }}
                        title={destName || 'Tujuan'}
                        description={destAddress}
                        pinColor="red" // Fallback
                    >
                        <PulsingMarker size={24} color="red" duration={1000} mode="blink" />
                    </Marker>
                )}
            </MapView>

            {/* Back Button */}
            <TouchableOpacity
                style={[styles.backButton, { backgroundColor: theme.background }]}
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>

            {/* Title Card */}
            <SafeAreaView style={[styles.infoCard, { backgroundColor: theme.card }]}>
                <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoTitle, { color: theme.text }]} numberOfLines={2}>
                        {destName || 'Peta'}
                    </Text>
                    <Text style={[styles.infoSubtitle, { color: theme.textSecondary }]} numberOfLines={2}>
                        {destAddress || 'Menampilkan lokasi'}
                    </Text>
                </View>
                {destLat && (
                    <TouchableOpacity
                        style={[styles.navigateButton, { backgroundColor: theme.primary }]}
                        onPress={openGoogleMaps}
                    >
                        <Ionicons name="navigate-circle-outline" size={24} color="#FFF" />
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Navigasi</Text>
                    </TouchableOpacity>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 50,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    userMarkerOutline: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFF',
    },
    userMarkerCore: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#3B82F6',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    stopMarkerContainer: {
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    stopMarkerArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 0,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        position: 'absolute',
        bottom: -8,
        // We can't dynamically set borderTopColor easily in StyleSheet,
        // will rely on marker container background matching or use inline style for arrow if needed.
        // For simplicity, hardcode distinct color or better, use View style override in render
        borderTopColor: '#3B82F6',
    },
    markerContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    infoCard: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        padding: 20, // Increased from 16
        borderRadius: 16,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoTextContainer: {
        flex: 1,
        marginRight: 10,
        marginLeft: 12, // Increased to 12 as requested
    },
    infoTitle: {
        fontSize: 16, // Reduced from 18
        fontWeight: 'bold',
        marginBottom: 4,
    },
    infoSubtitle: {
        fontSize: 12, // Reduced from 14
    },
    busStopMarker: {
        padding: 6,
        borderRadius: 20,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    destinationMarker: {
        padding: 10,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 7,
    },
    navigateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
    },
});
