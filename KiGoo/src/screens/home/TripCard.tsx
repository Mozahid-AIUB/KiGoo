import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, radius, shadow, spacing } from '../../theme/theme';
import type { Trip } from './mockTrips';

export default function TripCard({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const isFull = trip.availableSeats === 0;
  const isLow = trip.availableSeats > 0 && trip.availableSeats <= 3;

  const seatColor = isFull ? colors.textMuted : isLow ? colors.accent : colors.confirmed;
  const seatLabel = isFull ? 'FULL' : isLow ? 'FILLING FAST' : 'AVAILABLE';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} disabled={isFull} style={styles.wrap}>
      <View style={[styles.card, isFull && styles.cardFull]}>
        {/* Main body */}
        <View style={styles.body}>
          <Text style={styles.direction}>
            {trip.direction === 'to_campus' ? 'TO CAMPUS' : 'FROM CAMPUS'}
          </Text>
          <Text style={styles.time}>{trip.time}</Text>
          <Text style={styles.date}>{trip.date}</Text>
          <Text style={styles.route} numberOfLines={1}>Bus {trip.busNo}</Text>
        </View>

        {/* Perforated divider */}
        <View style={styles.perfCol}>
          <View style={styles.notchTop} />
          <View style={styles.dashLine} />
          <View style={styles.notchBottom} />
        </View>

        {/* Stub */}
        <View style={styles.stub}>
          <Text style={[styles.seatStatus, { color: seatColor }]}>{seatLabel}</Text>
          <Text style={styles.seatCount}>
            {isFull ? '—' : trip.availableSeats}
            <Text style={styles.seatOf}>{isFull ? '' : `/${trip.totalSeats}`}</Text>
          </Text>
          <Text style={styles.fare}>৳{trip.fare}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const NOTCH = 14;

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.card,
  },
  cardFull: { opacity: 0.55 },
  body: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  direction: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.accent,
    marginBottom: 6,
  },
  time: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  date: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 1, marginBottom: 8 },
  route: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  perfCol: {
    width: NOTCH * 2,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
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
  dashLine: {
    flex: 1,
    width: 1,
    borderStyle: 'dashed',
    borderLeftWidth: 1.5,
    borderColor: colors.border,
  },
  stub: {
    width: 96,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    paddingLeft: spacing.sm,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  seatStatus: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  seatCount: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  seatOf: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  fare: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.ink, marginTop: 4 },
});
