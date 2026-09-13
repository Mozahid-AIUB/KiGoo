import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, fonts, radius, spacing, typography } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { supabase } from '../../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isValid = email.includes('@');

  async function handleReset() {
    setError(null);
    setSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    setSubmitting(false);
    if (resetError) {
      setError('Could not send reset link. Please check the email and try again.');
      return;
    }
    setSent(true);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>

        {!sent ? (
          <>
            <View style={styles.iconBadge}>
              <Ionicons name="key-outline" size={24} color={colors.accent} />
            </View>
            <Text style={styles.title}>Forgot password?</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a link to reset your password.
            </Text>

            <Text style={styles.formLabel}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {error && <Text style={styles.errorText}>{error}</Text>}
            <PrimaryButton
              label={submitting ? 'Sending…' : 'Send Reset Link'}
              disabled={!isValid || submitting}
              onPress={handleReset}
              style={styles.button}
            />
          </>
        ) : (
          <View style={styles.successBlock}>
            <View style={[styles.iconBadge, styles.successBadge]}>
              <Ionicons name="checkmark" size={26} color={colors.confirmed} />
            </View>
            <Text style={styles.title}>Check your inbox</Text>
            <Text style={styles.subtitle}>
              We've sent a password reset link to {email || 'your email'}.
            </Text>
            <PrimaryButton
              label="Back to Login"
              onPress={() => navigation.navigate('Login')}
              style={styles.button}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1, paddingHorizontal: spacing.lg },
  back: { marginTop: spacing.md, width: 36, height: 36, justifyContent: 'center' },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  successBadge: { backgroundColor: colors.confirmedSoft },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  formLabel: { ...typography.label, marginBottom: spacing.sm },
  input: {
    height: 52,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
  },
  button: { marginTop: spacing.lg },
  errorText: { color: colors.danger, fontSize: 13, fontFamily: fonts.bodyMedium, marginTop: spacing.sm, textAlign: 'center' },
  successBlock: { marginTop: spacing.xl },
});
