import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../theme/theme';

type Props = {
  onPress?: () => void;
  unread?: boolean;
};

export default function NotificationButton({ onPress, unread = false }: Props) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={unread ? 'Notifications, unread' : 'Notifications'}
      accessibilityHint="Opens your notifications"
    >
      <Ionicons name="notifications-outline" size={20} color={colors.ink} />
      {unread ? <View style={styles.dot} /> : null}
    </TouchableOpacity>
  );
}

const SIZE = 42;

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  dot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: colors.card,
  },
});
