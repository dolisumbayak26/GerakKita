import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { OtpInput } from '../../components/common/OtpInput';
import { resendOtp, verifyOtp } from '../../lib/api/auth';
import { useAuthStore } from '../../lib/store/authStore';
import { COLORS, FONT_SIZE, SPACING } from '../../lib/utils/constants';

export default function VerifyOtpScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const setAuth = useAuthStore((state) => state.setAuth);

    // Cooldown timer for resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            setError('Masukkan kode OTP 6 digit');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { session, user } = await verifyOtp(email, otp);

            if (session && user) {
                setAuth(user, session);
                Alert.alert('Berhasil!', 'Email Anda telah diverifikasi', [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/(tabs)'),
                    },
                ]);
            }
        } catch (err: any) {
            console.error('OTP verification error:', err);
            setError(err.message || 'Kode OTP tidak valid atau sudah kadaluarsa');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setLoading(true);
        setError('');
        setOtp('');

        try {
            await resendOtp(email);
            setResendCooldown(60);
            Alert.alert('Berhasil', 'Kode OTP baru telah dikirim ke email Anda');
        } catch (err: any) {
            console.error('Resend OTP error:', err);
            Alert.alert('Gagal', err.message || 'Gagal mengirim ulang kode OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <Text style={styles.title}>Verifikasi Email</Text>
                    <Text style={styles.subtitle}>
                        Masukkan kode OTP 6 digit yang telah dikirim ke
                    </Text>
                    <Text style={styles.email}>{email}</Text>

                    <View style={styles.otpContainer}>
                        <OtpInput
                            value={otp}
                            onChange={setOtp}
                            error={error}
                        />
                    </View>

                    <Button
                        title="Verifikasi"
                        onPress={handleVerify}
                        loading={loading}
                        disabled={otp.length !== 6}
                        style={styles.verifyButton}
                    />

                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>Tidak menerima kode? </Text>
                        {resendCooldown > 0 ? (
                            <Text style={styles.cooldownText}>
                                Kirim ulang dalam {resendCooldown}s
                            </Text>
                        ) : (
                            <TouchableOpacity onPress={handleResend} disabled={loading}>
                                <Text style={styles.resendLink}>Kirim Ulang</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Text style={styles.backText}>Kembali ke Registrasi</Text>
                    </TouchableOpacity>
                </View>
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
    },
    content: {
        flex: 1,
        padding: SPACING.xl,
        justifyContent: 'center',
    },
    title: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZE.md,
        color: COLORS.text.secondary,
        marginBottom: SPACING.xs,
    },
    email: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: SPACING.xl,
    },
    otpContainer: {
        marginBottom: SPACING.xl,
    },
    verifyButton: {
        marginBottom: SPACING.lg,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    resendText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text.secondary,
    },
    resendLink: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.primary,
    },
    cooldownText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text.secondary,
    },
    backButton: {
        alignItems: 'center',
        padding: SPACING.sm,
    },
    backText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text.secondary,
    },
});
