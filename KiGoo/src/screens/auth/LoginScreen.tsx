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
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, fonts, radius, spacing, typography } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { supabase } from '../../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'Incorrect email or password.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Please verify your email before logging in.';
  }
  return 'Something went wrong. Please try again.';
}

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const isValid = email.includes('@') && password.length >= 6;

  async function handleLogin() {
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError) {
      setError(mapAuthError(signInError.message));
    }
    // On success, AuthContext's onAuthStateChange updates session automatically;
    // RootNavigator swaps to MainTabs on its own — no manual navigation here.
  }

  async function handleGoogleLogin() {
    setError(null);
    setGoogleSubmitting(true);
    const redirectTo = AuthSession.makeRedirectUri();
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (oauthError || !data.url) {
      setGoogleSubmitting(false);
      setError('Could not start Google sign-in. Please try again.');
      return;
    }
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    setGoogleSubmitting(false);
    if (result.type !== 'success') {
      return; // user cancelled — no error needed
    }
    // Supabase exchanges the code and onAuthStateChange fires automatically
    // once the session lands in storage; RootNavigator swaps to MainTabs.
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.brandBlock}>
          <View style={styles.badge}>
            <Ionicons name="bus" size={24} color={colors.white} />
          </View>
          <Text style={styles.wordmark}>KiGoo</Text>
          <Text style={styles.tagline}>Campus rides, sorted.</Text>
        </View>

        <View style={styles.formBlock}>
          <TouchableOpacity
            style={styles.googleButton}
            activeOpacity={0.85}
            disabled={googleSubmitting}
            onPress={handleGoogleLogin}
          >
            <Ionicons name="logo-google" size={18} color={colors.text} />
            <Text style={styles.googleButtonText}>
              {googleSubmitting ? 'Opening Google…' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or log in with email</Text>
            <View style={styles.orLine} />
          </View>

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

          <Text style={[styles.formLabel, styles.passwordLabel]}>PASSWORD</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Your password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotRow}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {error && <Text style={styles.errorText}>{error}</Text>}
          <PrimaryButton
            label={submitting ? 'Logging in…' : 'Log In'}
            disabled={!isValid || submitting}
            onPress={handleLogin}
            style={styles.button}
          />
        </View>

        <View style={styles.footerBlock}>
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>New to KiGoo? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signupLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.footer}>
            By continuing, you agree to KiGoo's Terms & Privacy Policy.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between' },
  brandBlock: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.lg },
  badge: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  wordmark: { fontFamily: fonts.display, fontSize: 26, color: colors.ink },
  tagline: { ...typography.body, color: colors.textMuted, marginTop: 2 },
  formBlock: { marginTop: spacing.sm },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  googleButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.text },
  orRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.md },
  orLine: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { ...typography.caption, marginHorizontal: spacing.sm },
  formLabel: { ...typography.label, marginBottom: spacing.sm },
  passwordLabel: { marginTop: spacing.md },
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
  },
  forgotRow: { alignItems: 'flex-end', marginTop: spacing.sm },
  forgotText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.textMuted },
  button: { marginTop: spacing.lg },
  errorText: { color: colors.danger, fontSize: 13, fontFamily: fonts.bodyMedium, marginBottom: spacing.sm, textAlign: 'center' },
  footerBlock: { marginBottom: spacing.lg },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.md },
  signupText: { ...typography.body, color: colors.textMuted },
  signupLink: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.accent },
  footer: {
    ...typography.caption,
    textAlign: 'center',
  },
});
