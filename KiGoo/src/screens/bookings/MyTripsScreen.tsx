import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import BookingCard from './BookingCard';
import { cancelBooking, fetchBookings, type Booking } from '../../state/bookings';
import { useAuth } from '../../state/AuthContext';
import ErrorScreen from '../../components/ErrorScreen';
import { colors, fonts, radius, spacing, typography } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'MyTrips'>;

type Tab = 'upcoming' | 'today' | 'completed' | 'cancelled';

const TABS: { id: Tab; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'today', label: "Today" },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function MyTripsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    fetchBookings(user.id)
      .then(setBookings)
      .catch(() => setError('Could not load your trips. Check your connection and try again.'))
      .finally(() => setLoading(false));
  }, [user]);

  useFocusEffect(reload);

  const handleCancel = async (bookingId: string) => {
    await cancelBooking(bookingId);
    reload();
  };

  const upcoming = bookings.filter((b) => b.status === 'confirmed');
  const data =
    tab === 'upcoming'
      ? upcoming.filter((b) => !b.isToday)
      : tab === 'today'
      ? upcoming.filter((b) => b.isToday)
      : tab === 'completed'
      ? bookings.filter((b) => b.status === 'completed')
      : bookings.filter((b) => b.status === 'cancelled');

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ErrorScreen message={error} onRetry={reload} />
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
        <Text style={styles.eyebrow}>KIGOO CAMPUS</Text>
        <Text style={styles.title}>My Trips</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={TABS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.tabBar}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.tabBtn, tab === item.id && styles.tabBtnActive]}
            onPress={() => setTab(item.id)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: tab === item.id }}
          >
            <Text style={[styles.tabText, tab === item.id && styles.tabTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator style={styles.loading} color={colors.accent} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <BookingCard booking={item} onCancel={() => handleCancel(item.id)} />
          )}
          ListEmptyComponent={<Text style={styles.empty}>No trips here yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  tabBtn: {
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  tabText: { fontFamily: fonts.bodySemiBold, color: colors.textMuted, fontSize: 13 },
  tabTextActive: { color: colors.white },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  loading: { marginTop: spacing.xl },
  empty: { fontFamily: fonts.body, textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});
