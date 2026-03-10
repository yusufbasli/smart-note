import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Task } from "../types/api";
import { colors, radius } from "../theme";

interface Props {
  task: Task;
  onToggle: () => void;
  showBorder?: boolean;
}

export default function TaskItem({ task, onToggle, showBorder = false }: Props) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[s.row, showBorder && s.border]}
      activeOpacity={0.7}
    >
      <View style={[s.circle, task.is_completed && s.circleActive]}>
        {task.is_completed && <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>✓</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[s.text, task.is_completed && s.textDone]}
          numberOfLines={2}
        >
          {task.task_text}
        </Text>
        {task.due_date && (
          <Text style={s.due}>📅 {new Date(task.due_date).toLocaleDateString()}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  row:         { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13 },
  border:      { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  circle:      { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, marginRight: 12, alignItems: "center", justifyContent: "center" },
  circleActive:{ backgroundColor: colors.success, borderColor: colors.success },
  text:        { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  textDone:    { color: colors.textMuted, textDecorationLine: "line-through" },
  due:         { fontSize: 11, color: colors.textMuted, marginTop: 3 },
});
