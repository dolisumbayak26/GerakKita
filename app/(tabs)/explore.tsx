import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getRoutes } from '@/lib/api/routes';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

// --- Dummy Data for Explore ---
const CATEGORIES = [
  { id: 'all', name: 'Semua', icon: 'grid' },
  { id: 'wisata', name: 'Wisata', icon: 'camera' },
  { id: 'kuliner', name: 'Kuliner', icon: 'restaurant' },
  { id: 'belanja', name: 'Belanja', icon: 'bag' },
  { id: 'transport', name: 'Transport', icon: 'train' },
];

const DESTINATIONS = [
  {
    id: '1',
    name: 'Taman Kota Hijau',
    category: 'wisata',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop', // Park
    description: 'Taman kota dengan pepohonan rindang dan danau buatan.',
    nearestStop: 'Halte Pusat Kota'
  },
  {
    id: '2',
    name: 'Grand Mall Plaza',
    category: 'belanja',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1567958451986-2de427a4a0be?q=80&w=600&auto=format&fit=crop', // Mall
    description: 'Pusat perbelanjaan terbesar dengan ratusan brand ternama.',
    nearestStop: 'Halte Mall Utara'
  },
  {
    id: '3',
    name: 'Pasar Seni Tradisional',
    category: 'kuliner',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=600&auto=format&fit=crop', // Market
    description: 'Pusat kuliner dan kerajinan tangan lokal.',
    nearestStop: 'Halte Pasar Lama'
  },
  {
    id: '4',
    name: 'Museum Sejarah',
    category: 'wisata',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop', // Museum
    description: 'Jelajahi sejarah kota dari masa lampau.',
    nearestStop: 'Halte Balai Kota'
  }
];

export default function ExploreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const data = await getRoutes();
      setRoutes(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDestinationPress = (dest: any) => {
    Alert.alert(
      'Pergi ke Sini?',
      `Ingin mencari rute bus menuju ${dest.name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Cari Rute',
          onPress: () => {
            // For MVP, navigate to buy ticket page
            // Ideally pass destination stop name to search
            router.push('/(tabs)/buy-ticket');
          }
        }
      ]
    );
  };

  const filteredDestinations = activeCategory === 'all'
    ? DESTINATIONS
    : DESTINATIONS.filter(d => d.category === activeCategory);

  // Filter by Search Query
  const displayedDestinations = searchQuery
    ? filteredDestinations.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : filteredDestinations;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Search */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Jelajahi Kota</Text>
          <TouchableOpacity style={[styles.notifButton, { backgroundColor: theme.border + '40' }]}>
            <Ionicons name="notifications-outline" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Cari tempat tujuan..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRoutes} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: activeCategory === cat.id ? theme.primary : theme.card,
                    borderColor: activeCategory === cat.id ? theme.primary : theme.border,
                    borderWidth: 1
                  }
                ]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={activeCategory === cat.id ? '#FFF' : theme.text}
                  style={{ marginRight: 6 }}
                />
                <Text style={[
                  styles.categoryText,
                  { color: activeCategory === cat.id ? '#FFF' : theme.text }
                ]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Destinations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {searchQuery ? 'Hasil Pencarian' : 'Destinasi Populer'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: theme.primary }]}>Lihat Semua</Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={displayedDestinations}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destinationsList}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity activeOpacity={0.9} onPress={() => handleDestinationPress(item)}>
                <Card style={[styles.destCard, { width: width * 0.6 }]}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.destImage}
                    contentFit="cover"
                    transition={1000}
                  />
                  <View style={styles.destContent}>
                    <View style={styles.destHeader}>
                      <Text style={[styles.destName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={10} color="#FFD700" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                    </View>
                    <Text style={[styles.destDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View style={styles.destFooter}>
                      <Ionicons name="location-outline" size={12} color={theme.primary} />
                      <Text style={[styles.nearestStop, { color: theme.textSecondary }]}>{item.nearestStop}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={{ width: width - 32, alignItems: 'center', padding: 20 }}>
                <Text style={{ color: theme.textSecondary }}>Tidak ada destinasi ditemukan</Text>
              </View>
            }
          />
        </View>

        {/* Promotional Banner */}
        <View style={[styles.bannerContainer, { backgroundColor: theme.primary }]}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Promo Weekend!</Text>
            <Text style={styles.bannerSubtitle}>Diskon 50% untuk perjalanan ke Taman Kota.</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={[styles.bannerButtonText, { color: theme.primary }]}>Cek Sekarang</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="ticket" size={120} color="#FFFFFF40" style={styles.bannerIcon} />
        </View>

        {/* Popular Routes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: SPACING.md }]}>Rute Favorit</Text>
          {loading && !routes.length ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <View style={styles.routesGrid}>
              {routes.slice(0, 5).map((route) => (
                <TouchableOpacity
                  key={route.id}
                  onPress={() => router.push('/routes' as any)}
                >
                  <Card style={styles.routeCard}>
                    <View style={[styles.routeIcon, { backgroundColor: route.color || theme.primary }]}>
                      <Ionicons name="bus" size={24} color="#FFF" />
                    </View>
                    <View style={styles.routeInfo}>
                      <Text style={[styles.routeCode, { color: theme.text }]}>{route.route_number}</Text>
                      <Text style={[styles.routeDir, { color: theme.textSecondary }]} numberOfLines={1}>{route.route_name}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'System', // Use default bold font
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    height: '100%',
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  categoriesContainer: {
    marginTop: SPACING.md,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  categoryText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  destinationsList: {
    gap: SPACING.md,
    paddingRight: SPACING.md, // Extra padding for last item
  },
  destCard: {
    padding: 0, // Override default padding
    overflow: 'hidden',
  },
  destImage: {
    width: '100%',
    height: 140,
  },
  destContent: {
    padding: SPACING.md,
  },
  destHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  destName: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F57F17',
  },
  destDesc: {
    fontSize: FONT_SIZE.xs,
    lineHeight: 18,
    marginBottom: 8,
  },
  destFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nearestStop: {
    fontSize: 10,
    fontWeight: '500',
  },
  bannerContainer: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    height: 120,
  },
  bannerContent: {
    flex: 1,
    zIndex: 1,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#FFFFFFCC',
    fontSize: FONT_SIZE.sm,
    marginBottom: 12,
  },
  bannerButton: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  bannerButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: 'bold',
  },
  bannerIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    transform: [{ rotate: '-15deg' }],
  },
  routesGrid: {
    gap: SPACING.md,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  routeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeInfo: {
    flex: 1,
  },
  routeCode: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  routeDir: {
    fontSize: FONT_SIZE.sm,
  },
});
