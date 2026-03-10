import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import type { MainTabParamList } from "./types";
import NotesStack from "./NotesStack";
import DashboardScreen from "../screens/DashboardScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

const NotesIcon = ({ color }: { color: string }) => (
  <Text style={{ fontSize: 20, color }}>📝</Text>
);
const DashIcon = ({ color }: { color: string }) => (
  <Text style={{ fontSize: 20, color }}>📊</Text>
);

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e5e7eb",
        },
      }}
    >
      <Tab.Screen
        name="NotesTab"
        component={NotesStack}
        options={{
          tabBarLabel: "Notes",
          tabBarIcon: NotesIcon,
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: DashIcon,
          headerShown: true,
          title: "Dashboard",
          headerStyle: { backgroundColor: "#2563eb" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" },
        }}
      />
    </Tab.Navigator>
  );
}
