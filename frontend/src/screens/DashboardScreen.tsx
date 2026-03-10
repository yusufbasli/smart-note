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
import { colors, radius, shadow, CATEGORY_META } from "../theme";

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
      setError(e?.response?.data?.detail ?? "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const completed = tasks.filter((t) => t.is_completed).length;
  const total = tasks.length;
  const progressPct = total > 0 ? (completed / total) * 100 : 0;
  const maxCount = summary.length > 0 ? Math.max(...summary.map((x) => x.count)) : 1;

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={s.loadingText}>Loading dashboard…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.centered}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={load}>
          <Text style={s.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {/* Stats row */}
      <View style={s.statsRow}>
        <View style={[s.statCard, { borderTopColor: colors.primary }]}>
          <Text style={s.statNum}>{total}</Text>
          <Text style={s.statLabel}>Tasks Today</Text>
        </View>
        <View style={[s.statCard, { borderTopColor: colors.success }]}>
          <Text style={[s.statNum, { color: colors.success }]}>{completed}</Text>
          <Text style={s.statLabel}>Completed</Text>
        </View>
        <View style={[s.statCard, { borderTopColor: colors.accent }]}>
          <Text style={[s.statNum, { color: colors.accent }]}>{summary.length}</Text>
          <Text style={s.statLabel}>Categories</Text>
        </View>
      </View>

      {/* Today's Tasks */}
      <Text style={s.sectionTitle}>Today's Tasks</Text>
      {total === 0 ? (
        <View style={s.emptyCard}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🎉</Text>
          <Text style={s.emptyText}>No tasks due today!</Text>
        </View>
      ) : (
        <View style={s.card}>
          {/* Progress */}
          <View style={s.progressHeader}>
            <Text style={s.progressLabel}>Progress</Text>
            <Text style={s.progressCount}>{completed} of {total} done</Text>
          </View>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${progressPct}%`, backgroundColor: progressPct === 100 ? colors.success : colors.primary }]} />
          </View>
          <View style={{ marginTop: 12 }}>
            {tasks.map((task, i) => (
              <View key={task.id} style={[s.taskRow, i < tasks.length - 1 && s.taskBorder]}>
                <View style={[s.circle, task.is_completed && { backgroundColor: colors.success, borderColor: colors.success }]}>
                  {task.is_completed && <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>✓</Text>}
                </View>
                <Text style={[s.taskText, task.is_completed && s.taskTextDone]} numberOfLines={2}>
                  {task.task_text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Notes by Category */}
      <Text style={[s.sectionTitle, { marginTop: 28 }]}>Notes by Category</Text>
      {summary.length === 0 ? (
        <View style={s.emptyCard}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>📂</Text>
          <Text style={s.emptyText}>No notes yet.</Text>
        </View>
      ) : (
        <View style={s.card}>
          {summary.map((item, i) => {
            const cat = item.category ?? "#other";
            const meta = CATEGORY_META[cat] ?? CATEGORY_META["#other"];
            const barWidth = `${(item.count / maxCount) * 100}%`;
            return (
              <View key={cat} style={[s.catRow, i < summary.length - 1 && s.catBorder]}>
                <View style={s.catLabelRow}>
                  <Text style={s.catIcon}>{meta.icon}</Text>
                  <Text style={[s.catName, { color: meta.bar }]}>{cat.replace("#", "")}</Text>
                  <View style={[s.catBadge, { backgroundColor: meta.bg }]}>
                    <Text style={[s.catBadgeText, { color: meta.text }]}>{item.count}</Text>
                  </View>
                </View>
                <View style={s.progressTrack}>
                  <View style={[s.progressFill, { width: barWidth as any, backgroundColor: meta.bar }]} />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: colors.bg },
  content:      { padding: 16, paddingBottom: 48 },
  centered:     { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: colors.bg },
  loadingText:  { color: colors.textMuted, marginTop: 12, fontSize: 14 },
  errorText:    { color: colors.danger, textAlign: "center", marginBottom: 20, fontSize: 14 },
  retryBtn:     { backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: radius.md, ...shadow.primary },
  retryText:    { color: "#fff", fontWeight: "700" },

  statsRow:     { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard:     { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, alignItems: "center", borderTopWidth: 3, ...shadow.sm },
  statNum:      { fontSize: 26, fontWeight: "800", color: colors.primary },
  statLabel:    { fontSize: 11, color: colors.textMuted, marginTop: 2, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },

  sectionTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary, marginBottom: 12, letterSpacing: 0.2 },
  emptyCard:    { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 32, alignItems: "center", ...shadow.sm },
  emptyText:    { color: colors.textSecondary, fontSize: 14, fontWeight: "500" },
  card:         { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, ...shadow.sm },

  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel:  { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  progressCount:  { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  progressTrack:  { height: 7, backgroundColor: colors.borderLight, borderRadius: radius.full, overflow: "hidden" },
  progressFill:   { height: 7, backgroundColor: colors.primary, borderRadius: radius.full },

  taskRow:     { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  taskBorder:  { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  circle:      { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, marginRight: 12, alignItems: "center", justifyContent: "center" },
  taskText:    { flex: 1, fontSize: 14, color: colors.textPrimary },
  taskTextDone:{ color: colors.textMuted, textDecorationLine: "line-through" },

  catRow:      { paddingVertical: 12 },
  catBorder:   { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  catLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  catIcon:     { fontSize: 16, marginRight: 6 },
  catName:     { flex: 1, fontSize: 14, fontWeight: "700", textTransform: "capitalize" },
  catBadge:    { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  catBadgeText:{ fontSize: 12, fontWeight: "700" },
});
