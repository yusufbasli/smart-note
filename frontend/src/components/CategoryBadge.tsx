import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CATEGORY_META, radius } from "../theme";

export default function CategoryBadge({ category }: { category: string }) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META["#other"];
  return (
    <View style={[s.badge, { backgroundColor: meta.bg }]}>
      <Text style={s.icon}>{meta.icon}</Text>
      <Text style={[s.label, { color: meta.text }]}>
        {category.replace("#", "")}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.full,
  },
  icon:  { fontSize: 11 },
  label: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
});
