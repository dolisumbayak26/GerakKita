import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS } from '../../lib/utils/constants';

interface LoadingProps {
    fullScreen?: boolean;
    size?: 'small' | 'large';
    color?: string;
}

export const Loading: React.FC<LoadingProps> = ({
    fullScreen = false,
    size = 'large',
    color = COLORS.primary,
}) => {
    if (fullScreen) {
        return (
            <View style={styles.fullScreenContainer}>
                <ActivityIndicator size={size} color={color} />
            </View>
        );
    }

    return <ActivityIndicator size={size} color={color} />;
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
});
