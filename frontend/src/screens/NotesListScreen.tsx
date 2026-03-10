import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNotesStore } from "../store/notesStore";
import { useAuthStore } from "../store/authStore";
import CategoryBadge from "../components/CategoryBadge";
import type { NotesScreenProps } from "../navigation/types";
import type { Note } from "../types/api";

const CATEGORIES = ["#work", "#school", "#personal", "#health", "#finance", "#other"];

export default function NotesListScreen({ navigation }: NotesScreenProps<"NotesList">) {
  const { notes, isLoading, fetchNotes } = useNotesStore();
  const logout = useAuthStore((s) => s.logout);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | undefined>();

  const load = useCallback(
    (cat?: string, q?: string) => fetchNotes({ category: cat, search: q || undefined }),
    [fetchNotes]
  );

  useEffect(() => { load(activeCategory, search); }, [activeCategory]);

  const handleSearch = () => load(activeCategory, search);
  const clearSearch = () => {
    setSearch("");
    setActiveCategory(undefined);
    fetchNotes({});
  };

  const renderItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={s.card}
      onPress={() => navigation.navigate("NoteDetail", { noteId: item.id })}
    >
      <View style={s.cardRow}>
        <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
        {item.ai_category && <CategoryBadge category={item.ai_category} />}
      </View>
      <Text style={s.cardBody} numberOfLines={2}>
        {item.ai_summary || item.content}
      </Text>
      <Text style={s.cardDate}>{new Date(item.updated_at).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Search bar */}
      <View style={s.searchBar}>
        <View style={s.searchRow}>
          <TextInput
            style={s.searchInput}
            placeholder="Search notes…"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {(search || activeCategory) && (
            <TouchableOpacity style={s.clearBtn} onPress={clearSearch}>
              <Text style={{ color: "#6b7280", fontSize: 13 }}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Category chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(c) => c}
          contentContainerStyle={{ paddingTop: 8, gap: 8 }}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              style={[s.chip, activeCategory === cat && s.chipActive]}
              onPress={() => setActiveCategory((p) => (p === cat ? undefined : cat))}
            >
              <Text style={[s.chipText, activeCategory === cat && { color: "#fff" }]}>{cat}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading && notes.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(n) => n.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={() => load(activeCategory, search)} />
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 80 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📝</Text>
              <Text style={{ color: "#9ca3af", fontSize: 16 }}>No notes yet</Text>
              <Text style={{ color: "#d1d5db", fontSize: 13, marginTop: 4 }}>Tap + to create your first note</Text>
            </View>
          }
        />
      )}

      {/* FAB create */}
      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate("NoteForm", {})}>
        <Text style={{ color: "#fff", fontSize: 28, lineHeight: 32 }}>+</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={{ color: "#2563eb", fontSize: 13, fontWeight: "500" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  searchBar:   { backgroundColor: "#fff", paddingHorizontal: 16, paddingBottom: 12, paddingTop: 8, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  searchRow:   { flexDirection: "row", gap: 8 },
  searchInput: { flex: 1, backgroundColor: "#f3f4f6", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, fontSize: 14, color: "#1f2937" },
  clearBtn:    { backgroundColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 12, justifyContent: "center" },
  chip:        { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#fff" },
  chipActive:  { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  chipText:    { fontSize: 12, fontWeight: "500", color: "#4b5563" },
  card:        { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: "#f3f4f6" },
  cardRow:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  cardTitle:   { fontSize: 15, fontWeight: "600", color: "#111827", flex: 1, marginRight: 8 },
  cardBody:    { fontSize: 13, color: "#9ca3af", marginBottom: 4 },
  cardDate:    { fontSize: 11, color: "#d1d5db" },
  fab:         { position: "absolute", bottom: 24, right: 24, backgroundColor: "#2563eb", width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", shadowColor: "#2563eb", shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  logoutBtn:   { position: "absolute", top: 8, right: 16 },
});