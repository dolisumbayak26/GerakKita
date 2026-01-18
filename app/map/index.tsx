import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

    useEffect(() => {
        if (mapRef.current && userLat && destLat) {
            // Fit to coordinates with padding
            mapRef.current.fitToCoordinates(
                [
                    { latitude: parseFloat(userLat as string), longitude: parseFloat(userLon as string) },
                    { latitude: parseFloat(destLat as string), longitude: parseFloat(destLon as string) }
                ],
                {
                    edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
                    animated: true,
                }
            );
        }
    }, [userLat, destLat]);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFillObject}
                initialRegion={{
                    latitude: parseFloat(userLat as string) || 3.5952,
                    longitude: parseFloat(userLon as string) || 98.6722,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                {/* User Marker */}
                {userLat && (
                    <Marker
                        coordinate={{
                            latitude: parseFloat(userLat as string),
                            longitude: parseFloat(userLon as string)
                        }}
                        title="Lokasi Anda"
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={styles.userMarkerOutline}>
                            <View style={styles.userMarkerCore} />
                        </View>
                    </Marker>
                )}

                {/* Destination Marker */}
                {destLat && (
                    <Marker
                        coordinate={{
                            latitude: parseFloat(destLat as string),
                            longitude: parseFloat(destLon as string)
                        }}
                        title={destName as string}
                        description={destAddress as string}
                    >
                        <View style={[styles.stopMarkerContainer, { backgroundColor: theme.primary }]}>
                            <Ionicons name="bus" size={20} color="#FFF" />
                            <View style={[styles.stopMarkerArrow, { borderTopColor: theme.primary }]} />
                        </View>
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
            <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
                <View>
                    <Text style={[styles.infoTitle, { color: theme.text }]}>{destName || 'Peta'}</Text>
                    <Text style={[styles.infoSubtitle, { color: theme.textSecondary }]}>
                        {destAddress || 'Menampilkan lokasi'}
                    </Text>
                </View>
            </View>
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
        padding: 16,
        borderRadius: 16,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    infoSubtitle: {
        fontSize: 14,
    }
});
