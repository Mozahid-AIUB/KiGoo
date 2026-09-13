import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, fonts, radius, spacing, typography } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { fetchOccupiedSeats } from '../../state/bookings';

type Props = NativeStackScreenProps<RootStackParamList, 'SeatSelection'>;

const SEAT_LETTERS = ['A', 'B', 'C', 'D'];

function seatLayout(totalSeats: number) {
  const rows = Math.ceil(totalSeats / 2);
  return Array.from({ length: rows }, (_, r) => [`${SEAT_LETTERS[r % 4]}${r + 1}L`, `${SEAT_LETTERS[r % 4]}${r + 1}R`]);
}

export default function SeatSelectionScreen({ navigation, route }: Props) {
  const { trip } = route.params;
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOccupiedSeats(trip.id).then((seats) => {
      setTaken(seats);
      setLoading(false);
    });
  }, [trip.id]);

  const layout = useMemo(() => seatLayout(trip.totalSeats), [trip.totalSeats]);

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
        <Text style={styles.eyebrow}>SELECT SEAT</Text>
        <Text style={styles.title}>Bus {trip.busNo}</Text>
        <Text style={styles.subtitle}>{trip.time} · {trip.date}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loading} color={colors.accent} />
      ) : (
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.busShape}>
          <View style={styles.driverRow}>
            <Ionicons name="person-circle-outline" size={22} color={colors.textMuted} />
            <Text style={styles.driverLabel}>DRIVER</Text>
          </View>

          {layout.map((pair, i) => (
            <View key={i} style={styles.seatRow}>
              {pair.map((seat) => {
                const isTaken = taken.has(seat);
                const isSelected = selectedSeat === seat;
                return (
                  <TouchableOpacity
                    key={seat}
                    disabled={isTaken}
                    onPress={() => setSelectedSeat(seat)}
                    style={[
                      styles.seat,
                      isTaken && styles.seatTaken,
                      isSelected && styles.seatSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Seat ${seat}${isTaken ? ', taken' : isSelected ? ', selected' : ', available'}`}
                    accessibilityState={{ disabled: isTaken, selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.seatText,
                        isTaken && styles.seatTextTaken,
                        isSelected && styles.seatTextSelected,
                      ]}
                    >
                      {seat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <View style={styles.aisle} />
            </View>
          ))}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.seat]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.seatSelected]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.seatTaken]} />
            <Text style={styles.legendText}>Taken</Text>
          </View>
        </View>
      </ScrollView>
      )}

      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>
            {selectedSeat ? `Seat ${selectedSeat}` : 'Choose a seat'}
          </Text>
          <Text style={styles.footerFare}>৳{trip.fare}</Text>
        </View>
        <PrimaryButton
          label="Continue"
          disabled={!selectedSeat}
          onPress={() =>
            navigation.navigate('BookingSummary', { trip, seat: selectedSeat! })
          }
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
}

const SEAT_SIZE = 44;

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
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 2 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, alignItems: 'center' },
  loading: { marginTop: spacing.xl },
  busShape: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.md,
    width: '100%',
    maxWidth: 320,
  },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.lg },
  driverLabel: { fontFamily: fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.5, color: colors.textMuted },
  seatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  seat: {
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  seatTaken: { backgroundColor: colors.border, borderColor: colors.border },
  seatText: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.text },
  seatTextSelected: { color: colors.white },
  seatTextTaken: { color: colors.textMuted },
  aisle: { flex: 1 },
  legend: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 16, height: 16, borderRadius: 4 },
  legendText: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  footerInfo: { flex: 1 },
  footerLabel: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.text },
  footerFare: { fontFamily: fonts.display, fontSize: 18, color: colors.ink, marginTop: 2 },
  continueButton: { flex: 1 },
});
