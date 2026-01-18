import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { deleteReview, getUserReviews, Review, submitReview } from '@/lib/api/reviews';
import { useAuthStore } from '@/lib/store/authStore';
import { supabase } from '@/lib/supabase';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function ReviewsScreen() {
    const { user } = useAuthStore();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [reviewType, setReviewType] = useState<'bus' | 'route'>('bus');
    const [selectedBus, setSelectedBus] = useState<string>('');
    const [selectedRoute, setSelectedRoute] = useState<string>('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const [buses, setBuses] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);

    useEffect(() => {
        loadReviews();
        loadBusesAndRoutes();
    }, []);

    const loadReviews = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await getUserReviews(user.id);
            setReviews(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadBusesAndRoutes = async () => {
        const [busData, routeData] = await Promise.all([
            supabase.from('buses').select('id, bus_number').order('bus_number'),
            supabase.from('routes').select('id, route_name, route_number').order('route_number')
        ]);

        if (busData.data) setBuses(busData.data);
        if (routeData.data) setRoutes(routeData.data);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadReviews();
        setRefreshing(false);
    };

    const handleSubmit = async () => {
        if (!user?.id) return;

        if (reviewType === 'bus' && !selectedBus) {
            Alert.alert('Error', 'Pilih bus terlebih dahulu');
            return;
        }
        if (reviewType === 'route' && !selectedRoute) {
            Alert.alert('Error', 'Pilih route terlebih dahulu');
            return;
        }

        try {
            await submitReview(
                user.id,
                rating,
                comment,
                reviewType === 'bus' ? selectedBus : undefined,
                reviewType === 'route' ? selectedRoute : undefined
            );
            Alert.alert('Berhasil', 'Ulasan Anda telah dikirim!');
            setShowForm(false);
            setComment('');
            setRating(5);
            setSelectedBus('');
            setSelectedRoute('');
            loadReviews();
        } catch (error) {
            Alert.alert('Error', 'Gagal mengirim ulasan');
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!user?.id) return;

        Alert.alert(
            'Hapus Ulasan',
            'Yakin ingin menghapus ulasan ini?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteReview(reviewId, user.id);
                            loadReviews();
                        } catch (error) {
                            Alert.alert('Error', 'Gagal menghapus ulasan');
                        }
                    }
                }
            ]
        );
    };

    const renderStars = (count: number, interactive: boolean = false) => {
        return (
            <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        disabled={!interactive}
                        onPress={() => interactive && setRating(star)}
                    >
                        <Ionicons
                            name={star <= count ? 'star' : 'star-outline'}
                            size={interactive ? 32 : 16}
                            color={star <= count ? '#FFD700' : theme.textSecondary}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, {
            backgroundColor: theme.background,
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
        }]}>
            <StatusBar
                barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={theme.background}
            />

            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Rating & Ulasan</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.primary }]}
                    onPress={() => setShowForm(!showForm)}
                >
                    <Ionicons name={showForm ? 'close' : 'add'} size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
                {showForm && (
                    <Card style={styles.formCard}>
                        <Text style={[styles.formTitle, { color: theme.text }]}>Buat Ulasan Baru</Text>

                        <Text style={[styles.label, { color: theme.textSecondary }]}>Tipe Ulasan</Text>
                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    reviewType === 'bus' && { backgroundColor: theme.primary }
                                ]}
                                onPress={() => setReviewType('bus')}
                            >
                                <Text style={{ color: reviewType === 'bus' ? '#FFF' : theme.text }}>Bus</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    reviewType === 'route' && { backgroundColor: theme.primary }
                                ]}
                                onPress={() => setReviewType('route')}
                            >
                                <Text style={{ color: reviewType === 'route' ? '#FFF' : theme.text }}>Rute</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.label, { color: theme.textSecondary }]}>
                            {reviewType === 'bus' ? 'Pilih Bus' : 'Pilih Rute'}
                        </Text>
                        <View style={[styles.pickerContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            {reviewType === 'bus' ? (
                                <Picker
                                    selectedValue={selectedBus}
                                    onValueChange={setSelectedBus}
                                    style={{ color: theme.text }}
                                >
                                    <Picker.Item label="-- Pilih Bus --" value="" />
                                    {buses.map(b => (
                                        <Picker.Item key={b.id} label={b.bus_number} value={b.id} />
                                    ))}
                                </Picker>
                            ) : (
                                <Picker
                                    selectedValue={selectedRoute}
                                    onValueChange={setSelectedRoute}
                                    style={{ color: theme.text }}
                                >
                                    <Picker.Item label="-- Pilih Rute --" value="" />
                                    {routes.map(r => (
                                        <Picker.Item key={r.id} label={`${r.route_number} - ${r.route_name}`} value={r.id} />
                                    ))}
                                </Picker>
                            )}
                        </View>

                        <Text style={[styles.label, { color: theme.textSecondary }]}>Rating</Text>
                        {renderStars(rating, true)}

                        <Text style={[styles.label, { color: theme.textSecondary }]}>Komentar (Opsional)</Text>
                        <TextInput
                            style={[styles.textInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                            placeholder="Bagikan pengalaman Anda..."
                            placeholderTextColor={theme.textSecondary}
                            multiline
                            numberOfLines={4}
                            value={comment}
                            onChangeText={setComment}
                        />

                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: theme.primary }]}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.submitButtonText}>Kirim Ulasan</Text>
                        </TouchableOpacity>
                    </Card>
                )}

                <Text style={[styles.sectionTitle, { color: theme.text }]}>Riwayat Ulasan Anda</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} />
                ) : reviews.length === 0 ? (
                    <Card>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            Belum ada ulasan. Buat ulasan pertama Anda!
                        </Text>
                    </Card>
                ) : (
                    reviews.map((review) => (
                        <Card key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <View>
                                    <Text style={[styles.reviewTarget, { color: theme.text }]}>
                                        {review.buses?.bus_number || review.routes?.route_name}
                                    </Text>
                                    <Text style={[styles.reviewDate, { color: theme.textSecondary }]}>
                                        {new Date(review.created_at).toLocaleDateString('id-ID')}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDelete(review.id)}>
                                    <Ionicons name="trash-outline" size={20} color={theme.error} />
                                </TouchableOpacity>
                            </View>

                            {renderStars(review.rating)}

                            {review.comment && (
                                <Text style={[styles.reviewComment, { color: theme.text }]}>
                                    {review.comment}
                                </Text>
                            )}
                        </Card>
                    ))
                )}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: SPACING.md,
    },
    formCard: {
        marginBottom: SPACING.lg,
    },
    formTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: FONT_SIZE.sm,
        marginBottom: SPACING.xs,
        marginTop: SPACING.sm,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    typeButton: {
        flex: 1,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
    },
    starsRow: {
        flexDirection: 'row',
        gap: SPACING.xs,
        marginVertical: SPACING.xs,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        marginTop: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: FONT_SIZE.md,
    },
    reviewCard: {
        marginBottom: SPACING.md,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    reviewTarget: {
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
    },
    reviewDate: {
        fontSize: FONT_SIZE.xs,
        marginTop: 2,
    },
    reviewComment: {
        fontSize: FONT_SIZE.sm,
        marginTop: SPACING.sm,
        lineHeight: 20,
    },
});
