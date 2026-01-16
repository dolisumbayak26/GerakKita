import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacyPolicyScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Kebijakan Privasi</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                    Terakhir diperbarui: 16 Januari 2026
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Pendahuluan</Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                    GerakKita berkomitmen untuk melindungi privasi data pengguna. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>2. Informasi yang Kami Kumpulkan</Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                    Kami mengumpulkan informasi yang Anda berikan secara langsung, seperti:
                    {'\n'}- Nama lengkap
                    {'\n'}- Alamat email
                    {'\n'}- Nomor telepon
                    {'\n'}- Foto profil
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>3. Penggunaan Informasi</Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                    Informasi digunakan untuk:
                    {'\n'}- Memproses pembelian tiket
                    {'\n'}- Mengirim tiket dan konfirmasi
                    {'\n'}- Layanan pelanggan
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>4. Keamanan Data</Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                    Kami menggunakan standar keamanan industri untuk melindungi data Anda. Pembayaran diproses oleh pihak ketiga (Midtrans) yang tersertifikasi aman.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>5. Kontak</Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                    Jika ada pertanyaan mengenai kebijakan privasi ini, silakan hubungi kami melalui Pusat Bantuan.
                </Text>
            </ScrollView>
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
    sectionTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    paragraph: {
        fontSize: FONT_SIZE.sm,
        lineHeight: 22,
        marginBottom: SPACING.sm,
    },
});
