import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { colors, shadow } from "../theme";

interface Props {
  activeTab: "notes" | "dashboard";
}

export default function DesktopHeader({ activeTab }: Props) {
  const navigation = useNavigation<any>();
  const logout     = useAuthStore((s) => s.logout);
  const user       = useAuthStore((s) => s.user);

  return (
    <View style={s.bar}>
      {/* Brand */}
      <View style={s.brand}>
        <View style={s.brandIcon}>
          <Text style={{ fontSize: 17 }}>✨</Text>
        </View>
        <Text style={s.brandText}>Smart Note</Text>
      </View>

      {/* Nav tabs */}
      <View style={s.tabs}>
        <TouchableOpacity
          style={[s.tab, activeTab === "notes" && s.tabActive]}
          onPress={() => navigation.navigate("NotesTab")}
        >
          <Text style={[s.tabText, activeTab === "notes" && s.tabTextActive]}>
            📝  Notes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, activeTab === "dashboard" && s.tabActive]}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Text style={[s.tabText, activeTab === "dashboard" && s.tabTextActive]}>
            📊  Dashboard
          </Text>
        </TouchableOpacity>
      </View>

      {/* User + Sign out */}
      <View style={s.right}>
        {user && (
          <View style={s.userChip}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{user.username[0].toUpperCase()}</Text>
            </View>
            <Text style={s.username} numberOfLines={1}>{user.username}</Text>
          </View>
        )}
        <TouchableOpacity style={s.logoutBtn} onPress={logout} activeOpacity={0.7}>
          <Text style={s.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection:     "row",
    alignItems:        "center",
    backgroundColor:   colors.surface,
    paddingHorizontal: 24,
    height:            56,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...shadow.xs,
  },

  brand:     { flexDirection: "row", alignItems: "center", gap: 10, marginRight: 28 },
  brandIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: colors.primaryBg,
    alignItems: "center", justifyContent: "center",
  },
  brandText: { fontSize: 16, fontWeight: "800", color: colors.textPrimary },

  tabs:        { flex: 1, flexDirection: "row", gap: 4 },
  tab:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  tabActive:   { backgroundColor: colors.primaryBg },
  tabText:     { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  tabTextActive:{ color: colors.primary },

  right:    { flexDirection: "row", alignItems: "center", gap: 12 },
  userChip: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar:   {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  username:   { fontSize: 13, fontWeight: "600", color: colors.textSecondary, maxWidth: 120 },
  logoutBtn:  {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, backgroundColor: "rgba(239,68,68,0.08)",
  },
  logoutText: { color: colors.danger, fontSize: 13, fontWeight: "600" },
});
