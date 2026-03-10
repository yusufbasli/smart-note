import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View, StyleSheet } from "react-native";
import type { MainTabParamList } from "./types";
import NotesStack from "./NotesStack";
import DashboardScreen from "../screens/DashboardScreen";
import { colors, shadow } from "../theme";

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <View style={[ts.iconWrap, focused && ts.iconWrapActive]}>
    <Text style={{ fontSize: 18 }}>{emoji}</Text>
  </View>
);

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: ts.tabBar,
        tabBarLabelStyle: ts.tabLabel,
      }}
    >
      <Tab.Screen
        name="NotesTab"
        component={NotesStack}
        options={{
          tabBarLabel: "Notes",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📝" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
          headerShown: true,
          title: "Dashboard",
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "800", fontSize: 17 },
        }}
      />
    </Tab.Navigator>
  );
}

const ts = StyleSheet.create({
  tabBar:       { backgroundColor: colors.surface, borderTopColor: colors.borderLight, borderTopWidth: 1, height: 62, paddingBottom: 8, paddingTop: 4, ...shadow.sm },
  tabLabel:     { fontSize: 11, fontWeight: "600" },
  iconWrap:     { width: 36, height: 26, alignItems: "center", justifyContent: "center", borderRadius: 13 },
  iconWrapActive:{ backgroundColor: "#EEF2FF" },
});
