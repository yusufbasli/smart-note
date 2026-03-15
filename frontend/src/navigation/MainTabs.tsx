import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { MainTabParamList } from "./types";
import NotesStack from "./NotesStack";
import DashboardScreen from "../screens/DashboardScreen";
import DesktopHeader from "../components/DesktopHeader";
import { colors, shadow, layout } from "../theme";

const Tab = createBottomTabNavigator<MainTabParamList>();

// ── Mobile Bottom Tab Bar ─────────────────────────────────────────────────────

function MobileTabBar({ state, navigation }: BottomTabBarProps) {
  const NAV_ITEMS = [
    { name: "NotesTab",  label: "Notes",     icon: "📝" },
    { name: "Dashboard", label: "Dashboard", icon: "📊" },
  ];
  return (
    <View style={ss.bottomBar}>
      {NAV_ITEMS.map(({ name, label, icon }, i) => {
        const active = state.index === i;
        return (
          <TouchableOpacity
            key={name}
            style={ss.bottomItem}
            onPress={() => navigation.navigate(name as any)}
            activeOpacity={0.7}
          >
            <View style={[ss.bottomIconWrap, active && ss.bottomIconWrapActive]}>
              <Text style={{ fontSize: 19 }}>{icon}</Text>
            </View>
            <Text style={[ss.bottomLabel, active && ss.bottomLabelActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── MainTabs ──────────────────────────────────────────────────────────────────

export default function MainTabs() {
  const { width } = useWindowDimensions();
  const isDesktop  = width >= layout.desktopBreakpoint;

  return (
    <Tab.Navigator
      tabBar={(props) => isDesktop ? <></> : <MobileTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="NotesTab" component={NotesStack} />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerShown:      true,
          header:           isDesktop ? () => <DesktopHeader activeTab="dashboard" /> : undefined,
          title:            "Dashboard",
          headerStyle:      { backgroundColor: colors.navy },
          headerTintColor:  "#fff",
          headerTitleStyle: { fontWeight: "800", fontSize: 17 },
        }}
      />
    </Tab.Navigator>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const ss = StyleSheet.create({
  bottomBar: {
    flexDirection:    "row",
    backgroundColor:  colors.surface,
    borderTopWidth:   1,
    borderTopColor:   colors.borderLight,
    height:           64,
    paddingBottom:    8,
    paddingTop:       6,
    ...shadow.sm,
  },
  bottomItem:           { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  bottomIconWrap:       { width: 38, height: 28, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  bottomIconWrapActive: { backgroundColor: colors.primaryBg },
  bottomLabel:          { fontSize: 10, fontWeight: "600", color: colors.textMuted },
  bottomLabelActive:    { color: colors.primary },
});
