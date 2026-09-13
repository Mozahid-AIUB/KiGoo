import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchBookings, type Booking } from '../../state/bookings';
import { useAuth } from '../../state/AuthContext';
import BookingCard from '../bookings/BookingCard';
import NotificationButton from '../../components/NotificationButton';
import ErrorScreen from '../../components/ErrorScreen';
import { colors, fonts, radius, shadow, spacing, typography } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CampusHub'>;

export default function CampusHubScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = useCallback(() => setRetryKey((k) => k + 1), []);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      fetchBookings(user.id)
        .then(setBookings)
        .catch(() => setError('Could not load your trips. Check your connection and try again.'))
        .finally(() => setIsLoading(false));
    }, [user, retryKey])
  );

  const nextTrip =
    bookings
      .filter((b) => b.status === 'confirmed')
      .sort((a, b) => a.sortAt.getTime() - b.sortAt.getTime())[0] ?? null;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ErrorScreen message={error} onRetry={handleRetry} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={colors.ink} />
          </TouchableOpacity>
          <NotificationButton
            unread
            onPress={() => navigation.navigate('CampusNotifications')}
          />
        </View>

        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Ionicons name="bus" size={22} color={colors.white} />
          </View>
          <View>
            <Text style={styles.eyebrow}>VERIFIED STUDENT</Text>
            <Text style={styles.title}>KiGoo Campus</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.bookCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Routes')}
          accessibilityRole="button"
          accessibilityLabel="Book Shuttle"
          accessibilityHint="Pick a route, seat, and time"
        >
          <View style={styles.bookIconWrap}>
            <Ionicons name="add-circle" size={28} color={colors.white} />
          </View>
          <View style={styles.bookText}>
            <Text style={styles.bookTitle}>Book Shuttle</Text>
            <Text style={styles.bookSubtitle}>Pick a route, seat, and time</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.white} />
        </TouchableOpacity>

        {nextTrip && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NEXT TRIP</Text>
            <BookingCard booking={nextTrip} />
          </View>
        )}

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyTrips')}
            accessibilityRole="button"
            accessibilityLabel="My Trips"
          >
            <Ionicons name="ticket-outline" size={20} color={colors.text} />
            <Text style={styles.menuText}>My Trips</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Plans')}
            accessibilityRole="button"
            accessibilityLabel="My Plan"
          >
            <Ionicons name="card-outline" size={20} color={colors.text} />
            <Text style={styles.menuText}>My Plan</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('PaymentMethods')}
            accessibilityRole="button"
            accessibilityLabel="Payment"
          >
            <Ionicons name="wallet-outline" size={20} color={colors.text} />
            <Text style={styles.menuText}>Payment</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Community')}
            accessibilityRole="button"
            accessibilityLabel="Community"
          >
            <Ionicons name="people-outline" size={20} color={colors.text} />
            <Text style={styles.menuText}>Community</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  back: { width: 36, height: 36, justifyContent: 'center' },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.confirmed,
  },
  title: { ...typography.h1, marginTop: 2 },
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
    ...shadow.card,
  },
  bookIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookText: { flex: 1 },
  bookTitle: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.white },
  bookSubtitle: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionLabel: { ...typography.label, marginBottom: spacing.sm },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  menuText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
});
