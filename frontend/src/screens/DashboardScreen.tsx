import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { dashboardApi } from "../api/dashboard";
import type { Task, CategorySummary } from "../types/api";

const CATEGORY_COLORS: Record<string, string> = {
  "#work": "#3b82f6",
  "#school": "#8b5cf6",
  "#personal": "#10b981",
  "#health": "#ef4444",
  "#finance": "#f59e0b",
  "#other": "#6b7280",
};

export default function DashboardScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [t, sm] = await Promise.all([
        dashboardApi.tasksToday(),
        dashboardApi.summary(),
      ]);
      setTasks(t);
      setSummary(sm);
    } catch (e: any) {
      console.error("Dashboard error:", e?.response?.status, e?.response?.data);
      setError(e?.response?.data?.detail ?? "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, []);

  const completed = tasks.filter((t) => t.is_completed).length;
  const total = tasks.length;

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ color: "#9ca3af", marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.centered}>
        <Text style={{ fontSize: 32, marginBottom: 12 }}>warning</Text>
        <Text style={{ color: "#dc2626", textAlign: "center", marginBottom: 16 }}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={load}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <Text style={s.sectionTitle}>Today Tasks</Text>
      {total === 0 ? (
        <View style={s.emptyCard}>
          <Text style={{ color: "#9ca3af" }}>No tasks due today!</Text>
        </View>
      ) : (
        <View style={s.card}>
          <View style={s.progressHeader}>
            <Text style={s.progressLabel}>Progress</Text>
            <Text style={s.progressCount}>{completed}/{total}</Text>
          </View>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: (total > 0 ? (completed / total) * 100 : 0) + "%" }]} />
          </View>
          {tasks.map((task, i) => (
            <View key={task.id} style={[s.taskRow, i < tasks.length - 1 && s.taskBorder]}>
              <View style={[s.circle, task.is_completed && s.circleActive]}>
                {task.is_completed && <Text style={{ color: "#fff", fontSize: 10 }}>ok</Text>}
              </View>
              <Text style={[s.taskText, task.is_completed && s.taskTextDone]} numberOfLines={2}>
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
        <>
          {summary.map((item) => {
            const cat = item.category ?? "uncategorised";
            const color = CATEGORY_COLORS[cat] ?? "#6b7280";
            const maxCount = Math.max(...summary.map((x) => x.count));
            return (
              <View key={cat} style={[s.card, { marginBottom: 10 }]}>
                <View style={s.progressHeader}>
                  <Text style={[s.progressLabel, { color, fontWeight: "600" }]}>{cat}</Text>
                  <Text style={s.progressCount}>{item.count} notes</Text>
                </View>
                <View style={s.progressTrack}>
                  <View style={[s.progressFill, { backgroundColor: color, width: (item.count / maxCount) * 100 + "%" }]} />
                </View>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: "#f9fafb" },
  content:       { padding: 16, paddingBottom: 40 },
  centered:      { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: "#f9fafb" },
  sectionTitle:  { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 12 },
  emptyCard:     { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 12 },
  card:          { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 16, padding: 16, marginBottom: 8 },
  progressHeader:{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 13, color: "#6b7280" },
  progressCount: { fontSize: 13, fontWeight: "600", color: "#374151" },
  progressTrack: { height: 6, backgroundColor: "#f3f4f6", borderRadius: 999, overflow: "hidden" },
  progressFill:  { height: 6, backgroundColor: "#2563eb", borderRadius: 999 },
  taskRow:       { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  taskBorder:    { borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  circle:        { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#d1d5db", marginRight: 12, alignItems: "center", justifyContent: "center" },
  circleActive:  { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  taskText:      { flex: 1, fontSize: 14, color: "#1f2937" },
  taskTextDone:  { color: "#9ca3af", textDecorationLine: "line-through" },
  retryBtn:      { backgroundColor: "#2563eb", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
});
