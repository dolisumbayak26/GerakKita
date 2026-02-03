import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function DriverReviews() {
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [assignedBus, setAssignedBus] = useState<any>(null);

    useEffect(() => {
        loadReviews();
    }, [user]);

    const loadReviews = async () => {
        try {
            setLoading(true);

            // Get driver's assigned bus
            const { data: driver } = await supabase
                .from('drivers')
                .select('bus_id')
                .eq('id', user?.id)
                .single();

            if (driver?.bus_id) {
                setAssignedBus(driver.bus_id);

                // Get reviews for this bus
                const { data, error } = await supabase
                    .from('reviews')
                    .select(`
                        *,
                        customers!reviews_user_id_fkey(full_name, profile_image_url)
                    `)
                    .eq('bus_id', driver.bus_id)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    setReviews(data);
                }
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadReviews();
    };

    const renderRating = (rating: number) => {
        return (
            <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                        key={star}
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={16}
                        color={star <= rating ? '#FFD700' : theme.textSecondary}
                    />
                ))}
            </View>
        );
    };

    const renderReview = ({ item }: { item: any }) => (
        <View style={[styles.reviewCard, { backgroundColor: theme.card }]}>
            <View style={styles.reviewHeader}>
                <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                    <Text style={styles.avatarText}>
                        {item.customers?.full_name?.charAt(0) || 'U'}
                    </Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.customerName, { color: theme.text }]}>
                        {item.customers?.full_name || 'Anonymous'}
                    </Text>
                    <Text style={[styles.date, { color: theme.textSecondary }]}>
                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </Text>
                </View>
                {renderRating(item.rating)}
            </View>
            {item.comment && (
                <Text style={[styles.comment, { color: theme.text }]}>
                    {item.comment}
                </Text>
            )}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[
                styles.container,
                {
                    backgroundColor: theme.background,
                    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
                }
            ]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: theme.background,
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
        }}>
            {!assignedBus ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubble-outline" size={64} color={theme.textSecondary} />
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        Belum ada bus yang di-assign
                    </Text>
                </View>
            ) : reviews.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="star-outline" size={64} color={theme.textSecondary} />
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        Belum ada ulasan
                    </Text>
                    <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                        Berikan pelayanan terbaik untuk mendapat ulasan positif
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={reviews}
                    renderItem={renderReview}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListHeaderComponent={
                        <View style={styles.header}>
                            <Text style={[styles.headerTitle, { color: theme.text }]}>Ulasan Customer</Text>
                            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                                Lihat feedback dari penumpang
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
    },
    list: {
        padding: 20,
        paddingTop: 0,
    },
    reviewCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    customerName: {
        fontSize: 15,
        fontWeight: '600',
    },
    date: {
        fontSize: 12,
        marginTop: 2,
    },
    ratingContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    comment: {
        fontSize: 14,
        lineHeight: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});
