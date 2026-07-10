import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme/theme';

type Tone = 'ink' | 'confirmed' | 'warning' | 'neutral' | 'accent';

const toneStyles: Record<Tone, { bg: string; fg: string }> = {
  ink: { bg: '#E9E7F5', fg: colors.ink },
  confirmed: { bg: colors.confirmedSoft, fg: colors.confirmed },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  neutral: { bg: colors.border, fg: colors.textMuted },
  accent: { bg: colors.accentSoft, fg: colors.accent },
};

export default function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const t = toneStyles[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { fontFamily: fonts.bodySemiBold, fontSize: 11 },
});
