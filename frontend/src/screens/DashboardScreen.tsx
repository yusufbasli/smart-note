import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from "react-native";
import { dashboardApi } from "../api/dashboard";
import type { Task, CategorySummary } from "../types/api";

const CATEGORY_COLORS: Record<string, string> = {
  "#work": "#3b82f6", "#school": "#8b5cf6", "#personal": "#10b981",
  "#health": "#ef4444", "#finance": "#f59e0b", "#other": "#6b7280",
};

export default function DashboardScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([dashboardApi.tasksToday(), dashboardApi.summary()]);
      setTasks(t);
      setSummary(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const completed = tasks.filter((t) => t.is_completed).length;
  const total = tasks.length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f9fafb" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      {loading && tasks.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginTop: 80 }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <>
          <Text style={s.sectionTitle}>Today\'s Tasks</Text>
          {total === 0 ? (
            <View style={s.emptyCard}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🎉</Text>
              <Text style={{ color: "#9ca3af" }}>No tasks due today!</Text>
            </View>
          ) : (
            <View style={s.taskCard}>
              <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>Progress</Text>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#374151" }}>{completed}/{total}</Text>
                </View>
                <View style={s.progressTrack}>
                  <View style={[s.progressFill, { width: `${total > 0 ? (completed / total) * 100 : 0}%` as any }]} />
                </View>
              </View>
              {tasks.map((task, i) => (
                <View key={task.id} style={[s.taskRow, i < tasks.length - 1 && s.taskBorder]}>
                  <View style={[s.circle, task.is_completed && s.circleActive]}>
                    {task.is_completed && <Text style={{ color: "#fff", fontSize: 10 }}>✓</Text>}
                  </View>
                  <Text
                    style={[s.taskText, task.is_completed && s.taskTextDone]}
                    numberOfLines={2}
                  >
                    {task.task_text}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Text style={[s.sectionTitle, { marginTop: 24 }]}>Notes by Category</Text>
          {summary.length === 0 ? (
            <View style={s.emptyCard}>
              <Text style={{ color: "#9ca3af" }}>No notes yet.</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {summary.map((item) => {
                const cat = item.category ?? "uncategorised";
                const color = CATEGORY_COLORS[cat] ?? "#6b7280";
                const maxCount = Math.max(...summary.map((s) => s.count));
                return (
                  <View key={cat} style={s.summaryCard}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: "600", color }}>{cat}</Text>
                      <Text style={{ fontSize: 13, color: "#6b7280" }}>{item.count} notes</Text>
                    </View>
                    <View style={s.progressTrack}>
                      <View style={[s.progressFill, { backgroundColor: color, width: `${(item.count / maxCount) * 100}%` as any }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 12 },
  emptyCard:    { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 16, padding: 24, alignItems: "center" },
  taskCard:     { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 16, marginBottom: 8, overflow: "hidden" },
  progressTrack:{ height: 6, backgroundColor: "#f3f4f6", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: 6, backgroundColor: "#2563eb", borderRadius: 999 },
  taskRow:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  taskBorder:   { borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  circle:       { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#d1d5db", marginRight: 12, alignItems: "center", justifyContent: "center" },
  circleActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  taskText:     { flex: 1, fontSize: 14, color: "#1f2937" },
  taskTextDone: { color: "#9ca3af", textDecorationLine: "line-through" },
  summaryCard:  { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
});