import { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, radius, shadow, spacing, typography } from '../../theme/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../state/AuthContext';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Profile = {
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url: string | null;
};

const menuItems = ['Edit Profile', 'Default Stop', 'Help & Support'] as const;

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      supabase
        .from('profiles')
        .select('first_name, last_name, phone, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => data && setProfile(data));
    }, [user])
  );

  const name = profile ? `${profile.first_name} ${profile.last_name}`.trim() : '';
  const initial = (name || 'K').charAt(0).toUpperCase();
  const phone = profile?.phone || 'No phone number';

  function handleMenuPress(item: (typeof menuItems)[number]) {
    if (item === 'Edit Profile') {
      navigation.navigate('EditProfile');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.card}>
        {profile?.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            style={styles.avatarImage}
            accessibilityLabel="Your profile photo"
          />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}
        <View>
          <Text style={styles.name}>{name || 'Loading…'}</Text>
          <Text style={styles.phone}>{phone}</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={item}
            style={[styles.menuItem, i === menuItems.length - 1 && styles.menuItemLast]}
            onPress={() => handleMenuPress(item)}
            accessibilityRole="button"
            accessibilityLabel={item}
          >
            <Text style={styles.menuText}>{item}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => supabase.auth.signOut()}
        accessibilityRole="button"
        accessibilityLabel="Log out"
        accessibilityHint="Signs you out of KiGoo"
      >
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
