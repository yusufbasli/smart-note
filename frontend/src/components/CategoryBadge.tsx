import React from "react";
import { View, Text } from "react-native";

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  "#work":     { bg: "#dbeafe", text: "#1d4ed8" },
  "#school":   { bg: "#ede9fe", text: "#6d28d9" },
  "#personal": { bg: "#d1fae5", text: "#047857" },
  "#health":   { bg: "#fee2e2", text: "#b91c1c" },
  "#finance":  { bg: "#fef3c7", text: "#b45309" },
  "#other":    { bg: "#f3f4f6", text: "#374151" },
};

export default function CategoryBadge({ category }: { category: string }) {
  const colors = COLOR_MAP[category] ?? COLOR_MAP["#other"];
  return (
    <View style={{ backgroundColor: colors.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
      <Text style={{ color: colors.text, fontSize: 11, fontWeight: "600" }}>
        {category}
      </Text>
    </View>
  );
}
