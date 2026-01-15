import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getRoutes } from '@/lib/api/routes';
import { useAuthStore } from '@/lib/store/authStore';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { height } = Dimensions.get('window');
// Dynamic padding based on screen height (Responsive)
const SCREEN_PADDING = height > 800 ? SPACING.xl : SPACING.lg;

export default function HomeScreen() {
  const { user } = useAuthStore();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [refreshing, setRefreshing] = React.useState(false);

  // Quick Actions Data (Dynamic Colors)
  const quickActions = [
    { id: 'search_route', title: 'Info Rute', icon: 'map', color: theme.primary },
    { id: 'tickets', title: 'Tiket Saya', icon: 'ticket', color: theme.secondary },
    { id: 'topup', title: 'Top Up', icon: 'wallet', color: theme.success },
  ] as const;

  const [routes, setRoutes] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const data = await getRoutes();
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Refresh routes data
    fetchRoutes().finally(() => {
      setTimeout(() => setRefreshing(false), 1000);
    });
  }, []);

  const renderQuickAction = (item: typeof quickActions[number]) => (
    <TouchableOpacity
      key={item.id}
      style={styles.actionItem}
      onPress={() => {
        if (item.id === 'tickets') router.push('/(tabs)/tickets' as any);
        if (item.id === 'search_route') router.push('/routes' as any);
      }}
    >
      <View style={[styles.actionIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <Text style={[styles.actionTitle, { color: theme.text }]}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[
      styles.container,
      {
        backgroundColor: theme.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
      }
    ]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: SCREEN_PADDING }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.text }]}>Halo, {user?.full_name?.split(' ')[0] || 'Teman'}! </Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color={theme.primary} />
              <Text style={[styles.locationText, { color: theme.textSecondary }]}>Medan, ID</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.avatarText, { color: theme.text }]}>
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bus */}
        <Card style={styles.searchCard}>
          <Text style={[styles.searchLabel, { color: theme.text }]}>Mau kemana hari ini?</Text>
          <TouchableOpacity style={[
            styles.searchBar,
            { backgroundColor: colorScheme === 'dark' ? '#374151' : '#F9FAFB', borderColor: theme.border }
          ]}>
            <Ionicons name="search" size={20} color={theme.textSecondary} />
            <Text style={[styles.searchPlaceholder, { color: theme.textSecondary }]}>Cari halte, stasiun, atau tujuan...</Text>
          </TouchableOpacity>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.actionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Nearby Bus Stops (Banner) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Halte Terdekat</Text>
          <Card style={styles.nearbyCard} padding={0}>
            {/* Replaced placeholder with MapView */}
            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFillObject}
                initialRegion={{
                  latitude: 3.5952, // Medan coordinates
                  longitude: 98.6722,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{ latitude: 3.5952, longitude: 98.6722 }}
                  title="Halte Unpri"
                >
                  <View style={[styles.markerContainer, { backgroundColor: theme.primary }]}>
                    <Ionicons name="bus" size={14} color="#FFF" />
                  </View>
                </Marker>
              </MapView>
            </View>
            <View style={styles.nearbyInfo}>
              <View>
                <Text style={[styles.stopName, { color: theme.text }]}>Halte Unpri </Text>
                <Text style={[styles.stopDistance, { color: theme.textSecondary }]}>200m • Jalan kaki 3 menit</Text>
              </View>
              <TouchableOpacity style={[styles.directionButton, { backgroundColor: theme.primary }]}>
                <Ionicons name="navigate" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Popular Routes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Rute Populer</Text>
            <TouchableOpacity onPress={() => router.push('/routes' as any)}>
              <Text style={[styles.seeAllButton, { color: theme.primary }]}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.routesList}>
            {routes.slice(0, 3).map((route) => (
              <Card key={route.id} style={styles.routeCard}>
                <View style={[styles.routeIcon, { backgroundColor: colorScheme === 'dark' ? '#374151' : '#F3F4F6' }]}>
                  <Ionicons name="bus" size={24} color={theme.primary} />
                </View>
                <View style={styles.routeInfo}>
                  <Text style={[styles.routeName, { color: theme.text }]}>{route.route_name}</Text>
                  <Text style={[styles.routeDesc, { color: theme.textSecondary }]}>{route.description || 'Tidak ada deskripsi'}</Text>
                </View>
                <View style={[styles.routeTime, { backgroundColor: colorScheme === 'dark' ? '#374151' : '#F3F4F6' }]}>
                  <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                  <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                    {route.estimated_duration ? route.estimated_duration.replace('minutes', 'mnt').replace('mins', 'mnt') : '-'}
                  </Text>
                </View>
              </Card>
            ))}
            {routes.length === 0 && (
              <Text style={{ textAlign: 'center', color: theme.textSecondary, marginTop: 10 }}>Memuat rute...</Text>
            )}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.sm,
  },
  greeting: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.xs / 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: FONT_SIZE.sm,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  searchCard: {
    marginBottom: SPACING.xl,
  },
  searchLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  searchPlaceholder: {
    fontSize: FONT_SIZE.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    gap: SPACING.xs,
    width: 70,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  seeAllButton: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  nearbyCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent', // Will be handled by theme in component
  },
  mapContainer: {
    height: 150,
    width: '100%',
    overflow: 'hidden',
  },
  markerContainer: {
    padding: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyInfo: {
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stopName: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  stopDistance: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  directionButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routesList: {
    gap: SPACING.md,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  routeIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  routeDesc: {
    fontSize: FONT_SIZE.sm,
  },
  routeTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  timeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
});
