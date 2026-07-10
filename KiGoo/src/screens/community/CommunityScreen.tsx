import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, radius, shadow, spacing, typography } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Community'>;

type CommunityLink = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  url: string;
};

const links: CommunityLink[] = [
  {
    id: 'whatsapp',
    title: 'WhatsApp Community',
    subtitle: 'Join daily trip updates and chat',
    icon: 'logo-whatsapp',
    iconColor: '#25D366',
    iconBg: '#E7F9EE',
    url: 'https://wa.me/8801000000000',
  },
  {
    id: 'facebook',
    title: 'Facebook Page',
    subtitle: 'Follow announcements and offers',
    icon: 'logo-facebook',
    iconColor: '#1877F2',
    iconBg: '#E8F1FE',
    url: 'https://facebook.com/kigoo',
  },
  {
    id: 'instagram',
    title: 'Instagram',
    subtitle: 'Behind the scenes at KiGoo',
    icon: 'logo-instagram',
    iconColor: '#E1306C',
    iconBg: '#FDE8EF',
    url: 'https://instagram.com/kigoo',
  },
];

const actions: CommunityLink[] = [
  {
    id: 'feedback',
    title: 'Feedback Form',
    subtitle: 'Tell us what to improve',
    icon: 'chatbubble-ellipses-outline',
    iconColor: colors.accent,
    iconBg: colors.accentSoft,
    url: 'https://forms.gle/kigoo-feedback',
  },
  {
    id: 'support',
    title: 'Support',
    subtitle: 'Get help with a booking or issue',
    icon: 'help-buoy-outline',
    iconColor: colors.warning,
    iconBg: colors.warningSoft,
    url: 'https://wa.me/8801000000000',
  },
];

export default function CommunityScreen({ navigation }: Props) {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.eyebrow}>STAY CONNECTED</Text>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>Join the conversation and get help when you need it.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>FOLLOW US</Text>
        {links.map((link) => (
          <TouchableOpacity
            key={link.id}
            style={styles.linkCard}
            activeOpacity={0.85}
            onPress={() => openLink(link.url)}
          >
            <View style={[styles.iconWrap, { backgroundColor: link.iconBg }]}>
              <Ionicons name={link.icon} size={20} color={link.iconColor} />
            </View>
            <View style={styles.linkText}>
              <Text style={styles.linkTitle}>{link.title}</Text>
              <Text style={styles.linkSubtitle}>{link.subtitle}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionLabel, styles.secondSection]}>GET HELP</Text>
        {actions.map((link) => (
          <TouchableOpacity
            key={link.id}
            style={styles.linkCard}
            activeOpacity={0.85}
            onPress={() => openLink(link.url)}
          >
            <View style={[styles.iconWrap, { backgroundColor: link.iconBg }]}>
              <Ionicons name={link.icon} size={20} color={link.iconColor} />
            </View>
            <View style={styles.linkText}>
              <Text style={styles.linkTitle}>{link.title}</Text>
              <Text style={styles.linkSubtitle}>{link.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 4 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
  sectionLabel: { ...typography.label, marginBottom: spacing.sm },
  secondSection: { marginTop: spacing.lg },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: { flex: 1 },
  linkTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.text },
  linkSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
