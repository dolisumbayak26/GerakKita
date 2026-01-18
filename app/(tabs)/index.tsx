import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAllBusStops, getRoutes } from '@/lib/api/routes';
import { getWalletBalance } from '@/lib/api/wallet';
import { useAuthStore } from '@/lib/store/authStore';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { formatCurrency } from '@/lib/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Linking,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface NearestStop {
  id: string;
  name: string;
  distance: number; // in meters
  latitude: number;
  longitude: number;
}

const { height } = Dimensions.get('window');
// Dynamic padding based on screen height (Responsive)
const SCREEN_PADDING = height > 800 ? SPACING.xl : SPACING.lg;

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [nearestStop, setNearestStop] = useState<NearestStop | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Focus effect to reload balance when returning to home
  useFocusEffect(
    useCallback(() => {
      if (user?.id) fetchBalance();
    }, [user?.id])
  );

  const fetchBalance = async () => {
    if (!user?.id) return;
    try {
      const wallet = await getWalletBalance(user.id);
      setBalance(wallet?.balance || 0);
    } catch (error) {
      console.log('Wallet fetch error:', error);
    }
  };

  // Quick Actions Data (Dynamic Colors)
  const quickActions = [
    { id: 'search_route', title: 'Info Rute', icon: 'map', color: theme.primary },
    { id: 'buy_ticket', title: 'Beli Tiket', icon: 'cart', color: theme.secondary },
    { id: 'my_tickets', title: 'Tiket Saya', icon: 'ticket', color: theme.success },
  ] as const;

  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    fetchRoutes();
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      findNearestStop(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  const findNearestStop = async (lat: number, lon: number) => {
    try {
      const stops = await getAllBusStops();
      if (!stops) return;

      let minDistance = Infinity;
      let nearest: NearestStop | null = null;

      stops.forEach((stop: any) => {
        const distance = getDistanceFromLatLonInKm(lat, lon, stop.latitude, stop.longitude) * 1000; // Convert to meters
        if (distance < minDistance) {
          minDistance = distance;
          nearest = {
            id: stop.id,
            name: stop.name,
            distance: Math.round(distance),
            latitude: stop.latitude,
            longitude: stop.longitude,
          };
        }
      });

      setNearestStop(nearest);
    } catch (error) {
      console.error('Error finding nearest stop:', error);
    }
  };

  // Haversine formula
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  }

  const fetchRoutes = async () => {
    try {
      const data = await getRoutes();
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Refresh routes data and balance
    Promise.all([fetchRoutes(), fetchBalance()]).finally(() => {
      setTimeout(() => setRefreshing(false), 1000);
    });
  }, []);

  const renderQuickAction = (item: typeof quickActions[number]) => (
    <TouchableOpacity
      key={item.id}
      style={styles.actionItem}
      onPress={() => {
        if (item.id === 'my_tickets') router.push('/(tabs)/my-tickets' as any);
        if (item.id === 'buy_ticket') router.push('/(tabs)/buy-ticket' as any);
        if (item.id === 'search_route') router.push('/routes' as any);
      }}
    >
      <View style={[styles.actionIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <Text style={[styles.actionTitle, { color: theme.text }]}>{item.title}</Text>
    </TouchableOpacity>
  );

  const handleOpenMap = () => {
    if (!nearestStop || !location) return;

    router.push({
      pathname: '/map',
      params: {
        userLat: location.coords.latitude,
        userLon: location.coords.longitude,
        destLat: nearestStop.latitude,
        destLon: nearestStop.longitude,
        destName: nearestStop.name,
        destAddress: nearestStop.name // or address if available
      }
    } as any);
  };

  const handleNavigate = () => {
    if (!nearestStop) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${nearestStop.latitude},${nearestStop.longitude}`;
    Linking.openURL(url);
  };

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
        </View>

        {/* Wallet Card */}
        <TouchableOpacity
          style={[styles.walletCard, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/wallet/history')}
        >
          <View>
            <Text style={styles.walletLabel}>Saldo GerakPay</Text>
            <Text style={styles.walletBalance}>
              {balance !== null ? formatCurrency(balance) : 'Rp ...'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.topUpButton}
            onPress={() => router.push('/wallet/topup')}
          >
            <Ionicons name="add-circle" size={24} color={theme.primary} />
            <Text style={[styles.topUpText, { color: theme.primary }]}>Top Up</Text>
          </TouchableOpacity>
        </TouchableOpacity>

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
            <TouchableOpacity onPress={handleOpenMap} activeOpacity={0.9}>
              <View style={styles.mapContainer}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={StyleSheet.absoluteFillObject}
                  region={location ? {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  } : {
                    latitude: 3.5952, // Default Medan
                    longitude: 98.6722,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  onPress={handleOpenMap} // Ensure map clicks also trigger it
                >
                  {/* User Location Marker */}
                  {location && (
                    <Marker
                      coordinate={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                      }}
                      title="Lokasi Anda"
                    >
                      <View style={[styles.markerContainer, { backgroundColor: '#3B82F6', borderColor: '#FFF' }]}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' }} />
                      </View>
                    </Marker>
                  )}

                  {/* Nearest Stop Marker */}
                  {nearestStop && (
                    <Marker
                      coordinate={{ latitude: nearestStop.latitude, longitude: nearestStop.longitude }}
                      title={nearestStop.name}
                    >
                      <View style={[styles.markerContainer, { backgroundColor: theme.primary }]}>
                        <Ionicons name="bus" size={14} color="#FFF" />
                      </View>
                    </Marker>
                  )}
                </MapView>
              </View>
            </TouchableOpacity>
            <View style={styles.nearbyInfo}>
              <View>
                <Text style={[styles.stopName, { color: theme.text }]}>
                  {nearestStop ? nearestStop.name : 'Mencari halte terdekat...'}
                </Text>
                <Text style={[styles.stopDistance, { color: theme.textSecondary }]}>
                  {nearestStop
                    ? `${nearestStop.distance}m • Jalan kaki ${~~(nearestStop.distance / 1.4 / 60)} menit`
                    : 'Mohon aktifkan lokasi'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.directionButton, { backgroundColor: theme.primary }]}
                onPress={handleNavigate}
              >
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
  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  walletLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONT_SIZE.sm,
    marginBottom: 4,
  },
  walletBalance: {
    color: '#FFF',
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  topUpText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
  },
});
