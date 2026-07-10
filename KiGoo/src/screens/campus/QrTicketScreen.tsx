import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PrimaryButton from '../../components/PrimaryButton';
import { routes } from '../home/mockTrips';
import { mockVerification } from '../../state/verification';
import { colors, fonts, radius, shadow, spacing, typography } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'QrTicket'>;

const studentName = 'Mozahid';

export default function QrTicketScreen({ navigation, route }: Props) {
  const { trip, seat, bookingId } = route.params;
  const routeInfo = routes.find((r) => r.id === trip.routeId)!;

  const qrPayload = JSON.stringify({
    studentName,
    bookingId,
    tripId: trip.id,
    busNo: trip.busNo,
    seat,
    departureTime: `${trip.time} · ${trip.date}`,
    verificationStatus: mockVerification.status,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.successBadge}>
          <Ionicons name="checkmark-circle" size={28} color={colors.confirmed} />
        </View>
        <Text style={styles.title}>Booking Confirmed</Text>
        <Text style={styles.subtitle}>Show this QR code to board your bus.</Text>

        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.routeLabel}>{routeInfo.label}</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>CONFIRMED</Text>
            </View>
          </View>

          <View style={styles.qrWrap}>
            <QRCode value={qrPayload} size={168} color={colors.ink} backgroundColor={colors.white} />
          </View>

          <View style={styles.perfLine}>
            <View style={styles.notch} />
            <View style={styles.dashLine} />
            <View style={styles.notch} />
          </View>

          <View style={styles.detailsGrid}>
            <DetailItem label="Student" value={studentName} />
            <DetailItem label="Booking ID" value={bookingId} />
            <DetailItem label="Bus" value={trip.busNo} />
            <DetailItem label="Seat" value={seat} />
            <DetailItem label="Departure" value={trip.time} />
            <DetailItem label="Date" value={trip.date} />
          </View>
        </View>

        <View style={styles.noticeCard}>
          <Ionicons name="qr-code-outline" size={16} color={colors.accent} />
          <Text style={styles.noticeText}>
            This QR will be scanned by staff before boarding. Keep it accessible.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Back to Home"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
        />
      </View>
    </SafeAreaView>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.lg, alignItems: 'center' },
  successBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.confirmedSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { ...typography.h1, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg, textAlign: 'center' },
  ticketCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadow.card,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginBottom: spacing.md,
  },
  routeLabel: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.text },
  statusPill: {
    backgroundColor: colors.confirmedSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusPillText: { fontFamily: fonts.bodySemiBold, fontSize: 9, letterSpacing: 0.5, color: colors.confirmed },
  qrWrap: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
  },
  perfLine: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginVertical: spacing.md,
  },
  notch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.paper,
  },
  dashLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderTopWidth: 1.5,
    borderColor: colors.border,
    marginHorizontal: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'stretch',
    gap: spacing.md,
  },
  detailItem: { width: '45%' },
  detailLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  detailValue: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.text, marginTop: 2 },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
  noticeText: { flex: 1, fontFamily: fonts.body, fontSize: 12, color: colors.text, lineHeight: 17 },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
});
