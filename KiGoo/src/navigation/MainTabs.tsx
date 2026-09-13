import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import BookPlaceholderScreen from '../screens/home/BookPlaceholderScreen';
import CenterTabButton from './CenterTabButton';
import { colors, fonts } from '../theme/theme';
import { fetchVerification } from '../state/verification';
import { useAuth } from '../state/AuthContext';

export type MainTabParamList = {
  Home: undefined;
  Book: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const icons: Record<
  Exclude<keyof MainTabParamList, 'Book'>,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodySemiBold, fontSize: 11 },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'Book') return null;
          const icon = icons[route.name as Exclude<keyof MainTabParamList, 'Book'>];
          return <Ionicons name={focused ? icon.active : icon.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Book"
        component={BookPlaceholderScreen}
        options={{
          tabBarLabel: () => null,
          tabBarButton: (props) => <CenterTabButton {...props} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: async (e) => {
            e.preventDefault();
            if (!user) return;
            const verification = await fetchVerification(user.id);
            if (verification?.status === 'verified') {
              navigation.getParent()?.navigate('CampusHub');
            } else if (verification?.status === 'pending' || verification?.status === 'rejected') {
              navigation.getParent()?.navigate('VerificationStatus');
            } else {
              navigation.getParent()?.navigate('StudentVerification');
            }
          },
        })}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
