import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, fonts, radius, spacing, typography } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { approveVerification, mockVerification } from '../../state/verification';

type Props = NativeStackScreenProps<RootStackParamList, 'VerificationStatus'>;

const content = {
  pending: {
    icon: 'time-outline' as const,
    iconBg: colors.warningSoft,
    iconColor: colors.warning,
    title: 'Verification pending',
    body: "We're reviewing your student details. This usually takes less than 24 hours.",
  },
  verified: {
    icon: 'checkmark-circle' as const,
    iconBg: colors.confirmedSoft,
    iconColor: colors.confirmed,
    title: "You're verified!",
    body: 'Your student status is confirmed. You can now book KiGoo Campus rides.',
  },
  rejected: {
    icon: 'close-circle' as const,
    iconBg: '#FBE9E7',
    iconColor: colors.danger,
    title: 'Verification rejected',
    body: 'We could not confirm your student details. Please try again with clearer documents.',
  },
};

export default function VerificationStatusScreen({ navigation }: Props) {
  const status = mockVerification.status === 'none' ? 'pending' : mockVerification.status;
  const info = content[status as 'pending' | 'verified' | 'rejected'];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.flex}>
        <View style={styles.content}>
          <View style={[styles.iconBadge, { backgroundColor: info.iconBg }]}>
            <Ionicons name={info.icon} size={30} color={info.iconColor} />
          </View>
          <Text style={styles.title}>{info.title}</Text>
          <Text style={styles.subtitle}>{info.body}</Text>

          {mockVerification.university && (
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>University</Text>
                <Text style={styles.detailValue}>{mockVerification.university}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Student ID</Text>
                <Text style={styles.detailValue}>{mockVerification.studentId}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {status === 'verified' && (
            <PrimaryButton label="Continue to KiGoo Campus" onPress={() => navigation.replace('CampusHub')} />
          )}
          {status === 'rejected' && (
            <PrimaryButton
              label="Try Again"
              onPress={() => navigation.replace('StudentVerification')}
            />
          )}
          {status === 'pending' && (
            <>
              <PrimaryButton label="Back to Home" variant="outline" onPress={() => navigation.goBack()} />
              <TouchableOpacity
                style={styles.devButton}
                onPress={() => {
                  approveVerification();
                  navigation.replace('VerificationStatus');
                }}
              >
                <Text style={styles.devButtonText}>⚙ Simulate Approval (dev only)</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between' },
  content: { alignItems: 'center', marginTop: spacing.xl * 1.5 },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { ...typography.h1, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  detailsCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  detailLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  detailValue: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.text },
  actions: { marginBottom: spacing.lg },
  devButton: { alignItems: 'center', marginTop: spacing.md },
  devButtonText: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
});
