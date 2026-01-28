import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { updatePassword } from '@/lib/api/auth';
import { supabase } from '@/lib/supabase';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
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
    View
} from 'react-native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
    }>({});

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!currentPassword) {
            newErrors.currentPassword = 'Password lama harus diisi';
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

    const handleChangePassword = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Step 1: Re-authenticate user with current password
            const { data: { user } } = await supabase.auth.getUser();

            if (!user?.email) {
                throw new Error('User tidak ditemukan');
            }

            // Verify current password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });

            if (signInError) {
                setErrors({ currentPassword: 'Password lama salah' });
                return;
            }

            // Step 2: Update to new password
            await updatePassword(newPassword);

            Alert.alert(
                'Berhasil',
                'Password berhasil diubah',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert(
                'Gagal Mengubah Password',
                error.message || 'Terjadi kesalahan. Silakan coba lagi.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Password strength indicator
    const getPasswordStrength = (password: string): { label: string; color: string; strength: number } => {
        if (!password) return { label: '', color: theme.textSecondary, strength: 0 };

        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        if (strength <= 1) return { label: 'Lemah', color: '#EF4444', strength: 1 };
        if (strength <= 3) return { label: 'Sedang', color: '#F59E0B', strength: 2 };
        return { label: 'Kuat', color: '#10B981', strength: 3 };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Ubah Password</Text>
                        <View style={styles.backButton} />
                    </View>

                    <View style={styles.content}>
                        <View style={[styles.infoBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Ionicons name="information-circle" size={20} color={theme.primary} />
                            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                                Pastikan password baru Anda minimal 6 karakter dan mudah diingat
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <Input
                                label="Password Lama"
                                placeholder="Masukkan password lama"
                                value={currentPassword}
                                onChangeText={(text: string) => {
                                    setCurrentPassword(text);
                                    if (errors.currentPassword) {
                                        setErrors({ ...errors, currentPassword: undefined });
                                    }
                                }}
                                type="password"
                                icon="lock-closed-outline"
                                error={errors.currentPassword}
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

                            {/* Password strength indicator */}
                            {newPassword.length > 0 && (
                                <View style={styles.strengthContainer}>
                                    <View style={styles.strengthBars}>
                                        {[1, 2, 3].map((i) => (
                                            <View
                                                key={i}
                                                style={[
                                                    styles.strengthBar,
                                                    {
                                                        backgroundColor:
                                                            i <= passwordStrength.strength
                                                                ? passwordStrength.color
                                                                : theme.border,
                                                    },
                                                ]}
                                            />
                                        ))}
                                    </View>
                                    <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                                        {passwordStrength.label}
                                    </Text>
                                </View>
                            )}

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
                                title="Simpan Password Baru"
                                onPress={handleChangePassword}
                                loading={loading}
                                fullWidth
                                style={styles.submitButton}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.sm,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        marginBottom: SPACING.xl,
    },
    infoText: {
        flex: 1,
        fontSize: FONT_SIZE.sm,
        lineHeight: 20,
    },
    form: {
        width: '100%',
    },
    strengthContainer: {
        marginTop: -SPACING.sm,
        marginBottom: SPACING.md,
    },
    strengthBars: {
        flexDirection: 'row',
        gap: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    strengthLabel: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
    },
    submitButton: {
        marginTop: SPACING.lg,
    },
});
