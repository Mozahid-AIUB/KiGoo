import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import TripCard from '../home/TripCard';
import { fetchRoutes, fetchTripsForRoute, type Route, type Trip } from '../home/mockTrips';
import ErrorScreen from '../../components/ErrorScreen';
import { colors, fonts, radius, spacing, typography } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'TripSelection'>;

type Direction = 'to_campus' | 'from_campus';

export default function TripSelectionScreen({ navigation, route }: Props) {
  const { routeId } = route.params;
  const [direction, setDirection] = useState<Direction>('to_campus');
  const [routeInfo, setRouteInfo] = useState<Route | null>(null);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = useCallback(() => setRetryKey((k) => k + 1), []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchRoutes(), fetchTripsForRoute(routeId)])
      .then(([routes, trips]) => {
        setRouteInfo(routes.find((r) => r.id === routeId) ?? null);
        setAllTrips(trips);
      })
      .catch(() => setError('Could not load trips. Check your connection and try again.'))
      .finally(() => setLoading(false));
  }, [routeId, retryKey]);

  const trips = useMemo(() => allTrips.filter((t) => t.direction === direction), [allTrips, direction]);

  const handleSelectTrip = (trip: Trip) => {
    navigation.navigate('SeatSelection', { trip });
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ErrorScreen message={error} onRetry={handleRetry} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.eyebrow}>{routeInfo?.university ?? ''}</Text>
        <Text style={styles.title}>{routeInfo?.label ?? 'Loading…'}</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, direction === 'to_campus' && styles.tabBtnActive]}
          onPress={() => setDirection('to_campus')}
          accessibilityRole="button"
          accessibilityLabel="To Campus"
          accessibilityState={{ selected: direction === 'to_campus' }}
        >
          <Text style={[styles.tabText, direction === 'to_campus' && styles.tabTextActive]}>
            To Campus
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, direction === 'from_campus' && styles.tabBtnActive]}
          onPress={() => setDirection('from_campus')}
          accessibilityRole="button"
          accessibilityLabel="From Campus"
          accessibilityState={{ selected: direction === 'from_campus' }}
        >
          <Text style={[styles.tabText, direction === 'from_campus' && styles.tabTextActive]}>
            From Campus
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loading} color={colors.accent} />
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TripCard trip={item} onPress={() => handleSelectTrip(item)} />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No trips scheduled for this direction today.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  back: { width: 36, height: 36, justifyContent: 'center', marginBottom: spacing.sm },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.accent,
    marginBottom: 8,
  },
  title: { ...typography.h1 },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.ink },
  tabText: { fontFamily: fonts.bodySemiBold, color: colors.textMuted, fontSize: 13 },
  tabTextActive: { color: colors.white },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  loading: { marginTop: spacing.xl },
  empty: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
