import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import BookingCard from './BookingCard';
import { cancelledBookings, pastBookings, upcomingBookings } from './mockBookings';
import { colors, fonts, radius, spacing, typography } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'MyTrips'>;

type Tab = 'upcoming' | 'today' | 'completed' | 'cancelled';

const TABS: { id: Tab; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'today', label: "Today" },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function MyTripsScreen({ navigation }: Props) {
  const [tab, setTab] = useState<Tab>('upcoming');

  const data =
    tab === 'upcoming'
      ? upcomingBookings.filter((b) => !b.isToday)
      : tab === 'today'
      ? upcomingBookings.filter((b) => b.isToday)
      : tab === 'completed'
      ? pastBookings
      : cancelledBookings;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.eyebrow}>KIGOO CAMPUS</Text>
        <Text style={styles.title}>My Trips</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={TABS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.tabBar}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.tabBtn, tab === item.id && styles.tabBtnActive]}
            onPress={() => setTab(item.id)}
          >
            <Text style={[styles.tabText, tab === item.id && styles.tabTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <BookingCard booking={item} />}
        ListEmptyComponent={<Text style={styles.empty}>No trips here yet.</Text>}
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
  title: { ...typography.h1 },
  tabBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  tabBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtnActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  tabText: { fontFamily: fonts.bodySemiBold, color: colors.textMuted, fontSize: 13 },
  tabTextActive: { color: colors.white },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  empty: { fontFamily: fonts.body, textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});
