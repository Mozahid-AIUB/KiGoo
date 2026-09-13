import { useEffect, useState } from 'react';
import {
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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PrimaryButton from '../../components/PrimaryButton';
import ImageUploadTile from '../../components/ImageUploadTile';
import SearchableDropdown from '../../components/SearchableDropdown';
import { colors, fonts, spacing, typography } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { fetchVerification, submitVerification, uploadIdCard } from '../../state/verification';
import { useAuth } from '../../state/AuthContext';
import { extractIdCardFields } from '../../lib/idCardOcr';

type Props = NativeStackScreenProps<RootStackParamList, 'StudentVerification'>;

const UNIVERSITIES = ['NSU', 'IUB', 'AIUB'];

const UNIVERSITY_ALIASES: Record<string, string> = {
  'north south university': 'NSU',
  'independent university, bangladesh': 'IUB',
  'independent university bangladesh': 'IUB',
  'ahsanullah university of science and technology': 'AIUB',
  'american international university-bangladesh': 'AIUB',
  'american international university bangladesh': 'AIUB',
};
const OCR_UNIVERSITY_NEEDLES = [...UNIVERSITIES, ...Object.keys(UNIVERSITY_ALIASES)];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electrical & Electronic Engineering',
  'Civil Engineering',
  'Business Administration (BBA)',
  'Economics',
  'English',
  'Pharmacy',
  'Architecture',
  'Environmental Science',
  'Mathematics & Physics',
  'Media & Journalism',
  'Public Health',
];

export default function StudentVerificationScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [existingId, setExistingId] = useState<string | undefined>(undefined);
  const [university, setUniversity] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [studentId, setStudentId] = useState('');
  const [idCardUri, setIdCardUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchVerification(user.id).then((v) => {
      if (!v) return;
      setExistingId(v.id);
      setUniversity(v.university);
      setDepartment(v.department);
      setStudentId(v.student_id ?? '');
      setIdCardUri(v.id_card_url);
    });
  }, [user]);

  const canSubmit =
    university !== null && department !== null && studentId.trim().length > 0 && idCardUri !== null;

  const handleIdCardPicked = async (uri: string) => {
    setIdCardUri(uri);
    setScanning(true);
    const extracted = await extractIdCardFields(uri, OCR_UNIVERSITY_NEEDLES, DEPARTMENTS);
    setScanning(false);

    if (extracted.studentId && !studentId.trim()) {
      setStudentId(extracted.studentId);
    }
    if (extracted.university && !university) {
      const resolved = UNIVERSITY_ALIASES[extracted.university.toLowerCase()] ?? extracted.university;
      if (UNIVERSITIES.includes(resolved)) setUniversity(resolved);
    }
    if (extracted.department && !department) {
      setDepartment(extracted.department);
    }
  };

  const handleSubmit = async () => {
    if (!user || !university || !department) return;
    setError(null);
    setSubmitting(true);

    try {
      const idCardUrl = idCardUri!.startsWith('http')
        ? idCardUri!
        : await uploadIdCard(user.id, idCardUri!);

      const { error: submitError } = await submitVerification({
        userId: user.id,
        university,
        department,
        studentId: studentId.trim(),
        idCardUrl,
        existingId,
      });
      if (submitError) throw submitError;
      navigation.replace('VerificationStatus');
    } catch {
      setError('Could not submit verification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={colors.ink} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconBadge}>
            <Ionicons name="shield-checkmark" size={26} color={colors.white} />
          </View>
          <Text style={styles.title}>Student Verification</Text>
          <Text style={styles.subtitle}>
            Verify your student identity to access all features.
          </Text>

          <ImageUploadTile
            label="STUDENT ID CARD"
            icon="image-outline"
            uri={idCardUri}
            onChange={handleIdCardPicked}
            hint={scanning ? 'Scanning card…' : 'PNG, JPG up to 10MB'}
          />

          <SearchableDropdown
            label="UNIVERSITY"
            placeholder="Search your university..."
            value={university}
            options={UNIVERSITIES}
            onChange={setUniversity}
            icon="business-outline"
          />

          <SearchableDropdown
            label="DEPARTMENT"
            placeholder="Search your department..."
            value={department}
            options={DEPARTMENTS}
            onChange={setDepartment}
            icon="book-outline"
          />

          <View style={styles.field}>
            <Text style={styles.label}>STUDENT ID NUMBER</Text>
            <View style={styles.inputRow}>
              <Ionicons name="card-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 2024-1-60-001"
                placeholderTextColor={colors.textMuted}
                value={studentId}
                onChangeText={setStudentId}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
          <PrimaryButton
            label={submitting ? 'Submitting…' : existingId ? 'Resubmit Verification' : 'Submit Verification'}
            disabled={!canSubmit || submitting}
            onPress={handleSubmit}
            style={styles.button}
          />

          <Text style={styles.footer}>
            By submitting, you agree to our verification process. Your data is secure.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1, paddingHorizontal: spacing.lg },
  topBar: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  back: { width: 36, height: 36, justifyContent: 'center' },
  scroll: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  field: { marginBottom: spacing.md },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.4, color: colors.textMuted, marginBottom: spacing.sm },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 52,
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  errorText: { color: colors.danger, fontSize: 13, fontFamily: fonts.bodyMedium, marginBottom: spacing.sm, textAlign: 'center' },
  button: { marginTop: spacing.lg },
  footer: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
