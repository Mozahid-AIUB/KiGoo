import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import NotificationButton from '../../components/NotificationButton';
import AnnouncementSlider, { type Announcement } from '../../components/AnnouncementSlider';
import { colors, fonts, radius, shadow, spacing, typography } from '../../theme/theme';
import type { MainTabParamList } from '../../navigation/MainTabs';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { mockVerification } from '../../state/verification';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const studentName = 'Mozahid';

type Spotlight = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
};

const spotlights: Spotlight[] = [
  { id: 's1', title: 'Verified Students Only', icon: 'shield-checkmark', bg: colors.ink },
  { id: 's2', title: 'Secure QR Boarding', icon: 'qr-code', bg: colors.accent },
  { id: 's3', title: 'New Routes Coming', icon: 'map', bg: '#3D3170' },
  { id: 's4', title: 'Refer a Friend', icon: 'people', bg: '#5B4FC7' },
];

const announcements: Announcement[] = [
  {
    id: 'a1',
    title: 'Pilot service now live',
    body: 'Daily trips on the Mohammadpur corridor. Book before seats fill up.',
    mediaType: 'image',
    bg: colors.ink,
  },
  {
    id: 'a2',
    title: 'Secure QR boarding',
    body: 'Every booking now comes with a scannable QR ticket.',
    mediaType: 'video',
    bg: colors.accent,
  },
];

export default function HomeScreen({ navigation }: Props) {
  const openCampus = () => {
    if (mockVerification.status === 'verified') {
      navigation.navigate('CampusHub');
    } else if (mockVerification.status === 'pending' || mockVerification.status === 'rejected') {
      navigation.navigate('VerificationStatus');
    } else {
      navigation.navigate('StudentVerification');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Ionicons name="bus" size={16} color={colors.white} />
            </View>
            <Text style={styles.brandWordmark}>KiGoo</Text>
          </View>
          <NotificationButton unread onPress={() => {}} />
        </View>

        <Text style={styles.greeting}>Hi, {studentName} 👋</Text>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.campusBanner}
            activeOpacity={0.9}
            onPress={openCampus}
          >
            <View style={styles.campusBannerTop}>
              <View style={styles.campusIconWrap}>
                <Ionicons name="bus" size={26} color={colors.white} />
              </View>
              <View style={styles.campusBadge}>
                <Text style={styles.campusBadgeText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.campusTitle}>KiGoo Campus</Text>
            <Text style={styles.campusSubtitle}>Mohammadpur ↔ NSU / IUB / AIUB</Text>
            <View style={styles.campusCta}>
              <Text style={styles.campusCtaText}>Book a seat</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MORE SERVICES</Text>
          <View style={styles.comingSoonCard}>
            <Text style={styles.comingSoonText}>Services will be added here.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ANNOUNCEMENTS</Text>
          <AnnouncementSlider items={announcements} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SPOTLIGHT</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.spotlightRow}
          >
            {spotlights.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.spotlightCard, { backgroundColor: item.bg }]}
                activeOpacity={0.9}
              >
                <Ionicons name={item.icon} size={22} color={colors.white} />
                <Text style={styles.spotlightTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>COMMUNITY</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Community')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.communityRow}>
            <TouchableOpacity
              style={styles.communityPill}
              onPress={() => navigation.navigate('Community')}
            >
              <Ionicons name="logo-whatsapp" size={16} color={colors.confirmed} />
              <Text style={styles.communityText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.communityPill}
              onPress={() => navigation.navigate('Community')}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.accent} />
              <Text style={styles.communityText}>Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  scroll: { paddingBottom: spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandWordmark: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  greeting: {
    ...typography.h1,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAll: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  campusBanner: {
    backgroundColor: colors.accent,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadow.card,
  },
  campusBannerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  campusIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  campusTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.white,
    marginTop: spacing.md,
  },
  campusSubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  campusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  campusBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 0.5,
    color: colors.white,
  },
  campusCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.lg,
  },
  campusCtaText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.white },
  comingSoonCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonText: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  spotlightRow: { gap: spacing.sm, paddingRight: spacing.lg },
  spotlightCard: {
    width: 128,
    height: 96,
    borderRadius: radius.lg,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  spotlightTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.white,
    lineHeight: 15,
  },
  communityRow: { flexDirection: 'row', gap: spacing.sm },
  communityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  communityText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.text },
});
