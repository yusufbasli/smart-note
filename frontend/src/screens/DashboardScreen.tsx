import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { dashboardApi } from "../api/dashboard";
import { dashboardTasksApi, TaskPeriod } from "../api/tasks";
import type { Task, CategorySummary } from "../types/api";
import { colors, radius, shadow, CATEGORY_META } from "../theme";
import { useAuthStore } from "../store/authStore";

const PERIODS: { key: TaskPeriod; label: string }[] = [
  { key: "today",    label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "week",     label: "This Week" },
  { key: "all",      label: "All" },
];

const PERIOD_STAT_LABEL: Record<TaskPeriod, string> = {
  today:    "Today",
  tomorrow: "Tomorrow",
  week:     "This Week",
  all:      "Total",
};

const dueDateForPeriod = (period: TaskPeriod): string | undefined => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  if (period === "today")    return d.toISOString();
  if (period === "tomorrow") { d.setDate(d.getDate() + 1); return d.toISOString(); }
  if (period === "week")     return d.toISOString();
  return undefined;
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export default function DashboardScreen() {
  const [period,   setPeriod]   = useState<TaskPeriod>("today");
  const [tasks,    setTasks]    = useState<Task[]>([]);
  const [summary,  setSummary]  = useState<CategorySummary[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,    setError]    = useState("");

  // Add-task inline row
  const [showAdd,    setShowAdd]    = useState(false);
  const [newText,    setNewText]    = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const user = useAuthStore((s) => s.user);

  // ── loaders ──────────────────────────────────────────────────────────────

  const loadTasks = useCallback(async (p: TaskPeriod, silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const t = await dashboardTasksApi.list(p, true);
      setTasks(t);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to load tasks.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    try {
      const sm = await dashboardApi.summary();
      setSummary(sm);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => { loadTasks(period); loadSummary(); }, []);

  const onPeriodChange = (p: TaskPeriod) => {
    setPeriod(p);
    setShowAdd(false);
    setNewText("");
    loadTasks(p, false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks(period, false);
    loadSummary();
  };

  // ── task actions ─────────────────────────────────────────────────────────

  const handleToggle = async (task: Task) => {
    // optimistic update
    setTasks((prev) =>
      prev.map((t) => t.id === task.id ? { ...t, is_completed: !t.is_completed } : t)
    );
    try {
      await dashboardTasksApi.update(task.id, { is_completed: !task.is_completed });
    } catch {
      setTasks((prev) =>
        prev.map((t) => t.id === task.id ? { ...t, is_completed: task.is_completed } : t)
      );
    }
  };

  const handleAddTask = async () => {
    const text = newText.trim();
    if (!text || addLoading) return;
    setAddLoading(true);
    try {
      const task = await dashboardTasksApi.create(text, dueDateForPeriod(period));
      setTasks((prev) => [task, ...prev]);
      setNewText("");
      setShowAdd(false);
    } catch {
      // keep input open on failure
    } finally {
      setAddLoading(false);
    }
  };

  // ── derived stats ─────────────────────────────────────────────────────────

  const pending   = tasks.filter((t) => !t.is_completed).length;
  const completed = tasks.filter((t) =>  t.is_completed).length;
  const total     = tasks.length;
  const progressPct = total > 0 ? (completed / total) * 100 : 0;
  const maxCount    = summary.length > 0 ? Math.max(...summary.map((x) => x.count)) : 1;

  const pendingTasks   = tasks.filter((t) => !t.is_completed);
  const completedTasks = tasks.filter((t) =>  t.is_completed);

  // ── render ────────────────────────────────────────────────────────────────

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
        <TouchableOpacity style={s.retryBtn} onPress={() => loadTasks(period)}>
          <Text style={s.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={s.root}
        contentContainerStyle={{ paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        {/* ── Hero Banner ── */}
        <View style={s.hero}>
          <Text style={s.greeting}>{getGreeting()}, {user?.username ?? "there"} 👋</Text>
          <Text style={s.heroDate}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </Text>
          <View style={s.heroStatsRow}>
            <View style={s.heroStat}>
              <Text style={s.heroStatNum}>{pending}</Text>
              <Text style={s.heroStatLabel}>Pending</Text>
            </View>
            <View style={s.heroStat}>
              <Text style={s.heroStatNum}>{completed}</Text>
              <Text style={s.heroStatLabel}>Done</Text>
            </View>
            <View style={s.heroStat}>
              <Text style={s.heroStatNum}>{summary.length}</Text>
              <Text style={s.heroStatLabel}>Categories</Text>
            </View>
          </View>
        </View>

        {/* ── Content Body ── */}
        <View style={s.body}>

          {/* Period Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.tabsScroll}
            contentContainerStyle={s.tabsRow}
          >
            {PERIODS.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[s.tab, period === key && s.tabActive]}
                onPress={() => onPeriodChange(key)}
              >
                <Text style={[s.tabText, period === key && s.tabTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Task Section Header */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              {PERIOD_STAT_LABEL[period]} Tasks
              {total > 0 && (
                <Text style={s.sectionCount}> ({completed}/{total})</Text>
              )}
            </Text>
            <TouchableOpacity
              style={s.addBtn}
              onPress={() => {
                setShowAdd(true);
                setTimeout(() => inputRef.current?.focus(), 80);
              }}
            >
              <Text style={s.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {/* Inline New-Task Input */}
          {showAdd && (
            <View style={s.addRow}>
              <TextInput
                ref={inputRef}
                style={s.addInput}
                value={newText}
                onChangeText={setNewText}
                placeholder="New task…"
                placeholderTextColor={colors.textMuted}
                returnKeyType="done"
                onSubmitEditing={handleAddTask}
                maxLength={500}
              />
              <TouchableOpacity
                style={[s.addSaveBtn, (!newText.trim() || addLoading) && { opacity: 0.5 }]}
                onPress={handleAddTask}
                disabled={!newText.trim() || addLoading}
              >
                {addLoading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={s.addSaveBtnText}>Save</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={s.addCancelBtn}
                onPress={() => { setShowAdd(false); setNewText(""); }}
              >
                <Text style={s.addCancelBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Pending Tasks */}
          {pendingTasks.length === 0 && completedTasks.length === 0 ? (
            <View style={s.emptyCard}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🎉</Text>
              <Text style={s.emptyText}>
                {period === "today"    ? "No tasks for today!"    :
                 period === "tomorrow" ? "Nothing due tomorrow."  :
                 period === "week"     ? "Clear week ahead!"      :
                 "No tasks yet."}
              </Text>
            </View>
          ) : (
            <>
              {pendingTasks.length > 0 && (
                <View style={s.card}>
                  {total > 0 && (
                    <View style={{ marginBottom: 12 }}>
                      <View style={s.progressTrack}>
                        <View
                          style={[
                            s.progressFill,
                            {
                              width: `${progressPct}%` as any,
                              backgroundColor: progressPct === 100 ? colors.success : colors.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  )}
                  {pendingTasks.map((task, i) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      hasBorder={i < pendingTasks.length - 1}
                    />
                  ))}
                </View>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <>
                  <Text style={[s.sectionTitle, { marginTop: 20, marginBottom: 10, fontSize: 13 }]}>
                    Completed ({completedTasks.length})
                  </Text>
                  <View style={[s.card, { opacity: 0.7 }]}>
                    {completedTasks.map((task, i) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onToggle={handleToggle}
                        hasBorder={i < completedTasks.length - 1}
                      />
                    ))}
                  </View>
                </>
              )}
            </>
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
                const cat  = item.category ?? "#other";
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── TaskRow sub-component ────────────────────────────────────────────────────

function TaskRow({
  task,
  onToggle,
  hasBorder,
}: {
  task: Task;
  onToggle: (t: Task) => void;
  hasBorder: boolean;
}) {
  return (
    <TouchableOpacity
      style={[s.taskRow, hasBorder && s.taskBorder]}
      onPress={() => onToggle(task)}
      activeOpacity={0.7}
    >
      <View style={[s.circle, task.is_completed && s.circleDone]}>
        {task.is_completed && <Text style={s.checkmark}>✓</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[s.taskText, task.is_completed && s.taskTextDone]}
          numberOfLines={2}
        >
          {task.task_text}
        </Text>
        {task.due_date && (
          <Text style={s.taskDue}>
            {new Date(task.due_date).toLocaleDateString("en-US", {
              month: "short", day: "numeric",
            })}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: colors.primaryDark },
  centered:     { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: colors.bg },
  loadingText:  { color: colors.textMuted, marginTop: 12, fontSize: 14 },
  errorText:    { color: colors.danger, textAlign: "center", marginBottom: 20, fontSize: 14 },
  retryBtn:     { backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: radius.md, ...shadow.primary },
  retryText:    { color: "#fff", fontWeight: "700" },

  hero:          { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 40 },
  greeting:      { fontSize: 22, fontWeight: "800", color: "#fff", letterSpacing: 0.2 },
  heroDate:      { fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 3, marginBottom: 22 },
  heroStatsRow:  { flexDirection: "row", gap: 10 },
  heroStat:      { flex: 1, backgroundColor: "rgba(255,255,255,0.13)", borderRadius: radius.lg, padding: 14, alignItems: "center" },
  heroStatNum:   { fontSize: 26, fontWeight: "800", color: "#fff" },
  heroStatLabel: { fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 2, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },

  body:         { backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingTop: 20, marginTop: -20 },

  tabsScroll:   { marginBottom: 20, marginHorizontal: -20 },
  tabsRow:      { flexDirection: "row", gap: 8, paddingHorizontal: 20 },
  tab:          { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight },
  tabActive:    { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText:      { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  tabTextActive:{ color: "#fff" },

  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionTitle:  { flex: 1, fontSize: 16, fontWeight: "800", color: colors.textPrimary, letterSpacing: 0.2 },
  sectionCount:  { fontSize: 14, fontWeight: "500", color: colors.textMuted },
  addBtn:        { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full },
  addBtnText:    { color: "#fff", fontSize: 13, fontWeight: "700" },

  addRow:        { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.md, padding: 10, marginBottom: 12, gap: 8, ...shadow.sm, borderWidth: 1, borderColor: colors.primary },
  addInput:      { flex: 1, fontSize: 14, color: colors.textPrimary, paddingVertical: 4 },
  addSaveBtn:    { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 8 },
  addSaveBtnText:{ color: "#fff", fontWeight: "700", fontSize: 13 },
  addCancelBtn:  { padding: 6 },
  addCancelBtnText: { color: colors.textMuted, fontSize: 16, fontWeight: "600" },

  emptyCard:    { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 32, alignItems: "center", ...shadow.sm, marginBottom: 12 },
  emptyText:    { color: colors.textSecondary, fontSize: 14, fontWeight: "500" },
  card:         { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, ...shadow.sm, marginBottom: 8 },

  progressTrack: { height: 6, backgroundColor: colors.borderLight, borderRadius: radius.full, overflow: "hidden" },
  progressFill:  { height: 6, borderRadius: radius.full },

  taskRow:     { flexDirection: "row", alignItems: "flex-start", paddingVertical: 10 },
  taskBorder:  { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  circle:      { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, marginRight: 12, marginTop: 1, alignItems: "center", justifyContent: "center" },
  circleDone:  { backgroundColor: colors.success, borderColor: colors.success },
  checkmark:   { color: "#fff", fontSize: 11, fontWeight: "700" },
  taskText:    { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  taskTextDone:{ color: colors.textMuted, textDecorationLine: "line-through" },
  taskDue:     { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  catRow:      { paddingVertical: 12 },
  catBorder:   { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  catLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  catIcon:     { fontSize: 16, marginRight: 6 },
  catName:     { flex: 1, fontSize: 14, fontWeight: "700", textTransform: "capitalize" },
  catBadge:    { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  catBadgeText:{ fontSize: 12, fontWeight: "700" },
});


