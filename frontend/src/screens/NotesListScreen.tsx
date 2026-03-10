import React, { useEffect, useLayoutEffect, useState, useCallback } from "react";
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
import { colors, radius, shadow, CATEGORY_META } from "../theme";

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={{ paddingHorizontal: 4 }} activeOpacity={0.7}>
          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "600" }}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, logout]);

  const handleSearch = () => load(activeCategory, search);
  const clearSearch = () => {
    setSearch("");
    setActiveCategory(undefined);
    fetchNotes({});
  };

  const renderItem = ({ item }: { item: Note }) => {
    const meta = item.ai_category ? CATEGORY_META[item.ai_category] : null;
    const accentColor = meta?.bar ?? colors.border;
    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => navigation.navigate("NoteDetail", { noteId: item.id })}
        activeOpacity={0.75}
      >
        <View style={[s.cardAccent, { backgroundColor: accentColor }]} />
        <View style={s.cardContent}>
          <View style={s.cardRow}>
            <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
            {item.ai_category && <CategoryBadge category={item.ai_category} />}
          </View>
          <Text style={s.cardBody} numberOfLines={2}>
            {item.ai_summary || item.content}
          </Text>
          <Text style={s.cardDate}>{new Date(item.updated_at).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Search + chips */}
      <View style={s.searchBar}>
        <View style={s.searchRow}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search notes…"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {(search || activeCategory) && (
            <TouchableOpacity style={s.clearBtn} onPress={clearSearch}>
              <Text style={s.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(c) => c}
          contentContainerStyle={{ paddingTop: 10, gap: 8 }}
          renderItem={({ item: cat }) => {
            const isActive = activeCategory === cat;
            const catColor = CATEGORY_META[cat]?.bar ?? colors.primary;
            return (
              <TouchableOpacity
                style={[
                  s.chip,
                  isActive && { backgroundColor: catColor, borderColor: catColor },
                ]}
                onPress={() => setActiveCategory((p) => (p === cat ? undefined : cat))}
              >
                <Text style={[s.chipText, isActive && { color: "#fff" }]}>
                  {CATEGORY_META[cat]?.icon} {cat.replace("#", "")}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {isLoading && notes.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(n) => n.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={() => load(activeCategory, search)} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>📝</Text>
              <Text style={s.emptyTitle}>No notes yet</Text>
              <Text style={s.emptyHint}>Tap + to create your first note</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate("NoteForm", {})} activeOpacity={0.85}>
        <Text style={{ color: "#fff", fontSize: 28, lineHeight: 32, fontWeight: "300" }}>+</Text>
      </TouchableOpacity>

    </View>
  );
}

const s = StyleSheet.create({
  searchBar:   { backgroundColor: colors.surface, paddingHorizontal: 16, paddingBottom: 12, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight, ...shadow.sm },
  searchRow:   { flexDirection: "row", alignItems: "center", backgroundColor: colors.bg, borderRadius: radius.md, paddingHorizontal: 12, gap: 8 },
  searchIcon:  { fontSize: 15 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: colors.textPrimary },
  clearBtn:    { padding: 4 },
  clearText:   { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  chip:        { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  chipText:    { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  card:        { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: 12, flexDirection: "row", overflow: "hidden", ...shadow.sm },
  cardAccent:  { width: 4 },
  cardContent: { flex: 1, padding: 14 },
  cardRow:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 },
  cardTitle:   { fontSize: 15, fontWeight: "700", color: colors.textPrimary, flex: 1, marginRight: 8 },
  cardBody:    { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 6 },
  cardDate:    { fontSize: 11, color: colors.textMuted },
  fab:         { position: "absolute", bottom: 28, right: 24, backgroundColor: colors.primary, width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", ...shadow.primary },
  emptyState:  { alignItems: "center", marginTop: 80 },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyTitle:  { fontSize: 17, fontWeight: "600", color: colors.textSecondary, marginBottom: 4 },
  emptyHint:   { fontSize: 13, color: colors.textMuted },
});