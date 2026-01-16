import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HelpCenterScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const contactOptions = [
        {
            icon: 'logo-whatsapp',
            title: 'WhatsApp',
            subtitle: 'Chat dengan CS kami (08:00 - 17:00)',
            action: () => Linking.openURL('https://wa.me/6281234567890'),
            color: '#25D366'
        },
        {
            icon: 'mail-outline',
            title: 'Email',
            subtitle: 'Kirim email ke support@gerakkita.id',
            action: () => Linking.openURL('mailto:support@gerakkita.id'),
            color: theme.primary
        },
        {
            icon: 'call-outline',
            title: 'Call Center',
            subtitle: 'Hubungi (021) 1234-5678',
            action: () => Linking.openURL('tel:02112345678'),
            color: theme.primary
        },
    ];

    const faqItems = [
        {
            q: 'Bagaimana cara membeli tiket?',
            a: 'Pilih menu "Beli Tiket", pilih rute dan jadwal, lalu lakukan pembayaran via metode yang tersedia.'
        },
        {
            q: 'Apakah tiket bisa di-refund?',
            a: 'Saat ini tiket yang sudah dibeli tidak dapat dibatalkan atau refund. Mohon pastikan jadwal Anda sesuai.'
        },
        {
            q: 'Bagaimana jika pembayaran gagal?',
            a: 'Jika pembayaran gagal, silakan coba lagi atau pilih metode pembayaran lain. Hubungi CS jika kendala berlanjut.'
        },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Pusat Bantuan</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Hubungi Kami</Text>
                <View style={[styles.card, { backgroundColor: theme.card }]}>
                    {contactOptions.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.contactItem,
                                { borderBottomColor: theme.border },
                                index === contactOptions.length - 1 && { borderBottomWidth: 0 }
                            ]}
                            onPress={item.action}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
                                <Ionicons name={item.icon as any} size={24} color={item.color} />
                            </View>
                            <View style={styles.contactText}>
                                <Text style={[styles.contactTitle, { color: theme.text }]}>{item.title}</Text>
                                <Text style={[styles.contactSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.sectionTitle, { color: theme.text, marginTop: SPACING.xl }]}>FAQ (Tanya Jawab)</Text>
                {faqItems.map((item, index) => (
                    <View key={index} style={[styles.faqItem, { backgroundColor: theme.card }]}>
                        <Text style={[styles.faqQuestion, { color: theme.text }]}>{item.q}</Text>
                        <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>{item.a}</Text>
                    </View>
                ))}
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
        padding: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        marginBottom: SPACING.sm,
        marginLeft: SPACING.xs,
    },
    card: {
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    contactText: {
        flex: 1,
    },
    contactTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
    },
    contactSubtitle: {
        fontSize: FONT_SIZE.sm,
    },
    faqItem: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
    },
    faqQuestion: {
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
    },
    faqAnswer: {
        fontSize: FONT_SIZE.sm,
        lineHeight: 20,
    },
});
