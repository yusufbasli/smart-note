import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Task } from "../types/api";

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
    >
      <View style={[s.circle, task.is_completed && s.circleActive]}>
        {task.is_completed && <Text style={{ color: "#fff", fontSize: 10 }}>✓</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[s.text, task.is_completed && s.textDone]}
          numberOfLines={2}
        >
          {task.task_text}
        </Text>
        {task.due_date && (
          <Text style={s.due}>Due: {new Date(task.due_date).toLocaleDateString()}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  row:         { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  border:      { borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  circle:      { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#d1d5db", marginRight: 12, alignItems: "center", justifyContent: "center" },
  circleActive:{ backgroundColor: "#2563eb", borderColor: "#2563eb" },
  text:        { fontSize: 14, color: "#1f2937" },
  textDone:    { color: "#9ca3af", textDecorationLine: "line-through" },
  due:         { fontSize: 11, color: "#9ca3af", marginTop: 2 },
});
