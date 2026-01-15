import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZE, SPACING } from '../../lib/utils/constants';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    type?: 'text' | 'email' | 'password' | 'phone';
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    type = 'text',
    ...textInputProps
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const getKeyboardType = () => {
        switch (type) {
            case 'email':
                return 'email-address';
            case 'phone':
                return 'phone-pad';
            default:
                return 'default';
        }
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputContainerFocused,
                    error && styles.inputContainerError,
                ]}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={error ? COLORS.error : isFocused ? COLORS.primary : COLORS.gray[400]}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    {...textInputProps}
                    style={[styles.input, textInputProps.style]}
                    keyboardType={getKeyboardType()}
                    secureTextEntry={type === 'password' && !showPassword}
                    autoCapitalize={type === 'email' ? 'none' : textInputProps.autoCapitalize}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholderTextColor={COLORS.gray[400]}
                />
                {type === 'password' && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={COLORS.gray[400]}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray[50],
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
        paddingHorizontal: SPACING.md,
    },
    inputContainerFocused: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.white,
    },
    inputContainerError: {
        borderColor: COLORS.error,
    },
    icon: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        paddingVertical: SPACING.md,
        fontSize: FONT_SIZE.md,
        color: COLORS.text.primary,
    },
    eyeIcon: {
        padding: SPACING.sm,
    },
    error: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.error,
        marginTop: SPACING.xs,
        marginLeft: SPACING.xs,
    },
});
