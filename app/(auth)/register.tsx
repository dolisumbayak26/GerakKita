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
import { register } from '../../lib/api/auth';
import { COLORS, FONT_SIZE, SPACING } from '../../lib/utils/constants';
import { validateEmail, validateFullName, validatePassword } from '../../lib/utils/validators';

export default function RegisterScreen() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!fullName) {
            newErrors.fullName = 'Nama lengkap harus diisi';
        } else if (!validateFullName(fullName)) {
            newErrors.fullName = 'Nama minimal 3 karakter';
        }

        if (!email) {
            newErrors.email = 'Email harus diisi';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Format email tidak valid';
        }

        if (!password) {
            newErrors.password = 'Password harus diisi';
        } else {
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                newErrors.password = passwordValidation.message!;
            }
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Konfirmasi password harus diisi';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Password tidak cocok';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await register({
                email,
                password,
                full_name: fullName,
                phone_number: phoneNumber || undefined,
            });

            // Navigate to OTP verification screen
            router.push({
                pathname: '/verify-otp',
                params: { email },
            });
        } catch (error: any) {
            Alert.alert(
                'Registrasi Gagal',
                error.message || 'Terjadi kesalahan. Silakan coba lagi.'
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
                    <Text style={styles.title}>Daftar Akun</Text>
                    <Text style={styles.subtitle}>Buat akun GerakKita Anda</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Nama Lengkap"
                        placeholder="Masukkan nama lengkap"
                        value={fullName}
                        onChangeText={(text) => {
                            setFullName(text);
                            if (errors.fullName) {
                                const { fullName, ...rest } = errors;
                                setErrors(rest);
                            }
                        }}
                        icon="person-outline"
                        error={errors.fullName}
                    />

                    <Input
                        label="Email"
                        placeholder="Masukkan email"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errors.email) {
                                const { email, ...rest } = errors;
                                setErrors(rest);
                            }
                        }}
                        type="email"
                        icon="mail-outline"
                        error={errors.email}
                        autoCapitalize="none"
                    />

                    <Input
                        label="Nomor Telepon (Opsional)"
                        placeholder="Masukkan nomor telepon"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        type="phone"
                        icon="call-outline"
                    />

                    <Input
                        label="Password"
                        placeholder="Minimal 8 karakter"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password) {
                                const { password, ...rest } = errors;
                                setErrors(rest);
                            }
                        }}
                        type="password"
                        icon="lock-closed-outline"
                        error={errors.password}
                    />

                    <Input
                        label="Konfirmasi Password"
                        placeholder="Ulangi password"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (errors.confirmPassword) {
                                const { confirmPassword, ...rest } = errors;
                                setErrors(rest);
                            }
                        }}
                        type="password"
                        icon="lock-closed-outline"
                        error={errors.confirmPassword}
                    />

                    <Button
                        title="Daftar"
                        onPress={handleRegister}
                        loading={loading}
                        fullWidth
                        style={styles.registerButton}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Sudah punya akun? </Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.loginText}>Login</Text>
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
    registerButton: {
        marginTop: SPACING.md,
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
    loginText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.primary,
        fontWeight: '600',
    },
});
