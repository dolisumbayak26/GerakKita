import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface PulsingMarkerProps {
    size?: number;
    color?: string;
    duration?: number;
    mode?: 'pulse' | 'blink'; // Added mode
}

export const PulsingMarker: React.FC<PulsingMarkerProps> = ({
    size = 20,
    color = '#3B82F6',
    duration = 1000,
    mode = 'pulse'
}) => {
    const animValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animValue, {
                    toValue: 1,
                    duration: duration,
                    useNativeDriver: true,
                }),
                Animated.timing(animValue, {
                    toValue: 0,
                    duration: duration,
                    useNativeDriver: true,
                }),
            ])
        );

        animation.start();

        return () => animation.stop();
    }, [animValue, duration]);

    if (mode === 'blink') {
        return (
            <Animated.View style={[styles.container, {
                opacity: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1], // Blink functionality
                })
            }]}>
                <View
                    style={[
                        styles.innerDot,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            backgroundColor: color,
                            borderWidth: 2,
                            borderColor: '#FFF',
                            elevation: 5,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 2,
                        },
                    ]}
                >
                    <View style={[styles.centerDot, {
                        width: size * 0.4,
                        height: size * 0.4,
                        borderRadius: (size * 0.4) / 2,
                    }]} />
                </View>
            </Animated.View>
        );
    }

    // Default 'pulse' mode
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
                        transform: [{
                            scale: animValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.5]
                            })
                        }],
                        opacity: animValue.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0.6, 0.3, 0],
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
