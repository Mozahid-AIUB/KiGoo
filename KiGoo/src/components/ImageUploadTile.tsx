import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../theme/theme';

type Props = {
  label: string;
  hint?: string;
  uri: string | null;
  onChange: (uri: string) => void;
  aspect?: [number, number];
  icon?: keyof typeof Ionicons.glyphMap;
};

export default function ImageUploadTile({
  label,
  hint,
  uri,
  onChange,
  aspect = [4, 3],
  icon = 'card-outline',
}: Props) {
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      onChange(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.tile} activeOpacity={0.85} onPress={pickImage}>
        {uri ? (
          <Image source={{ uri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name={icon} size={24} color={colors.textMuted} />
            <Text style={styles.placeholderText}>Tap to upload</Text>
          </View>
        )}
        {uri && (
          <View style={styles.retakeBadge}>
            <Ionicons name="camera-reverse-outline" size={14} color={colors.white} />
          </View>
        )}
      </TouchableOpacity>
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.md },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.4, color: colors.textMuted, marginBottom: spacing.sm },
  tile: {
    height: 140,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  placeholderText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textMuted },
  preview: { width: '100%', height: '100%' },
  retakeBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: spacing.xs },
});
