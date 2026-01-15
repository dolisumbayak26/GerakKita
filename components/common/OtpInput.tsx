import React, { useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZE, SPACING } from '../../lib/utils/constants';

interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (otp: string) => void;
    error?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
    length = 6,
    value,
    onChange,
    error,
}) => {
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    const handleChange = (text: string, index: number) => {
        // Only allow numbers
        const newText = text.replace(/[^0-9]/g, '');

        if (newText.length > 1) {
            // Handle paste
            const otpArray = newText.slice(0, length).split('');
            const newOtp = value.split('');
            otpArray.forEach((char, i) => {
                if (index + i < length) {
                    newOtp[index + i] = char;
                }
            });
            onChange(newOtp.join(''));

            // Focus last filled input or next empty
            const nextIndex = Math.min(index + otpArray.length, length - 1);
            inputRefs.current[nextIndex]?.focus();
        } else {
            // Single character input
            const otpArray = value.split('');
            otpArray[index] = newText;
            onChange(otpArray.join(''));

            // Auto-focus next input
            if (newText && index < length - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            const otpArray = value.split('');

            if (otpArray[index]) {
                // Clear current input
                otpArray[index] = '';
                onChange(otpArray.join(''));
            } else if (index > 0) {
                // Move to previous input and clear it
                otpArray[index - 1] = '';
                onChange(otpArray.join(''));
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                {Array.from({ length }).map((_, index) => {
                    const digit = value[index] || '';
                    const isFocused = focusedIndex === index;

                    return (
                        <TextInput
                            key={index}
                            ref={(ref) => { inputRefs.current[index] = ref; }}
                            style={[
                                styles.input,
                                isFocused && styles.inputFocused,
                                error && styles.inputError,
                            ]}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            onFocus={() => setFocusedIndex(index)}
                            onBlur={() => setFocusedIndex(null)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                        />
                    );
                })}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: SPACING.sm,
    },
    input: {
        flex: 1,
        aspectRatio: 1,
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: BORDER_RADIUS.lg,
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
        textAlign: 'center',
        color: COLORS.text.primary,
        backgroundColor: COLORS.gray[50],
    },
    inputFocused: {
        borderColor: COLORS.primary,
        borderWidth: 2,
        backgroundColor: COLORS.white,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    errorText: {
        marginTop: SPACING.xs,
        fontSize: FONT_SIZE.sm,
        color: COLORS.error,
        textAlign: 'center',
    },
});
