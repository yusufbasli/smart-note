import React from "react";
import { View, Text } from "react-native";
import { CATEGORY_META } from "../theme";

export default function CategoryBadge({ category }: { category: string }) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META["#other"];
  return (
    <View style={{ backgroundColor: meta.bg, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 3 }}>
      <Text style={{ fontSize: 10 }}>{meta.icon}</Text>
      <Text style={{ color: meta.text, fontSize: 11, fontWeight: "700" }}>
        {category.replace("#", "")}
      </Text>
    </View>
  );
}
