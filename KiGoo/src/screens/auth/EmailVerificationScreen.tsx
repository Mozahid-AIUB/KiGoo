import { useRef, useState } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'EmailVerification'>;

const CODE_LENGTH = 6;

export default function EmailVerificationScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const isValid = code.length === CODE_LENGTH;
  const digits = Array.from({ length: CODE_LENGTH }, (_, i) => code[i] ?? '');

  async function handleVerify() {
    setError(null);
    setSubmitting(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    });
    setSubmitting(false);
    if (verifyError) {
      setError('Invalid or expired code. Please try again.');
      return;
    }
    // Success: signUp's session is now confirmed; onAuthStateChange fires,
    // RootNavigator swaps to MainTabs on its own.
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.iconBadge}>
            <Ionicons name="mail-unread-outline" size={28} color={colors.accent} />
          </View>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code we sent to your email address.
          </Text>

          <TouchableOpacity
            style={styles.codeRow}
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            accessibilityRole="button"
            accessibilityLabel={`Verification code, ${code.length} of ${CODE_LENGTH} digits entered`}
            accessibilityHint="Focuses the code input"
          >
            {digits.map((digit, i) => (
              <View
                key={i}
                style={[
                  styles.codeBox,
                  digit ? styles.codeBoxFilled : null,
                  code.length === i && styles.codeBoxActive,
                ]}
              >
                <Text style={styles.codeDigit}>{digit}</Text>
              </View>
            ))}
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={code}
            onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH))}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            autoFocus
          />

          <TouchableOpacity
            disabled={resending}
            onPress={async () => {
              setResending(true);
              setError(null);
              const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
              setResending(false);
              if (resendError) {
                setError('Could not resend code. Please try again shortly.');
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Resend verification code"
          >
            <Text style={styles.resend}>{resending ? 'Sending…' : "Didn't get a code? Resend"}</Text>
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <PrimaryButton
          label={submitting ? 'Verifying…' : 'Verify Email'}
          disabled={!isValid || submitting}
          onPress={handleVerify}
          style={styles.button}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const BOX_SIZE = 46;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between' },
  content: { alignItems: 'center', marginTop: spacing.xl * 1.5 },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.accentSoft,
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
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  codeRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  codeBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxFilled: { borderColor: colors.accent },
  codeBoxActive: { borderColor: colors.accent },
  codeDigit: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  hiddenInput: { position: 'absolute', opacity: 0, height: 0, width: 0 },
  resend: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.accent,
    marginTop: spacing.lg,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  button: { marginBottom: spacing.lg },
});
