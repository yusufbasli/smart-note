import React, { useEffect, useLayoutEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  RefreshControl, ActivityIndicator, StyleSheet, useWindowDimensions,
} from "react-native";
import { useNotesStore } from "../store/notesStore";
import { useAuthStore } from "../store/authStore";
import CategoryBadge from "../components/CategoryBadge";
import type { NotesScreenProps } from "../navigation/types";
import type { Note } from "../types/api";
import { colors, radius, shadow, CATEGORY_META, layout } from "../theme";

const CATEGORIES = Object.keys(CATEGORY_META);

export default function NotesListScreen({ navigation }: NotesScreenProps<"NotesList">) {
  const { notes, isLoading, fetchNotes } = useNotesStore();
  const logout = useAuthStore((s) => s.logout);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | undefined>();

  const { width } = useWindowDimensions();
  const isDesktop  = width >= layout.desktopBreakpoint;
  const numCols    = isDesktop ? 2 : 1;

  const load = useCallback(
    (cat?: string, q?: string) => fetchNotes({ category: cat, search: q || undefined }),
    [fetchNotes]
  );

  useEffect(() => { load(activeCategory, search); }, [activeCategory]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={{ paddingHorizontal: 4 }} activeOpacity={0.7}>
          <Text style={s.headerLogout}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, logout]);

  const handleSearch = () => load(activeCategory, search);
  const clearSearch  = () => { setSearch(""); setActiveCategory(undefined); fetchNotes({}); };

  const renderItem = ({ item, index }: { item: Note; index: number }) => {
    const meta   = item.ai_category ? CATEGORY_META[item.ai_category] : null;
    const accent = meta?.bar ?? colors.borderLight;
    return (
      <TouchableOpacity
        style={[s.card, isDesktop && { flex: 1, marginLeft: index % 2 === 1 ? 8 : 0 }]}
        onPress={() => navigation.navigate("NoteDetail", { noteId: item.id })}
        activeOpacity={0.72}
      >
        <View style={[s.cardAccent, { backgroundColor: accent }]} />
        <View style={s.cardBody}>
          <View style={s.cardRow}>
            <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
            {item.ai_category && <CategoryBadge category={item.ai_category} />}
          </View>
          <Text style={s.cardSnippet} numberOfLines={2}>{item.ai_summary || item.content}</Text>
          <Text style={s.cardDate}>
            {new Date(item.updated_at).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.root}>
      {/* Search + chips */}
      <View style={s.topBar}>
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
              <Text style={s.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={CATEGORIES} keyExtractor={(c) => c}
          contentContainerStyle={s.chipsRow}
          renderItem={({ item: cat }) => {
            const on  = activeCategory === cat;
            const clr = CATEGORY_META[cat]?.bar ?? colors.primary;
            return (
              <TouchableOpacity
                style={[s.chip, on && { backgroundColor: clr, borderColor: clr }]}
                onPress={() => setActiveCategory((p) => (p === cat ? undefined : cat))}
              >
                <Text style={[s.chipText, on && { color: "#fff" }]}>
                  {CATEGORY_META[cat]?.icon}  {cat.replace("#", "")}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {isLoading && notes.length === 0 ? (
        <View style={s.centerd}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          key={numCols}
          data={notes}
          keyExtractor={(n) => n.id}
          numColumns={numCols}
          renderItem={renderItem}
          contentContainerStyle={[
            s.listContent,
            isDesktop && { maxWidth: layout.contentMaxWidth, alignSelf: "center", width: "100%" },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => load(activeCategory, search)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📝</Text>
              <Text style={s.emptyTitle}>No notes yet</Text>
              <Text style={s.emptyHint}>Tap + to create your first note</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate("NoteForm", {})}
        activeOpacity={0.85}
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: colors.bg },
  centerd:     { flex: 1, alignItems: "center", justifyContent: "center" },
  headerLogout:{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "600" },

  topBar: {
    backgroundColor: colors.surface, paddingHorizontal: 16,
    paddingTop: 12, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight, ...shadow.xs,
  },
  searchRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.bg, borderRadius: radius.md,
    paddingHorizontal: 12, gap: 8, marginBottom: 10,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  searchIcon:  { fontSize: 14 },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: colors.textPrimary },
  clearBtn:    { padding: 4 },
  clearIcon:   { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  chipsRow:    { flexDirection: "row", gap: 8, paddingBottom: 2 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.full, borderWidth: 1.5,
    borderColor: colors.border, backgroundColor: colors.surface,
  },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },

  listContent: { padding: 16, paddingBottom: 100 },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    marginBottom: 12, flexDirection: "row", overflow: "hidden", ...shadow.sm,
  },
  cardAccent:  { width: 4 },
  cardBody:    { flex: 1, padding: 15 },
  cardRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 6,
  },
  cardTitle:   { fontSize: 15, fontWeight: "700", color: colors.textPrimary, flex: 1, marginRight: 8 },
  cardSnippet: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 8 },
  cardDate:    { fontSize: 11, color: colors.textMuted },

  empty:     { alignItems: "center", marginTop: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 14 },
  emptyTitle:{ fontSize: 17, fontWeight: "600", color: colors.textSecondary, marginBottom: 4 },
  emptyHint: { fontSize: 13, color: colors.textMuted },

  fab: {
    position: "absolute", bottom: 28, right: 24,
    backgroundColor: colors.primary, width: 58, height: 58, borderRadius: 29,
    alignItems: "center", justifyContent: "center", ...shadow.primary,
  },
  fabText: { color: "#fff", fontSize: 30, lineHeight: 34, fontWeight: "300", marginTop: -2 },
});
