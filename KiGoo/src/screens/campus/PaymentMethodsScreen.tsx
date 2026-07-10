import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, radius, shadow, spacing, typography } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentMethods'>;

type Method = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
};

const methods: Method[] = [
  {
    id: 'cash',
    title: 'Cash on Boarding',
    subtitle: 'Pay the driver directly when you board',
    icon: 'cash-outline',
    active: true,
  },
  {
    id: 'bkash',
    title: 'bKash',
    subtitle: 'Pay online, seat confirms instantly',
    icon: 'phone-portrait-outline',
    active: false,
  },
  {
    id: 'nagad',
    title: 'Nagad',
    subtitle: 'Pay online, seat confirms instantly',
    icon: 'phone-portrait-outline',
    active: false,
  },
  {
    id: 'card',
    title: 'Card',
    subtitle: 'Debit or credit card',
    icon: 'card-outline',
    active: false,
  },
];

export default function PaymentMethodsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.eyebrow}>KIGOO CAMPUS</Text>
        <Text style={styles.title}>Payment</Text>
        <Text style={styles.subtitle}>How you pay for your rides.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {methods.map((method) => (
          <View
            key={method.id}
            style={[styles.methodCard, !method.active && styles.methodCardLocked]}
          >
            <View style={[styles.iconWrap, method.active && styles.iconWrapActive]}>
              <Ionicons
                name={method.icon}
                size={20}
                color={method.active ? colors.white : colors.textMuted}
              />
            </View>
            <View style={styles.methodText}>
              <Text style={[styles.methodTitle, !method.active && styles.methodTitleLocked]}>
                {method.title}
              </Text>
              <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
            </View>
            {method.active ? (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            ) : (
              <View style={styles.soonBadge}>
                <Text style={styles.soonBadgeText}>SOON</Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.noticeCard}>
          <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
          <Text style={styles.noticeText}>
            Online payment is coming soon. For now, all bookings are confirmed instantly and fare is paid in cash when boarding.
          </Text>
        </View>
      </ScrollView>
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
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 4 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  methodCardLocked: { opacity: 0.6, shadowOpacity: 0 },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: colors.confirmed },
  methodText: { flex: 1 },
  methodTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.text },
  methodTitleLocked: { color: colors.textMuted },
  methodSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  activeBadge: {
    backgroundColor: colors.confirmedSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeText: { fontFamily: fonts.bodySemiBold, fontSize: 9, letterSpacing: 0.5, color: colors.confirmed },
  soonBadge: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  soonBadgeText: { fontFamily: fonts.bodySemiBold, fontSize: 9, letterSpacing: 0.5, color: colors.textMuted },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  noticeText: { flex: 1, fontFamily: fonts.body, fontSize: 12, color: colors.text, lineHeight: 17 },
});
