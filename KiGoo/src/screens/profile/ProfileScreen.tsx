import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, shadow, spacing, typography } from '../../theme/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../state/AuthContext';

const menuItems = ['Edit Profile', 'Default Stop', 'Help & Support'];

export default function ProfileScreen() {
  const { user } = useAuth();
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const name = (user?.user_metadata?.full_name as string | undefined) ?? 'Mozahid';
  const initial = name.charAt(0).toUpperCase();
  const phone = (user?.user_metadata?.phone as string | undefined) ?? 'No phone number';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.card}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.phone}>{phone}</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={item}
            style={[styles.menuItem, i === menuItems.length - 1 && styles.menuItemLast]}
          >
            <Text style={styles.menuText}>{item}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: spacing.lg },
  header: { paddingTop: spacing.md, paddingBottom: spacing.sm },
  eyebrow: { fontFamily: fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.8, color: colors.accent, marginBottom: 8 },
  title: { ...typography.h1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
    ...shadow.card,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: colors.white, fontFamily: fonts.display, fontSize: 20 },
  avatarImage: { width: 52, height: 52, borderRadius: 26, marginRight: spacing.md },
  name: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.text },
  phone: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  menu: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  chevron: { fontSize: 18, color: colors.textMuted },
  logoutBtn: { marginTop: spacing.lg, alignItems: 'center', paddingVertical: spacing.md },
  logoutText: { fontFamily: fonts.bodySemiBold, color: colors.danger, fontSize: 14 },
});
