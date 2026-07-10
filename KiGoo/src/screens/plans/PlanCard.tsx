import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, fonts, radius, shadow, spacing } from '../../theme/theme';
import type { Plan } from './mockPlans';

export default function PlanCard({ plan }: { plan: Plan }) {
  const dark = plan.highlighted;

  return (
    <View style={[styles.card, dark ? styles.cardDark : styles.cardLight]}>
      {dark && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>MOST CHOSEN</Text>
        </View>
      )}

      <Text style={[styles.name, dark && styles.textOnDark]}>{plan.name}</Text>
      <Text style={[styles.duration, dark && styles.mutedOnDark]}>
        {plan.durationLabel} · unlimited rides · max 2/day
      </Text>

      <View style={styles.priceRow}>
        <Text style={[styles.price, dark && styles.textOnDark]}>৳{plan.price}</Text>
        <Text style={[styles.perDay, dark && styles.mutedOnDark]}>৳{plan.perDay}/day</Text>
      </View>

      <PrimaryButton
        label="Buy Plan"
        variant={dark ? 'inverted' : 'outline'}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  cardLight: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDark: {
    backgroundColor: colors.ink,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginBottom: spacing.sm,
  },
  badgeText: { fontFamily: fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.5, color: colors.white },
  name: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  duration: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 4, marginBottom: spacing.md },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, marginBottom: spacing.md },
  price: { fontFamily: fonts.display, fontSize: 28, color: colors.ink },
  perDay: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  button: { marginTop: 4 },
  textOnDark: { color: colors.white },
  mutedOnDark: { color: '#B9AFE8' },
});
