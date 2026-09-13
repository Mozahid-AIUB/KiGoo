import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, fonts, radius } from '../theme/theme';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'filled' | 'outline' | 'inverted';
  style?: ViewStyle;
};

export default function PrimaryButton({ label, onPress, disabled, variant = 'filled', style }: Props) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], disabled && styles.disabled, style]}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
    >
      <Text style={styles[`${variant}Text` as const]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: { backgroundColor: colors.ink },
  outline: { borderWidth: 1.5, borderColor: colors.ink, backgroundColor: 'transparent' },
  inverted: { backgroundColor: colors.white },
  disabled: { opacity: 0.35 },
  filledText: { color: colors.white, fontFamily: fonts.bodySemiBold, fontSize: 15 },
  outlineText: { color: colors.ink, fontFamily: fonts.bodySemiBold, fontSize: 15 },
  invertedText: { color: colors.ink, fontFamily: fonts.bodySemiBold, fontSize: 15 },
});
