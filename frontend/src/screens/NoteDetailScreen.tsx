import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  Alert, RefreshControl, StyleSheet, TextInput, useWindowDimensions,
} from "react-native";
import { useNotesStore } from "../store/notesStore";
import CategoryBadge from "../components/CategoryBadge";
import TaskItem from "../components/TaskItem";
import type { NotesScreenProps } from "../navigation/types";
import { colors, radius, shadow, CATEGORY_META, layout } from "../theme";

const todayNoonIso = () => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
};

export default function NoteDetailScreen({ navigation, route }: NotesScreenProps<"NoteDetail">) {
  const { noteId } = route.params;
  const {
    currentNote, fetchNote, deleteNote, analyzeNote,
    toggleTask, addTask, updateTask, deleteTask, isLoading,
  } = useNotesStore();

  const [analyzing,     setAnalyzing]     = useState(false);
  const [newTaskText,   setNewTaskText]   = useState("");
  const [newTaskSaving, setNewTaskSaving] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskText,  setEditTaskText]  = useState("");

  const { width } = useWindowDimensions();
  const isDesktop  = width >= layout.desktopBreakpoint;

  useEffect(() => { fetchNote(noteId); }, [noteId]);
  useEffect(() => {
    if (currentNote) navigation.setOptions({ title: currentNote.title });
  }, [currentNote?.title]);

  const handleDelete = () =>
    Alert.alert("Delete Note", "This will also delete all tasks. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try { await deleteNote(noteId); navigation.goBack(); }
          catch (e: any) { Alert.alert("Error", e?.response?.data?.detail ?? "Failed to delete."); }
        },
      },
    ]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try { await analyzeNote(noteId); }
    catch (e: any) { Alert.alert("Error", e?.response?.data?.detail ?? "AI analysis failed."); }
    finally { setAnalyzing(false); }
  };

  const handleAddTask = async () => {
    const text = newTaskText.trim();
    if (!text || newTaskSaving) return;
    setNewTaskSaving(true);
    try {
      await addTask(noteId, { task_text: text, due_date: todayNoonIso() });
      setNewTaskText("");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail ?? "Failed to add task.");
    } finally {
      setNewTaskSaving(false);
    }
  };

  const saveEditTask = async (taskId: string) => {
    const text = editTaskText.trim();
    if (!text) return;
    try {
      await updateTask(noteId, taskId, { task_text: text });
      setEditingTaskId(null);
      setEditTaskText("");
    } catch (e: any) { Alert.alert("Error", e?.response?.data?.detail ?? "Failed to update task."); }
  };

  const handleDeleteTask = (taskId: string) =>
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try { await deleteTask(noteId, taskId); }
          catch (e: any) { Alert.alert("Error", e?.response?.data?.detail ?? "Failed to delete task."); }
        },
      },
    ]);

  if (isLoading && !currentNote) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!currentNote) return null;

  const catMeta        = currentNote.ai_category ? CATEGORY_META[currentNote.ai_category] : null;
  const completedCount = currentNote.tasks.filter((t) => t.is_completed).length;
  const totalTasks     = currentNote.tasks.length;

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={[
        s.contentWrap,
        isDesktop && { maxWidth: layout.formMaxWidth, alignSelf: "center", width: "100%" },
      ]}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={() => fetchNote(noteId)} tintColor={colors.primary} />
      }
    >
      {/* Action bar */}
      <View style={s.actionBar}>
        <TouchableOpacity
          style={s.btnPrimary}
          onPress={() => navigation.navigate("NoteForm", { noteId })}
        >
          <Text style={s.btnPrimaryText}>✏️  Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.btnSecondary, analyzing && { opacity: 0.6 }]}
          onPress={handleAnalyze}
          disabled={analyzing}
        >
          {analyzing
            ? <ActivityIndicator size="small" color={colors.primary} />
            : <Text style={s.btnSecondaryText}>✨  Analyse</Text>}
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={[s.titleCard, catMeta && { borderTopColor: catMeta.bar }]}>
        <View style={s.titleRow}>
          <Text style={s.noteTitle}>{currentNote.title}</Text>
          {currentNote.ai_category && <CategoryBadge category={currentNote.ai_category} />}
        </View>
        <Text style={s.dateText}>
          Updated {new Date(currentNote.updated_at).toLocaleString("en-US", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </Text>
      </View>

      {/* AI Summary */}
      {currentNote.ai_summary && (
        <View style={s.summaryBox}>
          <View style={s.summaryHeader}>
            <Text style={s.summaryLabel}>✨  AI SUMMARY</Text>
          </View>
          <Text style={s.summaryText}>{currentNote.ai_summary}</Text>
        </View>
      )}

      {/* Content */}
      <View style={s.sectionBox}>
        <Text style={s.sectionLabel}>NOTE</Text>
        <Text style={s.contentText}>{currentNote.content}</Text>
      </View>

      {/* Tasks */}
      <View style={s.tasksBox}>
        <View style={s.tasksHeader}>
          <Text style={s.tasksTitle}>Tasks</Text>
          {totalTasks > 0 && (
            <View style={s.progressGroup}>
              <Text style={s.progressLabel}>{completedCount}/{totalTasks}</Text>
              <View style={s.progressTrack}>
                <View
                  style={[
                    s.progressFill,
                    {
                      width: `${(completedCount / totalTasks) * 100}%` as any,
                      backgroundColor: completedCount === totalTasks ? colors.success : colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        <View style={s.taskAddRow}>
          <TextInput
            value={newTaskText}
            onChangeText={setNewTaskText}
            placeholder="Add a task…"
            placeholderTextColor={colors.textMuted}
            style={s.taskInput}
            maxLength={500}
            returnKeyType="done"
            onSubmitEditing={handleAddTask}
          />
          <TouchableOpacity
            style={[s.taskAddBtn, (!newTaskText.trim() || newTaskSaving) && { opacity: 0.45 }]}
            disabled={!newTaskText.trim() || newTaskSaving}
            onPress={handleAddTask}
          >
            {newTaskSaving
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={s.taskAddBtnText}>Add</Text>}
          </TouchableOpacity>
        </View>

        {currentNote.tasks.length === 0 ? (
          <Text style={s.noTasks}>No tasks yet.</Text>
        ) : (
          currentNote.tasks.map((task, i) => (
            <View key={task.id}>
              <TaskItem
                task={task}
                onToggle={() => toggleTask(noteId, task)}
                onEdit={() => { setEditingTaskId(task.id); setEditTaskText(task.task_text); }}
                onDelete={() => handleDeleteTask(task.id)}
                showBorder={i < currentNote.tasks.length - 1 || editingTaskId === task.id}
              />
              {editingTaskId === task.id && (
                <View style={s.editRow}>
                  <TextInput
                    value={editTaskText}
                    onChangeText={setEditTaskText}
                    style={s.editInput}
                    placeholderTextColor={colors.textMuted}
                    maxLength={500}
                  />
                  <View style={s.editActions}>
                    <TouchableOpacity style={s.editSave} onPress={() => saveEditTask(task.id)}>
                      <Text style={s.editSaveText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.editCancel}
                      onPress={() => { setEditingTaskId(null); setEditTaskText(""); }}
                    >
                      <Text style={s.editCancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* Delete */}
      <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
        <Text style={s.deleteBtnText}>Delete Note</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.bg },
  contentWrap:{ paddingHorizontal: 16, paddingBottom: 48, paddingTop: 8 },
  centered:   { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },

  actionBar: { flexDirection: "row", gap: 10, marginBottom: 14 },
  btnPrimary: {
    flex: 1, backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 13, alignItems: "center", ...shadow.primary,
  },
  btnPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  btnSecondary: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    paddingVertical: 13, alignItems: "center",
    borderWidth: 1.5, borderColor: colors.primary, ...shadow.xs,
  },
  btnSecondaryText: { color: colors.primary, fontWeight: "700", fontSize: 14 },

  titleCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderTopWidth: 3, borderTopColor: colors.primary,
    padding: 18, marginBottom: 14, ...shadow.sm,
  },
  titleRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 8,
  },
  noteTitle: { fontSize: 22, fontWeight: "800", color: colors.textPrimary, flex: 1, marginRight: 10, lineHeight: 28 },
  dateText:  { fontSize: 11, color: colors.textMuted },

  summaryBox:    { backgroundColor: colors.primaryBg, borderRadius: radius.lg, overflow: "hidden", marginBottom: 14 },
  summaryHeader: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8 },
  summaryLabel:  { fontSize: 11, fontWeight: "800", color: "#fff", letterSpacing: 0.8 },
  summaryText:   { fontSize: 14, color: colors.textPrimary, lineHeight: 22, padding: 14 },

  sectionBox:   { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginBottom: 14, ...shadow.sm },
  sectionLabel: { fontSize: 10, fontWeight: "800", color: colors.textMuted, letterSpacing: 1.2, marginBottom: 10 },
  contentText:  { fontSize: 15, color: colors.textPrimary, lineHeight: 26 },

  tasksBox:    { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: "hidden", marginBottom: 18, ...shadow.sm },
  tasksHeader: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  tasksTitle:  { flex: 1, fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  progressGroup:{ alignItems: "flex-end", gap: 4 },
  progressLabel: { fontSize: 11, fontWeight: "600", color: colors.textMuted },
  progressTrack: { width: 60, height: 4, backgroundColor: colors.borderLight, borderRadius: 2, overflow: "hidden" },
  progressFill:  { height: 4, borderRadius: 2 },

  taskAddRow: {
    flexDirection: "row", gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  taskInput:      { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.bg },
  taskAddBtn:     { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 14, justifyContent: "center" },
  taskAddBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  noTasks:        { color: colors.textMuted, fontSize: 13, padding: 16 },

  editRow:     { paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.borderLight, backgroundColor: colors.bg },
  editInput:   { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surface, marginTop: 4 },
  editActions: { flexDirection: "row", gap: 8, marginTop: 8 },
  editSave:    { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 8 },
  editSaveText:{ color: "#fff", fontWeight: "700", fontSize: 12 },
  editCancel:  { backgroundColor: colors.surface, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 8 },
  editCancelText: { color: colors.textSecondary, fontWeight: "700", fontSize: 12 },

  deleteBtn:     { borderRadius: radius.md, paddingVertical: 13, alignItems: "center", borderWidth: 1.5, borderColor: colors.danger },
  deleteBtnText: { color: colors.danger, fontWeight: "600", fontSize: 14 },
});
