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

  useEffect(() => {
    load(activeCategory, search);
  }, [activeCategory]);

  const handleSearch = () => load(activeCategory, search);
  const clearSearch = () => {
    setSearch("");
    setActiveCategory(undefined);
    fetchNotes({});
  };

  const renderItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
      onPress={() => navigation.navigate("NoteDetail", { noteId: item.id })}
    >
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-base font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>
          {item.title}
        </Text>
        {item.ai_category && <CategoryBadge category={item.ai_category} />}
      </View>
      {item.ai_summary ? (
        <Text className="text-sm text-gray-500 mb-1" numberOfLines={2}>
          {item.ai_summary}
        </Text>
      ) : (
        <Text className="text-sm text-gray-400 mb-1" numberOfLines={2}>
          {item.content}
        </Text>
      )}
      <Text className="text-xs text-gray-300 mt-1">
        {new Date(item.updated_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search bar */}
      <View className="bg-white px-4 pb-3 pt-2 border-b border-gray-100">
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-sm text-gray-800"
            placeholder="Search notes…"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {(search || activeCategory) && (
            <TouchableOpacity
              className="bg-gray-200 rounded-xl px-3 justify-center"
              onPress={clearSearch}
            >
              <Text className="text-gray-600 text-sm">Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category filter chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(c) => c}
          contentContainerStyle={{ paddingTop: 8, gap: 8 }}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              className={`px-3 py-1 rounded-full border ${
                activeCategory === cat
                  ? "bg-primary-600 border-primary-600"
                  : "bg-white border-gray-300"
              }`}
              onPress={() =>
                setActiveCategory((prev) => (prev === cat ? undefined : cat))
              }
            >
              <Text
                className={`text-xs font-medium ${
                  activeCategory === cat ? "text-white" : "text-gray-600"
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List */}
      {isLoading && notes.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(n) => n.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => load(activeCategory, search)}
            />
          }
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Text className="text-4xl mb-3">📝</Text>
              <Text className="text-gray-400 text-base">No notes yet</Text>
              <Text className="text-gray-300 text-sm mt-1">
                Tap + to create your first note
              </Text>
            </View>
          }
        />
      )}

      {/* FAB create */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-primary-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => navigation.navigate("NoteForm", {})}
      >
        <Text className="text-white text-3xl leading-none">+</Text>
      </TouchableOpacity>

      {/* Logout (header right via useLayoutEffect would be cleaner, but inline is fine) */}
      <TouchableOpacity
        className="absolute top-2 right-4"
        onPress={logout}
      >
        <Text className="text-primary-600 text-sm font-medium">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
