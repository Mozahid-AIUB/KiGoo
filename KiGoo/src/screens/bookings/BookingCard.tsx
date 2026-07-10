import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, radius, shadow, spacing } from '../../theme/theme';
import type { Booking } from './mockBookings';

const statusColor = {
  confirmed: colors.confirmed,
  completed: colors.textMuted,
  cancelled: colors.danger,
};

const statusLabel = {
  confirmed: 'CONFIRMED',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
};

const NOTCH = 14;

export default function BookingCard({ booking }: { booking: Booking }) {
  const isPast = booking.status !== 'confirmed';

  return (
    <View style={[styles.card, isPast && styles.cardPast]}>
      <View style={styles.body}>
        <Text style={styles.route} numberOfLines={1}>{booking.route}</Text>
        <Text style={styles.time}>{booking.time}</Text>
        <Text style={styles.date}>{booking.date}</Text>
      </View>

      <View style={styles.perfCol}>
        <View style={styles.notchTop} />
        <View style={styles.dashLine} />
        <View style={styles.notchBottom} />
      </View>

      <View style={styles.stub}>
        <Text style={[styles.status, { color: statusColor[booking.status] }]}>
          {statusLabel[booking.status]}
        </Text>
        <Text style={styles.seatNo}>{booking.seatNo}</Text>
        <Text style={styles.stopLabel}>{booking.stop}</Text>
        {booking.status === 'confirmed' && (
          <TouchableOpacity>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadow.card,
  },
  cardPast: { opacity: 0.7 },
  body: { flex: 1, paddingVertical: spacing.md, paddingLeft: spacing.md, paddingRight: spacing.sm },
  route: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text, marginBottom: 6 },
  time: { fontFamily: fonts.display, fontSize: 19, color: colors.ink },
  date: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 1 },
  perfCol: { width: NOTCH * 2, alignItems: 'center', justifyContent: 'space-between' },
  notchTop: {
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: colors.paper,
    marginTop: -NOTCH / 2,
  },
  notchBottom: {
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: colors.paper,
    marginBottom: -NOTCH / 2,
  },
  dashLine: { flex: 1, width: 1, borderStyle: 'dashed', borderLeftWidth: 1.5, borderColor: colors.border },
  stub: {
    width: 104,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    paddingLeft: spacing.sm,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  status: { fontFamily: fonts.bodySemiBold, fontSize: 9, letterSpacing: 0.5, marginBottom: 4 },
  seatNo: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  stopLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 1 },
  cancelText: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.danger, marginTop: 8 },
});
