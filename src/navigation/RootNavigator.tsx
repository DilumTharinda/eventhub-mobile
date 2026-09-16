import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import EventListScreen from "../screens/Events/EventListScreen";
import EventDetailsScreen from "../screens/Events/EventDetailsScreen";
import MyBookingsScreen from "../screens/Bookings/MyBookingsScreen";
import OrganizerDashboardScreen from "../screens/Organizer/OrganizerDashboardScreen";
import CreateEditEventScreen from "../screens/Organizer/CreateEditEventScreen";
import EventBookingsScreen from "../screens/Organizer/EventBookingsScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function EventsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="EventList" component={EventListScreen} options={{ title: "Events" }} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: "Details" }} />
    </Stack.Navigator>
  );
}

function OrganizerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="OrganizerDashboard" component={OrganizerDashboardScreen} options={{ title: "My Events" }} />
      <Stack.Screen name="CreateEditEvent" component={CreateEditEventScreen} options={{ title: "Event" }} />
      <Stack.Screen name="EventBookings" component={EventBookingsScreen} options={{ title: "Event Bookings" }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { profile } = useAuth();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const icons: any = { Events: "calendar", Bookings: "ticket", Organizer: "briefcase", Profile: "person" };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Events" component={EventsStack} options={{ headerShown: false }} />
      <Tab.Screen name="Bookings" component={MyBookingsScreen} />
      {profile?.role === "organizer" && (
        <Tab.Screen name="Organizer" component={OrganizerStack} options={{ headerShown: false }} />
      )}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();
  if (loading) return null; // add a splash/loading component
  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}