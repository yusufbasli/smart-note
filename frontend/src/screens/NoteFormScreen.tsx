import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useNotesStore } from "../store/notesStore";
import type { NotesScreenProps } from "../navigation/types";

export default function NoteFormScreen({ navigation, route }: NotesScreenProps<"NoteForm">) {
  const { noteId } = route.params ?? {};
  const { currentNote, fetchNote, createNote, updateNote, isLoading } = useNotesStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (noteId) fetchNote(noteId);
  }, [noteId]);

  useEffect(() => {
    if (noteId && currentNote?.id === noteId) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
    }
  }, [currentNote, noteId]);

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert("Validation", "Title is required."); return; }
    if (!content.trim()) { Alert.alert("Validation", "Content is required."); return; }
    try {
      if (noteId) {
        await updateNote(noteId, { title: title.trim(), content: content.trim() });
        navigation.goBack();
      } else {
        const note = await createNote(title.trim(), content.trim());
        navigation.replace("NoteDetail", { noteId: note.id });
      }
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => d?.msg ?? "").join("\n")
        : detail ?? "Save failed.";
      Alert.alert("Error", msg);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        style={{ flex: 1, backgroundColor: "#fff" }}
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.label}>Title</Text>
        <TextInput
          style={s.input}
          placeholder="Note title"
          value={title}
          onChangeText={setTitle}
          maxLength={255}
        />

        <Text style={[s.label, { marginTop: 16 }]}>Content</Text>
        <TextInput
          style={[s.input, s.textarea]}
          placeholder="Write your note here…"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={12}
          textAlignVertical="top"
          maxLength={50000}
        />

        <TouchableOpacity
          style={[s.btn, isLoading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>{noteId ? "Save Changes" : "Create Note"}</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  label:   { fontSize: 13, fontWeight: "500", color: "#374151", marginBottom: 4 },
  input:   { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, backgroundColor: "#f9fafb" },
  textarea:{ minHeight: 200 },
  btn:     { backgroundColor: "#2563eb", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 24 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});