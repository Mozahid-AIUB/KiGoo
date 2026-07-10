import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import TripCard from '../home/TripCard';
import { routes, tripsForRoute, type Trip } from '../home/mockTrips';
import { colors, fonts, radius, spacing, typography } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'TripSelection'>;

type Direction = 'to_campus' | 'from_campus';

export default function TripSelectionScreen({ navigation, route }: Props) {
  const { routeId } = route.params;
  const [direction, setDirection] = useState<Direction>('to_campus');

  const routeInfo = routes.find((r) => r.id === routeId)!;
  const trips = useMemo(
    () => tripsForRoute(routeId).filter((t) => t.direction === direction),
    [routeId, direction]
  );

  const handleSelectTrip = (trip: Trip) => {
    navigation.navigate('SeatSelection', { trip });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.eyebrow}>{routeInfo.university}</Text>
        <Text style={styles.title}>{routeInfo.label}</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, direction === 'to_campus' && styles.tabBtnActive]}
          onPress={() => setDirection('to_campus')}
        >
          <Text style={[styles.tabText, direction === 'to_campus' && styles.tabTextActive]}>
            To Campus
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, direction === 'from_campus' && styles.tabBtnActive]}
          onPress={() => setDirection('from_campus')}
        >
          <Text style={[styles.tabText, direction === 'from_campus' && styles.tabTextActive]}>
            From Campus
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TripCard trip={item} onPress={() => handleSelectTrip(item)} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No trips scheduled for this direction today.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  back: { width: 36, height: 36, justifyContent: 'center', marginBottom: spacing.sm },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.accent,
    marginBottom: 8,
  },
  title: { ...typography.h1 },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.ink },
  tabText: { fontFamily: fonts.bodySemiBold, color: colors.textMuted, fontSize: 13 },
  tabTextActive: { color: colors.white },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  empty: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
