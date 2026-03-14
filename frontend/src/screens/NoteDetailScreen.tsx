import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  TextInput,
} from "react-native";
import { useNotesStore } from "../store/notesStore";
import CategoryBadge from "../components/CategoryBadge";
import TaskItem from "../components/TaskItem";
import type { NotesScreenProps } from "../navigation/types";
import { colors, radius, shadow, CATEGORY_META } from "../theme";

export default function NoteDetailScreen({ navigation, route }: NotesScreenProps<"NoteDetail">) {
  const { noteId } = route.params;
  const { currentNote, fetchNote, deleteNote, analyzeNote, toggleTask, addTask, updateTask, deleteTask, isLoading } =
    useNotesStore();
  const [analyzing, setAnalyzing] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskSaving, setNewTaskSaving] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskText, setEditTaskText] = useState("");

  useEffect(() => { fetchNote(noteId); }, [noteId]);

  useEffect(() => {
    if (currentNote) navigation.setOptions({ title: currentNote.title });
  }, [currentNote?.title]);

  const handleDelete = () => {
    Alert.alert("Delete Note", "This will also delete all tasks. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await deleteNote(noteId);
            navigation.goBack();
          } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.detail ?? "Failed to delete note. Please try again.");
          }
        },
      },
    ]);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await analyzeNote(noteId);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail ?? "AI analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddTask = async () => {
    const text = newTaskText.trim();
    if (!text || newTaskSaving) return;
    setNewTaskSaving(true);
    try {
      await addTask(noteId, { task_text: text });
      setNewTaskText("");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail ?? "Failed to add task.");
    } finally {
      setNewTaskSaving(false);
    }
  };

  const startEditTask = (taskId: string, currentText: string) => {
    setEditingTaskId(taskId);
    setEditTaskText(currentText);
  };

  const saveEditTask = async (taskId: string) => {
    const text = editTaskText.trim();
    if (!text) return;
    try {
      await updateTask(noteId, taskId, { task_text: text });
      setEditingTaskId(null);
      setEditTaskText("");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail ?? "Failed to update task.");
    }
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTask(noteId, taskId);
          } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.detail ?? "Failed to delete task.");
          }
        },
      },
    ]);
  };

  if (isLoading && !currentNote) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!currentNote) return null;

  const catMeta = currentNote.ai_category ? CATEGORY_META[currentNote.ai_category] : null;
  const completedCount = currentNote.tasks.filter((t) => t.is_completed).length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: 48 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchNote(noteId)} tintColor={colors.primary} />}
    >
      {/* Title card */}
      <View style={[s.titleCard, catMeta && { borderTopColor: catMeta.bar }]}>
        <View style={s.titleRow}>
          <Text style={s.noteTitle}>{currentNote.title}</Text>
          {currentNote.ai_category && <CategoryBadge category={currentNote.ai_category} />}
        </View>
        <Text style={s.dateText}>Updated {new Date(currentNote.updated_at).toLocaleString()}</Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {/* AI Summary */}
        {currentNote.ai_summary && (
          <View style={s.summaryBox}>
            <View style={s.summaryHeader}>
              <Text style={s.summaryLabel}>✨ AI SUMMARY</Text>
            </View>
            <Text style={s.summaryText}>{currentNote.ai_summary}</Text>
          </View>
        )}

        {/* Content */}
        <View style={s.contentBox}>
          <Text style={s.contentLabel}>NOTE</Text>
          <Text style={s.contentText}>{currentNote.content}</Text>
        </View>

        {/* Tasks */}
        <View style={s.tasksBox}>
          <View style={s.tasksHeader}>
            <Text style={s.tasksTitle}>Tasks</Text>
            <View style={s.tasksBadge}>
              <Text style={s.tasksBadgeText}>{completedCount}/{currentNote.tasks.length}</Text>
            </View>
          </View>

          <View style={s.taskCreateRow}>
            <TextInput
              value={newTaskText}
              onChangeText={setNewTaskText}
              placeholder="Add a task"
              placeholderTextColor={colors.textMuted}
              style={s.taskInput}
              maxLength={500}
              returnKeyType="done"
              onSubmitEditing={handleAddTask}
            />
            <TouchableOpacity
              style={[s.taskAddBtn, (!newTaskText.trim() || newTaskSaving) && { opacity: 0.5 }]}
              disabled={!newTaskText.trim() || newTaskSaving}
              onPress={handleAddTask}
            >
              {newTaskSaving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.taskAddText}>Add</Text>}
            </TouchableOpacity>
          </View>

          {currentNote.tasks.length > 0 ? (
            currentNote.tasks.map((task, i) => (
              <View key={task.id}>
                <TaskItem
                  task={task}
                  onToggle={() => toggleTask(noteId, task)}
                  onEdit={() => startEditTask(task.id, task.task_text)}
                  onDelete={() => handleDeleteTask(task.id)}
                  showBorder={i < currentNote.tasks.length - 1 || editingTaskId === task.id}
                />
                {editingTaskId === task.id && (
                  <View style={s.editTaskRow}>
                    <TextInput
                      value={editTaskText}
                      onChangeText={setEditTaskText}
                      placeholder="Task text"
                      placeholderTextColor={colors.textMuted}
                      style={s.editTaskInput}
                      maxLength={500}
                    />
                    <View style={s.editActionsRow}>
                      <TouchableOpacity style={s.editSaveBtn} onPress={() => saveEditTask(task.id)}>
                        <Text style={s.editSaveText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={s.editCancelBtn}
                        onPress={() => {
                          setEditingTaskId(null);
                          setEditTaskText("");
                        }}
                      >
                        <Text style={s.editCancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={s.noTaskText}>No tasks yet.</Text>
          )}
        </View>

        {/* Action row */}
        <View style={s.actionRow}>
          <TouchableOpacity
            style={[s.actionBtn, s.actionBtnPrimary]}
            onPress={() => navigation.navigate("NoteForm", { noteId })}
          >
            <Text style={s.actionBtnPrimaryText}>✏️  Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.actionBtn, s.actionBtnSecondary]}
            onPress={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Text style={s.actionBtnSecondaryText}>✨  AI</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
          <Text style={s.deleteBtnText}>Delete Note</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  titleCard:       { backgroundColor: colors.surface, borderTopWidth: 3, borderTopColor: colors.primary, padding: 20, marginBottom: 16, ...shadow.sm },
  titleRow:        { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  noteTitle:       { fontSize: 22, fontWeight: "800", color: colors.textPrimary, flex: 1, marginRight: 10, lineHeight: 28 },
  dateText:        { fontSize: 11, color: colors.textMuted },
  summaryBox:      { backgroundColor: "#EEF2FF", borderRadius: radius.lg, overflow: "hidden", marginBottom: 14 },
  summaryHeader:   { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8 },
  summaryLabel:    { fontSize: 11, fontWeight: "800", color: "#fff", letterSpacing: 0.8 },
  summaryText:     { fontSize: 14, color: colors.textPrimary, lineHeight: 22, padding: 14 },
  contentBox:      { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginBottom: 14, ...shadow.sm },
  contentLabel:    { fontSize: 10, fontWeight: "800", color: colors.textMuted, letterSpacing: 1, marginBottom: 10 },
  contentText:     { fontSize: 15, color: colors.textPrimary, lineHeight: 26 },
  tasksBox:        { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: "hidden", marginBottom: 20, ...shadow.sm },
  tasksHeader:     { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  tasksTitle:      { fontSize: 14, fontWeight: "700", color: colors.textPrimary, flex: 1 },
  tasksBadge:      { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  tasksBadgeText:  { color: "#fff", fontSize: 11, fontWeight: "700" },
  taskCreateRow:   { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  taskInput:       { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.bg },
  taskAddBtn:      { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 14, justifyContent: "center" },
  taskAddText:     { color: "#fff", fontWeight: "700", fontSize: 13 },
  noTaskText:      { color: colors.textMuted, fontSize: 13, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 6 },
  editTaskRow:     { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight, backgroundColor: colors.bg },
  editTaskInput:   { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surface },
  editActionsRow:  { flexDirection: "row", gap: 8, marginTop: 8 },
  editSaveBtn:     { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8 },
  editSaveText:    { color: "#fff", fontWeight: "700", fontSize: 12 },
  editCancelBtn:   { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 8 },
  editCancelText:  { color: colors.textSecondary, fontWeight: "700", fontSize: 12 },
  actionRow:       { flexDirection: "row", gap: 12, marginBottom: 12 },
  actionBtn:       { flex: 1, borderRadius: radius.md, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  actionBtnPrimary:{ backgroundColor: colors.primary, ...shadow.primary },
  actionBtnPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  actionBtnSecondary:   { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary, ...shadow.sm },
  actionBtnSecondaryText: { color: colors.primary, fontWeight: "700", fontSize: 15 },
  deleteBtn:       { borderRadius: radius.md, paddingVertical: 13, alignItems: "center", borderWidth: 1.5, borderColor: colors.danger },
  deleteBtnText:   { color: colors.danger, fontWeight: "600", fontSize: 15 },
});