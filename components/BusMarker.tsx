import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Callout, Marker } from 'react-native-maps';
import { RouteBus } from '../lib/api/tracking';

interface BusMarkerProps {
    bus: RouteBus;
    onPress?: () => void;
}

export const BusMarker: React.FC<BusMarkerProps> = ({ bus, onPress }) => {
    if (bus.current_latitude === null || bus.current_longitude === null) {
        return null;
    }

    // Determine color based on status or route (could be passed in)
    const busColor = '#EF4444'; // Red default

    return (
        <Marker
            coordinate={{
                latitude: Number(bus.current_latitude),
                longitude: Number(bus.current_longitude),
            }}
            onPress={onPress}
            title={`Bus ${bus.bus_number}`}
            description={`ETA: ${bus.eta_minutes} mins`}
            anchor={{ x: 0.5, y: 1 }} // Center bottom anchor
            zIndex={10}
        >
            <View style={styles.markerContainer}>
                {/* Bus Shape Body */}
                <View style={[styles.busBody, { backgroundColor: busColor }]}>
                    <View style={styles.busWindow} />
                    <View style={styles.busLightsRow}>
                        <View style={styles.light} />
                        <View style={styles.light} />
                    </View>
                    {/* Optional icon on top of shape if needed, but the shape itself is bus-like */}
                </View>
                {/* Pointer Triangle */}
                <View style={[styles.triangle, { borderTopColor: busColor }]} />
            </View>

            <Callout tooltip>
                <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{bus.bus_number}</Text>
                    <View style={styles.etaBadge}>
                        <Text style={styles.etaText}>{bus.eta_minutes} Min Lagi</Text>
                    </View>
                    <Text style={styles.calloutSub}>Jarak: {(bus.distance_meters / 1000).toFixed(1)} km</Text>
                </View>
            </Callout>
        </Marker>
    );
};

const styles = StyleSheet.create({
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: 40,
    },
    busBody: {
        width: 32,
        height: 32,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 6,
        paddingTop: 4,
    },
    busWindow: {
        width: '75%',
        height: 6,
        backgroundColor: '#E0F2FE', // Light blue window
        borderRadius: 1,
        marginBottom: 3,
    },
    busLightsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '75%',
    },
    light: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FEF08A', // Yellow lights
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderBottomWidth: 0,
        borderTopWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginTop: -1,
    },
    calloutContainer: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 12,
        width: 140,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
        marginBottom: 5,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#1F2937',
        marginBottom: 4,
    },
    etaBadge: {
        backgroundColor: '#DEF7EC',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginBottom: 2,
    },
    etaText: {
        fontSize: 12,
        color: '#03543F',
        fontWeight: 'bold',
    },
    calloutSub: {
        fontSize: 10,
        color: '#6B7280',
    },
});
