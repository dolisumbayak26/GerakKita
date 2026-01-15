import { useAuth } from '@/lib/hooks/useAuth';
import { BORDER_RADIUS, COLORS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                </View>
                <Text style={styles.name}>{user?.full_name || 'User'}</Text>
                <Text style={styles.email}>{user?.email || ''}</Text>
            </View>

            <View style={styles.section}>
                <MenuItem
                    icon="call-outline"
                    title="Nomor Telepon"
                    subtitle={user?.phone_number || 'Belum diatur'}
                    onPress={() => { }}
                />
                <MenuItem
                    icon="lock-closed-outline"
                    title="Ubah PIN"
                    onPress={() => { }}
                />
                <MenuItem
                    icon="chatbubble-ellipses-outline"
                    title="Pusat Bantuan"
                    onPress={() => { }}
                />
                <MenuItem
                    icon="shield-checkmark-outline"
                    title="Kebijakan Privasi"
                    onPress={() => { }}
                />
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                <Text style={styles.logoutText}>Keluar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, onPress }) => {
    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIcon}>
                    <Ionicons name={icon} size={20} color={COLORS.primary} />
                </View>
                <View>
                    <Text style={styles.menuItemTitle}>{title}</Text>
                    {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        backgroundColor: COLORS.white,
        marginBottom: SPACING.md,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    avatarText: {
        fontSize: FONT_SIZE.xxxl,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    name: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    email: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text.secondary,
    },
    section: {
        backgroundColor: COLORS.white,
        marginBottom: SPACING.md,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.gray[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    menuItemTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    menuItemSubtitle: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text.secondary,
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        paddingVertical: SPACING.md,
        marginHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginTop: SPACING.lg,
        gap: SPACING.sm,
    },
    logoutText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.error,
    },
});
