import { useState } from 'react';
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
import { submitVerification } from '../../state/verification';

type Props = NativeStackScreenProps<RootStackParamList, 'StudentVerification'>;

const UNIVERSITIES = ['NSU', 'IUB', 'AIUB'];

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
  const [university, setUniversity] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [studentId, setStudentId] = useState('');
  const [idCardUri, setIdCardUri] = useState<string | null>(null);

  const canSubmit =
    university !== null && department !== null && studentId.trim().length > 0 && idCardUri !== null;

  const handleSubmit = () => {
    submitVerification(university!, studentId.trim());
    navigation.replace('VerificationStatus');
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
            onChange={setIdCardUri}
            hint="PNG, JPG up to 10MB"
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

          <PrimaryButton
            label="Submit Verification"
            disabled={!canSubmit}
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
  button: { marginTop: spacing.lg },
  footer: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
