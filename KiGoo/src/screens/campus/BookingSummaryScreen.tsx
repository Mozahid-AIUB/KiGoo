import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PrimaryButton from '../../components/PrimaryButton';
import { fetchRoutes, type Route } from '../home/mockTrips';
import { createBooking } from '../../state/bookings';
import { colors, fonts, radius, shadow, spacing, typography } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingSummary'>;

export default function BookingSummaryScreen({ navigation, route }: Props) {
  const { trip, seat } = route.params;
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<Route | null>(null);

  useEffect(() => {
    fetchRoutes().then((routes) => {
      setRouteInfo(routes.find((r) => r.id === trip.routeId) ?? null);
    });
  }, [trip.routeId]);

  const handleConfirm = async () => {
    setError(null);
    setConfirming(true);
    const { data: booking, error: bookingError } = await createBooking(trip.id, seat);
    setConfirming(false);

    if (bookingError || !booking) {
      setError(
        bookingError?.message.includes('full')
          ? 'This trip just filled up. Please pick another seat or trip.'
          : bookingError?.message.includes('already')
          ? 'That seat was just taken. Please pick another.'
          : 'Could not confirm your booking. Please try again.'
      );
      return;
    }
    navigation.replace('QrTicket', { trip, seat, bookingId: booking.booking_code });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
        <Text style={styles.eyebrow}>REVIEW & CONFIRM</Text>
        <Text style={styles.title}>Booking Summary</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="git-branch-outline" size={18} color={colors.textMuted} />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Route</Text>
              <Text style={styles.rowValue}>{routeInfo?.label ?? '—'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Ionicons name="location-outline" size={18} color={colors.textMuted} />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Pickup Point</Text>
              <Text style={styles.rowValue}>{routeInfo?.pickupPoint ?? '—'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Ionicons name="time-outline" size={18} color={colors.textMuted} />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Departure Time</Text>
              <Text style={styles.rowValue}>{trip.time} · {trip.date}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Ionicons name="grid-outline" size={18} color={colors.textMuted} />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Seat Number</Text>
              <Text style={styles.rowValue}>{seat}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Ionicons name="bus-outline" size={18} color={colors.textMuted} />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Bus</Text>
              <Text style={styles.rowValue}>{trip.busNo}</Text>
            </View>
          </View>
        </View>

        <View style={styles.fareCard}>
          <Text style={styles.fareLabel}>Total Fare</Text>
          <Text style={styles.fareValue}>৳{trip.fare}</Text>
        </View>

        <View style={styles.noticeCard}>
          <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
          <Text style={styles.noticeText}>
            Pay the fare in cash to the driver when boarding. No online payment needed for now.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <PrimaryButton
          label={confirming ? 'Confirming…' : 'Confirm Booking'}
          disabled={confirming}
          onPress={handleConfirm}
        />
      </View>
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
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadow.card,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  rowText: { flex: 1 },
  rowLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  rowValue: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.text, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  fareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  fareLabel: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.white },
  fareValue: { fontFamily: fonts.display, fontSize: 22, color: colors.white },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  noticeText: { flex: 1, fontFamily: fonts.body, fontSize: 12, color: colors.text, lineHeight: 17 },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
