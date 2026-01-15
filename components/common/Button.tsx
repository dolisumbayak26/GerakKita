import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle
} from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZE, SPACING } from '../../lib/utils/constants';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    fullWidth = false,
    style,
}) => {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                styles[variant],
                styles[size],
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' ? COLORS.primary : COLORS.white}
                />
            ) : (
                <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    fullWidth: {
        width: '100%',
    },
    // Variants
    primary: {
        backgroundColor: COLORS.primary,
    },
    secondary: {
        backgroundColor: COLORS.gray[100],
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    danger: {
        backgroundColor: COLORS.error,
    },
    disabled: {
        opacity: 0.5,
    },
    // Sizes
    small: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
    },
    medium: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
    },
    large: {
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.xl,
    },
    // Text styles
    text: {
        fontWeight: '600',
    },
    primaryText: {
        color: COLORS.white,
    },
    secondaryText: {
        color: COLORS.text.primary,
    },
    outlineText: {
        color: COLORS.primary,
    },
    dangerText: {
        color: COLORS.white,
    },
    smallText: {
        fontSize: FONT_SIZE.sm,
    },
    mediumText: {
        fontSize: FONT_SIZE.md,
    },
    largeText: {
        fontSize: FONT_SIZE.lg,
    },
});
