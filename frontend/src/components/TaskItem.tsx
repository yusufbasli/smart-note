import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Task } from "../types/api";
import { colors, radius } from "../theme";

interface Props {
  task: Task;
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showBorder?: boolean;
}

export default function TaskItem({ task, onToggle, onEdit, onDelete, showBorder = false }: Props) {
  return (
    <View style={[s.row, showBorder && s.border]}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.7} style={s.toggleArea}>
        <View style={[s.circle, task.is_completed && s.circleActive]}>
          {task.is_completed && <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>✓</Text>}
        </View>
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={[s.text, task.is_completed && s.textDone]} numberOfLines={2}>
          {task.task_text}
        </Text>
        {task.due_date && !task.is_recurring && (
          <Text style={s.due}>Due: {new Date(task.due_date).toLocaleDateString()}</Text>
        )}
        {task.is_recurring && <Text style={s.due}>Repeats daily</Text>}
      </View>
      {(onEdit || onDelete) && (
        <View style={s.actionRow}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={s.actionBtn}>
              <Text style={s.actionText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={[s.actionBtn, s.deleteBtn]}>
              <Text style={[s.actionText, s.deleteText]}>Del</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row:         { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  border:      { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  toggleArea:  { paddingVertical: 2 },
  circle:      { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  circleActive:{ backgroundColor: colors.success, borderColor: colors.success },
  text:        { fontSize: 14, color: colors.textPrimary, lineHeight: 21, fontWeight: "500" },
  textDone:    { color: colors.textMuted, textDecorationLine: "line-through", fontWeight: "400" },
  due:         { fontSize: 11, color: colors.textMuted, marginTop: 3 },
  actionRow:   { flexDirection: "row", gap: 6 },
  actionBtn:   { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  actionText:  { fontSize: 11, color: colors.textSecondary, fontWeight: "700" },
  deleteBtn:   { borderColor: colors.dangerBg, backgroundColor: colors.dangerBg },
  deleteText:  { color: colors.danger },
});
