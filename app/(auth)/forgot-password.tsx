import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { supabase } from '../../lib/supabase';
import { BORDER_RADIUS, COLORS, FONT_SIZE, SPACING } from '../../lib/utils/constants';
import { validateEmail } from '../../lib/utils/validators';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'email' | 'verify'>('email');
    const [errors, setErrors] = useState<{
        email?: string;
        otp?: string;
        newPassword?: string;
        confirmPassword?: string;
    }>({});

    const validateEmailForm = (): boolean => {
        if (!email) {
            setErrors({ email: 'Email harus diisi' });
            return false;
        }
        if (!validateEmail(email)) {
            setErrors({ email: 'Format email tidak valid' });
            return false;
        }
        setErrors({});
        return true;
    };

    const validateResetForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!otp || otp.length !== 6) {
            newErrors.otp = 'Kode OTP harus 6 digit';
        }

        if (!newPassword) {
            newErrors.newPassword = 'Password baru harus diisi';
        } else if (newPassword.length < 6) {
            newErrors.newPassword = 'Password minimal 6 karakter';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Konfirmasi password harus diisi';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Password tidak sama';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendOTP = async () => {
        if (!validateEmailForm()) return;

        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'gerakkita://reset-password',
            });

            if (error) {
                // Check for rate limit error
                if (error.message.toLowerCase().includes('rate limit')) {
                    Alert.alert(
                        'Terlalu Banyak Percobaan',
                        'Anda telah mencapai batas pengiriman email. Silakan tunggu beberapa menit sebelum mencoba lagi.',
                        [{ text: 'OK' }]
                    );
                } else {
                    throw error;
                }
            } else {
                setStep('verify');
                Alert.alert(
                    'Email Terkirim',
                    `Kode OTP telah dikirim ke ${email}. Silakan cek inbox atau folder spam Anda.`,
                    [{ text: 'OK' }]
                );
            }
        } catch (error: any) {
            Alert.alert(
                'Gagal Mengirim Email',
                error.message || 'Terjadi kesalahan. Silakan coba lagi.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!validateResetForm()) return;

        setLoading(true);
        try {
            // Verify OTP and update password
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'recovery',
            });

            if (error) {
                if (error.message.toLowerCase().includes('invalid') ||
                    error.message.toLowerCase().includes('expired')) {
                    setErrors({ otp: 'Kode OTP tidak valid atau sudah kedaluwarsa' });
                } else {
                    throw error;
                }
                return;
            }

            // Update password after successful OTP verification
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) throw updateError;

            Alert.alert(
                'Berhasil',
                'Password berhasil direset. Silakan login dengan password baru Anda.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/login'),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert(
                'Gagal Reset Password',
                error.message || 'Terjadi kesalahan. Silakan coba lagi.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'gerakkita://reset-password',
            });

            if (error) {
                if (error.message.toLowerCase().includes('rate limit')) {
                    Alert.alert(
                        'Terlalu Banyak Percobaan',
                        'Silakan tunggu beberapa menit sebelum mengirim ulang kode OTP.',
                        [{ text: 'OK' }]
                    );
                } else {
                    throw error;
                }
            } else {
                Alert.alert('Berhasil', 'Kode OTP baru telah dikirim ke email Anda.');
            }
        } catch (error: any) {
            Alert.alert('Gagal', error.message || 'Gagal mengirim ulang kode OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header with back button */}
                <TouchableOpacity
                    onPress={() => step === 'email' ? router.back() : setStep('email')}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Ionicons
                        name={step === 'email' ? 'lock-closed-outline' : 'key-outline'}
                        size={64}
                        color={COLORS.primary}
                        style={styles.headerIcon}
                    />
                    <Text style={styles.title}>
                        {step === 'email' ? 'Lupa Password?' : 'Reset Password'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {step === 'email'
                            ? 'Masukkan email Anda dan kami akan mengirimkan kode OTP untuk reset password'
                            : 'Masukkan kode OTP yang dikirim ke email Anda dan password baru'}
                    </Text>
                </View>

                {step === 'email' ? (
                    <View style={styles.form}>
                        <Input
                            label="Email"
                            placeholder="Masukkan email terdaftar"
                            value={email}
                            onChangeText={(text: string) => {
                                setEmail(text);
                                if (errors.email) setErrors({ ...errors, email: undefined });
                            }}
                            type="email"
                            icon="mail-outline"
                            error={errors.email}
                            autoCapitalize="none"
                        />

                        <Button
                            title="Kirim Kode OTP"
                            onPress={handleSendOTP}
                            loading={loading}
                            fullWidth
                            style={styles.submitButton}
                        />

                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backToLogin}
                        >
                            <Ionicons name="arrow-back" size={16} color={COLORS.primary} />
                            <Text style={styles.backToLoginText}>Kembali ke Login</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.form}>
                        <View style={styles.emailDisplay}>
                            <Text style={styles.emailLabel}>Email:</Text>
                            <Text style={styles.emailValue}>{email}</Text>
                        </View>

                        <Input
                            label="Kode OTP"
                            placeholder="Masukkan 6 digit kode OTP"
                            value={otp}
                            onChangeText={(text: string) => {
                                // Only allow numbers and max 6 digits
                                const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
                                setOtp(numericText);
                                if (errors.otp) setErrors({ ...errors, otp: undefined });
                            }}
                            icon="shield-checkmark-outline"
                            error={errors.otp}
                            keyboardType="number-pad"
                            maxLength={6}
                        />

                        <Input
                            label="Password Baru"
                            placeholder="Masukkan password baru"
                            value={newPassword}
                            onChangeText={(text: string) => {
                                setNewPassword(text);
                                if (errors.newPassword) {
                                    setErrors({ ...errors, newPassword: undefined });
                                }
                            }}
                            type="password"
                            icon="key-outline"
                            error={errors.newPassword}
                        />

                        <Input
                            label="Konfirmasi Password Baru"
                            placeholder="Masukkan ulang password baru"
                            value={confirmPassword}
                            onChangeText={(text: string) => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword) {
                                    setErrors({ ...errors, confirmPassword: undefined });
                                }
                            }}
                            type="password"
                            icon="checkmark-circle-outline"
                            error={errors.confirmPassword}
                        />

                        <Button
                            title="Reset Password"
                            onPress={handleResetPassword}
                            loading={loading}
                            fullWidth
                            style={styles.submitButton}
                        />

                        <TouchableOpacity
                            onPress={handleResendOTP}
                            style={styles.resendButton}
                            disabled={loading}
                        >
                            <Text style={styles.resendText}>
                                Tidak menerima kode? <Text style={styles.resendLink}>Kirim Ulang</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.lg,
        justifyContent: 'center',
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: SPACING.lg,
        padding: SPACING.xs,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    headerIcon: {
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: FONT_SIZE.xxxl,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FONT_SIZE.md,
        color: COLORS.text.secondary,
        textAlign: 'center',
        paddingHorizontal: SPACING.md,
    },
    form: {
        width: '100%',
    },
    emailDisplay: {
        backgroundColor: COLORS.gray[100],
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.lg,
    },
    emailLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text.secondary,
        marginBottom: SPACING.xs / 2,
    },
    emailValue: {
        fontSize: FONT_SIZE.md,
        color: COLORS.text.primary,
        fontWeight: '600',
    },
    submitButton: {
        marginTop: SPACING.md,
        marginBottom: SPACING.lg,
    },
    backToLogin: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
        paddingVertical: SPACING.md,
    },
    backToLoginText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.primary,
        fontWeight: '600',
    },
    resendButton: {
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    resendText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text.secondary,
    },
    resendLink: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});
