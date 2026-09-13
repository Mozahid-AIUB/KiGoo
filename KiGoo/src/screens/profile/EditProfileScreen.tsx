import { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, fonts, radius, spacing, typography } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../state/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

type Gender = 'male' | 'female';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export default function EditProfileScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('first_name, last_name, phone, gender, avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFirstName(data.first_name ?? '');
          setLastName(data.last_name ?? '');
          setPhone((data.phone ?? '').replace(/^\+880/, ''));
          setGender((data.gender as Gender) ?? null);
          setAvatarUrl(data.avatar_url);
        }
        setLoading(false);
      });
  }, [user]);

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0 && phone.trim().length === 11;

  async function handlePickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted || !user) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;

    setAvatarUploading(true);
    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop() ?? 'jpg';
    const path = `${user.id}/avatar.${ext}`;
    const response = await fetch(asset.uri);
    const arrayBuffer = await response.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, arrayBuffer, { contentType: asset.mimeType ?? 'image/jpeg', upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    }
    setAvatarUploading(false);
  }

  async function handleSave() {
    if (!user) return;
    setError(null);
    setSaving(true);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: `+880${phone.trim()}`,
        gender,
        avatar_url: avatarUrl,
      })
      .eq('id', user.id);

    setSaving(false);
    if (updateError) {
      setError('Could not save your changes. Please try again.');
      return;
    }
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={colors.ink} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Edit Profile</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.avatarWrap}
            activeOpacity={0.85}
            onPress={handlePickAvatar}
            disabled={avatarUploading}
            accessibilityRole="button"
            accessibilityLabel="Profile photo"
            accessibilityHint="Opens your photo library to change your profile photo"
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
                accessibilityLabel="Your current profile photo"
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {(firstName || 'K').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Ionicons name={avatarUploading ? 'hourglass-outline' : 'camera-outline'} size={14} color={colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>
            {avatarUploading ? 'Uploading…' : 'Tap to change photo'}
          </Text>

          <View style={styles.nameRow}>
            <View style={[styles.field, styles.nameField]}>
              <Text style={styles.formLabel}>FIRST NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="First name"
                placeholderTextColor={colors.textMuted}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.field, styles.nameField]}>
              <Text style={styles.formLabel}>LAST NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Last name"
                placeholderTextColor={colors.textMuted}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.formLabel}>PHONE NUMBER</Text>
            <View style={styles.phoneRow}>
              <Text style={styles.prefix}>+880</Text>
              <View style={styles.phoneDivider} />
              <TextInput
                style={styles.phoneInput}
                placeholder="1XXXXXXXXX"
                placeholderTextColor={colors.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.formLabel}>GENDER</Text>
            <View style={styles.genderRow}>
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[styles.genderPill, gender === g.value && styles.genderPillActive]}
                  onPress={() => setGender(g.value)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.genderPillText,
                      gender === g.value && styles.genderPillTextActive,
                    ]}
                  >
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.formLabel}>EMAIL</Text>
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyText}>{user?.email}</Text>
              <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
            </View>
            <Text style={styles.hint}>Email can't be changed here.</Text>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
          <PrimaryButton
            label={saving ? 'Saving…' : 'Save Changes'}
            disabled={!isValid || saving || loading}
            onPress={handleSave}
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1, paddingHorizontal: spacing.lg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  back: { width: 36, height: 36, justifyContent: 'center' },
  topBarTitle: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.ink },
  scroll: { paddingTop: spacing.md, paddingBottom: spacing.xl, alignItems: 'center' },
  avatarWrap: { width: 84, height: 84 },
  avatarImage: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.card },
  avatarFallback: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: { color: colors.white, fontFamily: fonts.display, fontSize: 30 },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.paper,
  },
  avatarHint: { ...typography.caption, marginTop: spacing.sm, marginBottom: spacing.lg },
  nameRow: { flexDirection: 'row', gap: spacing.sm, alignSelf: 'stretch' },
  nameField: { flex: 1 },
  field: { marginBottom: spacing.md, alignSelf: 'stretch' },
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
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  prefix: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.text },
  phoneDivider: { width: 1, height: 22, backgroundColor: colors.border, marginHorizontal: spacing.sm },
  phoneInput: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text, height: '100%' },
  genderRow: { flexDirection: 'row', gap: spacing.sm },
  genderPill: {
    flex: 1,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderPillActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  genderPillText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.text },
  genderPillTextActive: { color: colors.white },
  readOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  readOnlyText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.textMuted },
  hint: { ...typography.caption, marginTop: spacing.xs },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    marginBottom: spacing.sm,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  button: { marginTop: spacing.sm, alignSelf: 'stretch' },
});
