import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SelectBusScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [loading, setLoading] = useState(true);
    const [buses, setBuses] = useState<any[]>([]);
    const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        try {
            setLoading(true);

            // 1. Get all buses
            const { data: allBuses, error: busError } = await supabase
                .from('buses')
                .select(`
                    id,
                    bus_number,
                    status,
                    route_id,
                    routes (route_number, route_name)
                `)
                .order('bus_number');

            if (busError) throw busError;

            // 2. Get all assigned bus IDs from drivers table
            const { data: assignedDrivers, error: driverError } = await supabase
                .from('drivers')
                .select('bus_id')
                .not('bus_id', 'is', null);

            if (driverError) throw driverError;

            // 3. Filter available buses
            // Bus is available if:
            // a. NOT in assigned list OR
            // b. Currently assigned to THIS driver (though unlikely if we are here)
            const assignedIds = assignedDrivers.map(d => d.bus_id);
            const availableBuses = allBuses?.filter(bus =>
                !assignedIds.includes(bus.id) ||
                (user?.id && false) // If we wanted to include current user's bus (logic requires fetching current driver's bus_id first)
            ) || [];

            setBuses(availableBuses);
        } catch (error) {
            console.error('Error fetching buses:', error);
            Alert.alert('Error', 'Gagal memuat data bus.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBus = async () => {
        if (!selectedBusId || !user?.id) return;

        try {
            setSubmitting(true);

            // Update driver's bus_id
            const { error } = await supabase
                .from('drivers')
                .update({ bus_id: selectedBusId })
                .eq('id', user.id);

            if (error) throw error;

            Alert.alert('Sukses', 'Bus berhasil dipilih!', [
                { text: 'OK', onPress: () => router.replace('/portal-driver') }
            ]);

        } catch (error) {
            console.error('Error selecting bus:', error);
            Alert.alert('Gagal', 'Terjadi kesalahan saat memilih bus.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isSelected = selectedBusId === item.id;

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.card,
                        borderColor: isSelected ? theme.primary : 'transparent',
                        borderWidth: 2
                    }
                ]}
                onPress={() => setSelectedBusId(item.id)}
            >
                <View style={styles.busIconContainer}>
                    <Ionicons
                        name="bus"
                        size={32}
                        color={isSelected ? theme.primary : theme.textSecondary}
                    />
                </View>
                <View style={styles.busInfo}>
                    <Text style={[styles.busNumber, { color: theme.text }]}>Bus {item.bus_number}</Text>
                    {item.routes ? (
                        <Text style={[styles.routeText, { color: theme.textSecondary }]}>
                            {item.routes.route_number} - {item.routes.route_name}
                        </Text>
                    ) : (
                        <Text style={[styles.routeText, { color: theme.textSecondary, fontStyle: 'italic' }]}>
                            Tidak ada rute
                        </Text>
                    )}
                </View>
                {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Pilih Bus</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={buses}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={fetchBuses} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="bus-outline" size={48} color={theme.textSecondary} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                Tidak ada bus yang tersedia saat ini.
                            </Text>
                        </View>
                    }
                />
            )}

            <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                <Button
                    title={submitting ? "Menyimpan..." : "Pilih Bus Ini"}
                    onPress={handleSelectBus}
                    variant="primary"
                    loading={submitting}
                    disabled={!selectedBusId || submitting}
                    // fullWidth prop might not exist, checking Button.tsx content next, assuming default or style prop needed
                    style={{ width: '100%' }}
                />
            </View>
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
        padding: 20,
        gap: 16,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    busIconContainer: {
        marginRight: 16,
    },
    busInfo: {
        flex: 1,
    },
    busNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    routeText: {
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
});
