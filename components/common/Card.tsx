import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BORDER_RADIUS, SPACING } from '../../lib/utils/constants';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    padding?: number;
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    padding = SPACING.md
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <View style={[
            styles.card,
            {
                backgroundColor: theme.card,
                borderColor: theme.border,
                // Adjust shadow for dark mode (optional, usually native elevation works best on dark)
                shadowColor: colorScheme === 'dark' ? '#000' : '#000',
            },
            padding ? { padding } : undefined,
            style
        ]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: BORDER_RADIUS.lg,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});
