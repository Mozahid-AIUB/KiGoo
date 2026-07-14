import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import MainTabs from './MainTabs';
import CampusHubScreen from '../screens/campus/CampusHubScreen';
import RoutesScreen from '../screens/campus/RoutesScreen';
import TripSelectionScreen from '../screens/campus/TripSelectionScreen';
import SeatSelectionScreen from '../screens/campus/SeatSelectionScreen';
import BookingSummaryScreen from '../screens/campus/BookingSummaryScreen';
import QrTicketScreen from '../screens/campus/QrTicketScreen';
import CampusNotificationsScreen from '../screens/campus/CampusNotificationsScreen';
import MyTripsScreen from '../screens/bookings/MyTripsScreen';
import PlansScreen from '../screens/plans/PlansScreen';
import PaymentMethodsScreen from '../screens/campus/PaymentMethodsScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import StudentVerificationScreen from '../screens/verification/StudentVerificationScreen';
import VerificationStatusScreen from '../screens/verification/VerificationStatusScreen';
import type { RouteId, Trip } from '../screens/home/mockTrips';
import { useAuth } from '../state/AuthContext';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  EmailVerification: { email: string };
  MainTabs: undefined;
  CampusHub: undefined;
  Routes: undefined;
  TripSelection: { routeId: RouteId };
  SeatSelection: { trip: Trip };
  BookingSummary: { trip: Trip; seat: string };
  QrTicket: { trip: Trip; seat: string; bookingId: string };
  MyTrips: undefined;
  CampusNotifications: undefined;
  Plans: undefined;
  PaymentMethods: undefined;
  Community: undefined;
  StudentVerification: undefined;
  VerificationStatus: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator>
      {session ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="CampusHub" component={CampusHubScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Routes" component={RoutesScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="TripSelection"
            component={TripSelectionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SeatSelection"
            component={SeatSelectionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BookingSummary"
            component={BookingSummaryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="QrTicket"
            component={QrTicketScreen}
            options={{ headerShown: false, headerBackVisible: false }}
          />
          <Stack.Screen name="MyTrips" component={MyTripsScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="CampusNotifications"
            component={CampusNotificationsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Plans" component={PlansScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="PaymentMethods"
            component={PaymentMethodsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Community" component={CommunityScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="StudentVerification"
            component={StudentVerificationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VerificationStatus"
            component={VerificationStatusScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EmailVerification"
            component={EmailVerificationScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
