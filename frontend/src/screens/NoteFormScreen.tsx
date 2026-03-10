import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useNotesStore } from "../store/notesStore";
import type { NotesScreenProps } from "../navigation/types";
import { colors, radius, shadow, CATEGORY_META } from "../theme";

const CATEGORIES = Object.keys(CATEGORY_META) as (keyof typeof CATEGORY_META)[];

export default function NoteFormScreen({ navigation, route }: NotesScreenProps<"NoteForm">) {
  const { noteId } = route.params ?? {};
  const { currentNote, fetchNote, createNote, updateNote, isLoading } = useNotesStore();

  const [title,    setTitle]    = useState("");
  const [content,  setContent]  = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (noteId) fetchNote(noteId);
  }, [noteId]);

  useEffect(() => {
    if (noteId && currentNote?.id === noteId) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setCategory(currentNote.ai_category ?? null);
    }
  }, [currentNote, noteId]);

  const handleSave = async () => {
    setError("");
    if (!title.trim()) { setError("Title is required."); return; }
    if (!content.trim()) { setError("Content is required."); return; }
    try {
      if (noteId) {
        await updateNote(noteId, {
          title: title.trim(),
          content: content.trim(),
          ai_category: category,
        });
        navigation.goBack();
      } else {
        const note = await createNote(title.trim(), content.trim(), category ?? undefined);
        navigation.replace("NoteDetail", { noteId: note.id });
      }
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => d?.msg ?? "").join("\n")
        : detail ?? "Save failed.";
      setError(msg);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {error ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={s.fieldGroup}>
          <Text style={s.label}>Title</Text>
          <TextInput
            style={s.input}
            placeholder="Note title"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={255}
          />
          <Text style={s.counter}>{title.length}/255</Text>
        </View>

        {/* Category Picker */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Category  <Text style={s.labelHint}>(AI assigns if left unselected)</Text></Text>
          <View style={s.categoryRow}>
            {CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat];
              const active = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    s.catPill,
                    active ? { backgroundColor: meta.bar, borderColor: meta.bar } : { backgroundColor: meta.bg, borderColor: meta.bar },
                  ]}
                  onPress={() => setCategory(active ? null : cat)}
                >
                  <Text style={s.catPillIcon}>{meta.icon}</Text>
                  <Text style={[s.catPillText, { color: active ? "#fff" : meta.text }]}>
                    {cat.replace("#", "")}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={s.fieldGroup}>
          <View style={s.labelRow}>
            <Text style={s.label}>Content</Text>
            <Text style={s.counter}>{content.length.toLocaleString()} / 50,000</Text>
          </View>
          <TextInput
            style={[s.input, s.textarea]}
            placeholder="Write your note hereâ€¦"
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={14}
            textAlignVertical="top"
            maxLength={50000}
          />
        </View>

        <TouchableOpacity
          style={[s.btn, isLoading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>{noteId ? "Save Changes" : "Create & Analyze"}</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  fieldGroup:  { marginBottom: 20 },
  labelRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 },
  label:       { fontSize: 13, fontWeight: "700", color: colors.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  labelHint:   { fontSize: 11, fontWeight: "400", color: colors.textMuted, textTransform: "none", letterSpacing: 0 },
  counter:     { fontSize: 11, color: colors.textMuted, textAlign: "right", marginTop: 4 },
  input:       { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, backgroundColor: colors.surface, color: colors.textPrimary },
  textarea:    { minHeight: 220, lineHeight: 24 },
  btn:         { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: "center", marginTop: 8, ...shadow.primary },
  btnText:     { color: "#fff", fontWeight: "700", fontSize: 16, letterSpacing: 0.3 },
  errorBox:    { backgroundColor: colors.dangerLight, borderRadius: radius.sm, padding: 12, marginBottom: 16 },
  errorText:   { color: colors.danger, fontSize: 13, lineHeight: 18 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catPill:     { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 7, gap: 5 },
  catPillIcon: { fontSize: 14 },
  catPillText: { fontSize: 13, fontWeight: "600" },
});

