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
} from "react-native";
import { useNotesStore } from "../store/notesStore";
import CategoryBadge from "../components/CategoryBadge";
import TaskItem from "../components/TaskItem";
import type { NotesScreenProps } from "../navigation/types";

export default function NoteDetailScreen({ navigation, route }: NotesScreenProps<"NoteDetail">) {
  const { noteId } = route.params;
  const { currentNote, fetchNote, deleteNote, analyzeNote, toggleTask, isLoading } =
    useNotesStore();
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => { fetchNote(noteId); }, [noteId]);

  useEffect(() => {
    if (currentNote) navigation.setOptions({ title: currentNote.title });
  }, [currentNote?.title]);

  const handleDelete = () => {
    Alert.alert("Delete Note", "This will also delete all tasks. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => { await deleteNote(noteId); navigation.goBack(); },
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

  if (isLoading && !currentNote) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }
  if (!currentNote) return null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f9fafb" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchNote(noteId)} />}
    >
      {/* Title + category */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <Text style={s.noteTitle}>{currentNote.title}</Text>
        {currentNote.ai_category && <CategoryBadge category={currentNote.ai_category} />}
      </View>
      <Text style={s.dateText}>Updated {new Date(currentNote.updated_at).toLocaleString()}</Text>

      {/* AI Summary */}
      {currentNote.ai_summary && (
        <View style={s.summaryBox}>
          <Text style={s.summaryLabel}>AI SUMMARY</Text>
          <Text style={s.summaryText}>{currentNote.ai_summary}</Text>
        </View>
      )}

      {/* Content */}
      <View style={s.contentBox}>
        <Text style={s.contentText}>{currentNote.content}</Text>
      </View>

      {/* Tasks */}
      {currentNote.tasks.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={s.tasksHeader}>
            Tasks ({currentNote.tasks.filter((t) => !t.is_completed).length} remaining)
          </Text>
          <View style={s.tasksList}>
            {currentNote.tasks.map((task, i) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => toggleTask(noteId, task)}
                showBorder={i < currentNote.tasks.length - 1}
              />
            ))}
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={{ gap: 12 }}>
        <TouchableOpacity style={s.btnPrimary} onPress={() => navigation.navigate("NoteForm", { noteId })}>
          <Text style={s.btnPrimaryText}>Edit Note</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.btnOutline} onPress={handleAnalyze} disabled={analyzing}>
          {analyzing
            ? <ActivityIndicator size="small" color="#2563eb" />
            : <Text style={s.btnOutlineText}>✨ Re-analyze with AI</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={s.btnDanger} onPress={handleDelete}>
          <Text style={s.btnDangerText}>Delete Note</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  noteTitle:    { fontSize: 22, fontWeight: "700", color: "#111827", flex: 1, marginRight: 8 },
  dateText:     { fontSize: 11, color: "#9ca3af", marginBottom: 16 },
  summaryBox:   { backgroundColor: "#eff6ff", borderWidth: 1, borderColor: "#bfdbfe", borderRadius: 12, padding: 16, marginBottom: 16 },
  summaryLabel: { fontSize: 11, fontWeight: "700", color: "#2563eb", marginBottom: 4 },
  summaryText:  { fontSize: 13, color: "#374151" },
  contentBox:   { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 16, marginBottom: 16 },
  contentText:  { fontSize: 15, color: "#1f2937", lineHeight: 24 },
  tasksHeader:  { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 },
  tasksList:    { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, overflow: "hidden" },
  btnPrimary:   { backgroundColor: "#2563eb", borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  btnPrimaryText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  btnOutline:   { backgroundColor: "#fff", borderWidth: 1, borderColor: "#2563eb", borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  btnOutlineText: { color: "#2563eb", fontWeight: "600", fontSize: 15 },
  btnDanger:    { backgroundColor: "#fff", borderWidth: 1, borderColor: "#fca5a5", borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  btnDangerText:  { color: "#ef4444", fontWeight: "600", fontSize: 15 },
});