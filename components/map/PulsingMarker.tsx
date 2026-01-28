import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface PulsingMarkerProps {
    size?: number;
    color?: string;
}

export const PulsingMarker: React.FC<PulsingMarkerProps> = ({
    size = 20,
    color = '#3B82F6'
}) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.5,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );

        pulse.start();

        return () => pulse.stop();
    }, [pulseAnim]);

    return (
        <View style={styles.container}>
            {/* Pulsing outer ring */}
            <Animated.View
                style={[
                    styles.pulseRing,
                    {
                        width: size * 2,
                        height: size * 2,
                        borderRadius: size,
                        borderColor: color,
                        transform: [{ scale: pulseAnim }],
                        opacity: pulseAnim.interpolate({
                            inputRange: [1, 1.5],
                            outputRange: [0.6, 0],
                        }),
                    },
                ]}
            />

            {/* Inner dot */}
            <View
                style={[
                    styles.innerDot,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: color,
                    },
                ]}
            >
                <View style={[styles.centerDot, {
                    width: size * 0.4,
                    height: size * 0.4,
                    borderRadius: (size * 0.4) / 2,
                }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulseRing: {
        position: 'absolute',
        borderWidth: 2,
    },
    innerDot: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerDot: {
        backgroundColor: '#FFF',
    },
});
