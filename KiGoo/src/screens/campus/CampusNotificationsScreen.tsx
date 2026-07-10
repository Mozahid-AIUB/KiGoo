import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, radius, spacing, typography } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CampusNotifications'>;

type NotificationType =
  | 'booking_confirmed'
  | 'trip_reminder'
  | 'bus_arrival'
  | 'schedule_change'
  | 'announcement'
  | 'service_update';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

const ICONS: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  booking_confirmed: 'checkmark-circle',
  trip_reminder: 'time',
  bus_arrival: 'bus',
  schedule_change: 'calendar',
  announcement: 'megaphone',
  service_update: 'sparkles',
};

const ICON_COLORS: Record<NotificationType, string> = {
  booking_confirmed: colors.confirmed,
  trip_reminder: colors.warning,
  bus_arrival: colors.accent,
  schedule_change: colors.danger,
  announcement: colors.accent,
  service_update: colors.textMuted,
};

const notifications: Notification[] = [
  {
    id: 'n1',
    type: 'bus_arrival',
    title: 'Bus arriving in 5 minutes',
    body: 'Bus KG-101 is approaching Mohammadpur Bus Stand.',
    time: '2m ago',
    unread: true,
  },
  {
    id: 'n2',
    type: 'trip_reminder',
    title: 'Trip reminder',
    body: 'Your 5:00 PM trip from AIUB departs in 1 hour.',
    time: '1h ago',
    unread: true,
  },
  {
    id: 'n3',
    type: 'booking_confirmed',
    title: 'Booking confirmed',
    body: 'Seat A4 booked for tomorrow, 9:00 AM to AIUB.',
    time: '3h ago',
    unread: false,
  },
  {
    id: 'n4',
    type: 'schedule_change',
    title: 'Schedule change',
    body: 'The 1:00 PM IUB return trip has moved to 1:30 PM.',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 'n5',
    type: 'announcement',
    title: 'Pilot service now live',
    body: 'Daily trips on the Mohammadpur corridor have started.',
    time: '2 days ago',
    unread: false,
  },
];

export default function CampusNotificationsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.eyebrow}>KIGOO CAMPUS</Text>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={[styles.iconWrap, { backgroundColor: `${ICON_COLORS[item.type]}1A` }]}>
              <Ionicons name={ICONS[item.type]} size={18} color={ICON_COLORS[item.type]} />
            </View>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemBody}>{item.body}</Text>
              <Text style={styles.itemTime}>{item.time}</Text>
            </View>
            {item.unread && <View style={styles.unreadDot} />}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  back: { width: 36, height: 36, justifyContent: 'center', marginBottom: spacing.sm },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.accent,
    marginBottom: 8,
  },
  title: { ...typography.h1, marginBottom: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: { flex: 1 },
  itemTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.text },
  itemBody: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2, lineHeight: 17 },
  itemTime: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 6 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: 4,
  },
  empty: { fontFamily: fonts.body, textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});
