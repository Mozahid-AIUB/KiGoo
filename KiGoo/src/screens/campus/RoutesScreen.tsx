import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { routes, tripsForRoute } from '../home/mockTrips';
import { colors, fonts, radius, shadow, spacing, typography } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Routes'>;

export default function RoutesScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.eyebrow}>KIGOO CAMPUS</Text>
        <Text style={styles.title}>Choose your route</Text>
        <Text style={styles.subtitle}>Select the university corridor you commute on.</Text>
      </View>

      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const availableToday = tripsForRoute(item.id).reduce(
            (sum, t) => sum + t.availableSeats,
            0
          );
          return (
            <TouchableOpacity
              style={styles.routeCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('TripSelection', { routeId: item.id })}
            >
              <View style={styles.routeIconWrap}>
                <Ionicons name="school-outline" size={22} color={colors.white} />
              </View>
              <View style={styles.routeText}>
                <Text style={styles.routeLabel}>{item.label}</Text>
                <Text style={styles.routeMeta}>{availableToday} seats open today</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
  back: { width: 36, height: 36, justifyContent: 'center', marginBottom: spacing.sm },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.accent,
    marginBottom: 8,
  },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 4 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  routeIconWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  routeText: { flex: 1 },
  routeLabel: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.text },
  routeMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
