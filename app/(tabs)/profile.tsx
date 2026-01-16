import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { pickAndUploadProfileImage } from '@/lib/api/storage';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/lib/store/authStore';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const { setUser } = useAuthStore();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [uploading, setUploading] = useState(false);

    // Logout handles its own errors and state clearing
    const handleLogout = logout;

    const handleUploadPhoto = async () => {
        if (!user?.id) return;

        try {
            setUploading(true);
            const newImageUrl = await pickAndUploadProfileImage(user.id);

            if (newImageUrl) {
                // Update local state with new image URL
                setUser({ ...user, profile_image_url: newImageUrl });
                Alert.alert('Sukses', 'Foto profil berhasil diperbarui!');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            Alert.alert('Gagal', error.message || 'Gagal mengupload foto profil');
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={handleUploadPhoto} disabled={uploading} style={styles.avatarContainer}>
                    {user?.profile_image_url ? (
                        <Image
                            source={{ uri: user.profile_image_url }}
                            style={styles.avatarImage}
                        />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                            <Text style={styles.avatarText}>
                                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                    )}
                    {/* Edit badge */}
                    <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
                        {uploading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Ionicons name="camera" size={14} color="#FFF" />
                        )}
                    </View>
                </TouchableOpacity>
                <Text style={[styles.name, { color: theme.text }]}>{user?.full_name || 'User'}</Text>
                <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email || ''}</Text>
            </View>

            <View style={[styles.section, { backgroundColor: theme.card }]}>
                <MenuItem
                    icon="call-outline"
                    title="Nomor Telepon"
                    subtitle={user?.phone_number || 'Belum diatur'}
                    onPress={() => router.push('/profile/edit-phone')}
                    theme={theme}
                />
                <MenuItem
                    icon="lock-closed-outline"
                    title="Ubah PIN"
                    onPress={() => { }} // Belum diimplementasikan
                    theme={theme}
                />
                <MenuItem
                    icon="chatbubble-ellipses-outline"
                    title="Pusat Bantuan"
                    onPress={() => router.push('/profile/help-center')}
                    theme={theme}
                />
                <MenuItem
                    icon="shield-checkmark-outline"
                    title="Kebijakan Privasi"
                    onPress={() => router.push('/profile/privacy-policy')}
                    theme={theme}
                />
            </View>

            <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: theme.card }]}
                onPress={handleLogout}
            >
                <Ionicons name="log-out-outline" size={20} color={theme.error || '#EF4444'} />
                <Text style={[styles.logoutText, { color: theme.error || '#EF4444' }]}>Keluar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    theme: any;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, onPress, theme }) => {
    return (
        <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={onPress}
        >
            <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: theme.background }]}>
                    <Ionicons name={icon} size={20} color={theme.primary} />
                </View>
                <View>
                    <Text style={[styles.menuItemTitle, { color: theme.text }]}>{title}</Text>
                    {subtitle && <Text style={[styles.menuItemSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        marginBottom: SPACING.md,
        borderBottomWidth: 1, // Optional: add border for better separation in dark mode
        borderBottomColor: 'transparent', // controlled by style prop
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: SPACING.md,
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    avatarText: {
        fontSize: FONT_SIZE.xxxl,
        fontWeight: 'bold',
        color: '#FFFFFF', // Keep white as avatar background is likely primary color
    },
    name: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
    },
    email: {
        fontSize: FONT_SIZE.sm,
    },
    section: {
        marginBottom: SPACING.md,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    menuItemTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
    },
    menuItemSubtitle: {
        fontSize: FONT_SIZE.sm,
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        marginHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginTop: SPACING.lg,
        gap: SPACING.sm,
    },
    logoutText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
    },
});
