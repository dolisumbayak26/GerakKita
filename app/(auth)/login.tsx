import { router } from 'expo-router';
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
import { login } from '../../lib/api/auth';
import { COLORS, FONT_SIZE, SPACING } from '../../lib/utils/constants';
import { validateEmail } from '../../lib/utils/validators';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validateForm = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email) {
            newErrors.email = 'Email harus diisi';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Format email tidak valid';
        }

        if (!password) {
            newErrors.password = 'Password harus diisi';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const authData = await login({ email, password });

            // Get user profile to determine user type
            if (authData.user) {
                const { getUserProfile } = await import('../../lib/api/auth');
                const userProfile = await getUserProfile(authData.user.id);

                // Redirect based on user type
                if (userProfile.user_type === 'driver') {
                    router.replace('/(driver-tabs)/index' as any);
                } else {
                    router.replace('/(tabs)');
                }
            } else {
                router.replace('/(tabs)');
            }
        } catch (error: any) {
            Alert.alert(
                'Login Gagal',
                error.message || 'Email atau password salah. Silakan coba lagi.'
            );
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
                <View style={styles.header}>
                    <Text style={styles.title}>Login</Text>
                    <Text style={styles.subtitle}>Selamat datang kembali di GerakKita!</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Email atau Nomor Telepon"
                        placeholder="Masukkan email atau nomor telepon"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errors.email) setErrors({ ...errors, email: undefined });
                        }}
                        type="email"
                        icon="mail-outline"
                        error={errors.email}
                        autoCapitalize="none"
                    />

                    <Input
                        label="Password"
                        placeholder="Masukkan password"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password) setErrors({ ...errors, password: undefined });
                        }}
                        type="password"
                        icon="lock-closed-outline"
                        error={errors.password}
                    />

                    <TouchableOpacity
                        onPress={() => router.push('/forgot-password')}
                        style={styles.forgotPassword}
                    >
                        <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
                    </TouchableOpacity>

                    <Button
                        title="Login"
                        onPress={handleLogin}
                        loading={loading}
                        fullWidth
                        style={styles.loginButton}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Belum punya akun? </Text>
                        <TouchableOpacity onPress={() => router.push('/register')}>
                            <Text style={styles.signUpText}>Daftar Sekarang</Text>
                        </TouchableOpacity>
                    </View>
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
        padding: SPACING.lg,
        justifyContent: 'center',
    },
    header: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: FONT_SIZE.xxxl,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZE.md,
        color: COLORS.text.secondary,
    },
    form: {
        width: '100%',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.lg,
    },
    forgotPasswordText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.primary,
        fontWeight: '600',
    },
    loginButton: {
        marginBottom: SPACING.lg,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.md,
    },
    footerText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text.secondary,
    },
    signUpText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.primary,
        fontWeight: '600',
    },
});
