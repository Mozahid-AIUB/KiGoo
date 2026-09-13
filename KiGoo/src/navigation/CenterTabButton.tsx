import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { colors, fonts, shadow } from '../theme/theme';

export default function CenterTabButton({ onPress }: BottomTabBarButtonProps) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={(e) => onPress?.(e)}
        accessibilityRole="button"
        accessibilityLabel="Book a shuttle"
        accessibilityHint="Opens the campus booking flow"
      >
        <Ionicons name="bus" size={22} color={colors.white} />
      </TouchableOpacity>
      <Text style={styles.label}>Book</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.card,
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  label: {
    marginTop: 4,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.accent,
  },
});
