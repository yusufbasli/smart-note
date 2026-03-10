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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        dashboardApi.tasksToday(),
        dashboardApi.summary(),
      ]);
      setTasks(t);
      setSummary(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, []);

  const completed = tasks.filter((t) => t.is_completed).length;
  const total = tasks.length;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      {loading && tasks.length === 0 ? (
        <View className="flex-1 items-center justify-center mt-20">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <>
          {/* Today's tasks */}
          <Text className="text-lg font-bold text-gray-900 mb-3">Today's Tasks</Text>
          {total === 0 ? (
            <View className="bg-white border border-gray-200 rounded-2xl p-6 items-center mb-6">
              <Text className="text-3xl mb-2">🎉</Text>
              <Text className="text-gray-400">No tasks due today!</Text>
            </View>
          ) : (
            <View className="bg-white border border-gray-200 rounded-2xl mb-2 overflow-hidden">
              {/* Progress bar */}
              <View className="px-4 pt-4 pb-2">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-xs text-gray-500">Progress</Text>
                  <Text className="text-xs font-semibold text-gray-700">
                    {completed}/{total}
                  </Text>
                </View>
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    className="h-2 bg-primary-600 rounded-full"
                    style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                  />
                </View>
              </View>
              {tasks.map((task, i) => (
                <View
                  key={task.id}
                  className={`flex-row items-center px-4 py-3 ${
                    i < tasks.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <View
                    className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                      task.is_completed
                        ? "bg-primary-600 border-primary-600"
                        : "border-gray-300"
                    }`}
                  >
                    {task.is_completed && (
                      <Text className="text-white text-xs">✓</Text>
                    )}
                  </View>
                  <Text
                    className={`flex-1 text-sm ${
                      task.is_completed
                        ? "text-gray-400 line-through"
                        : "text-gray-800"
                    }`}
                    numberOfLines={2}
                  >
                    {task.task_text}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Category summary */}
          <Text className="text-lg font-bold text-gray-900 mt-6 mb-3">
            Notes by Category
          </Text>
          {summary.length === 0 ? (
            <View className="bg-white border border-gray-200 rounded-2xl p-6 items-center">
              <Text className="text-gray-400">No notes yet.</Text>
            </View>
          ) : (
            <View className="gap-3">
              {summary.map((item) => {
                const cat = item.category ?? "uncategorised";
                const color = CATEGORY_COLORS[cat] ?? "#6b7280";
                const maxCount = Math.max(...summary.map((s) => s.count));
                return (
                  <View
                    key={cat}
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3"
                  >
                    <View className="flex-row justify-between mb-2">
                      <Text
                        className="text-sm font-semibold"
                        style={{ color }}
                      >
                        {cat}
                      </Text>
                      <Text className="text-sm text-gray-500">{item.count} notes</Text>
                    </View>
                    <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <View
                        className="h-1.5 rounded-full"
                        style={{
                          backgroundColor: color,
                          width: `${(item.count / maxCount) * 100}%`,
                        }}
                      />
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
