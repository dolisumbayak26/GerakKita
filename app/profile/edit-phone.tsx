import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { updateUserProfile } from '@/lib/api/auth';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/lib/store/authStore';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditPhoneScreen() {
    const { user } = useAuth();
    const { setUser } = useAuthStore();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!user?.id) return;
        if (!phoneNumber.trim()) {
            Alert.alert('Eror', 'Nomor telepon tidak boleh kosong');
            return;
        }

        try {
            setLoading(true);
            console.log('Attempting to update profile for user:', user.id);
            console.log('New phone number:', phoneNumber);

            const updatedUser = await updateUserProfile(user.id, { phone_number: phoneNumber });
            console.log('Update success:', updatedUser);
            setUser(updatedUser); // Update local store
            Alert.alert('Sukses', 'Nomor telepon berhasil diperbarui', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Update phone error:', error);
            Alert.alert('Gagal', error.message || 'Gagal memperbarui nomor telepon');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Ubah Nomor Telepon</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Nomor Telepon</Text>
                    <TextInput
                        style={[styles.input, {
                            backgroundColor: theme.card,
                            color: theme.text,
                            borderColor: theme.border
                        }]}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="Contoh: 08123456789"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="phone-pad"
                        autoFocus
                    />
                    <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                        Pastikan nomor telepon aktif untuk menerima notifikasi penting.
                    </Text>

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Simpan</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
    },
    content: {
        padding: SPACING.lg,
    },
    label: {
        fontSize: FONT_SIZE.sm,
        marginBottom: SPACING.xs,
        marginLeft: SPACING.xs,
    },
    input: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: FONT_SIZE.md,
        marginBottom: SPACING.sm,
    },
    helperText: {
        fontSize: FONT_SIZE.xs,
        marginBottom: SPACING.xl,
        marginLeft: SPACING.xs,
    },
    saveButton: {
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
    },
});
