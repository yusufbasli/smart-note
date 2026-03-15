import React from "react";
import { useWindowDimensions } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NotesStackParamList } from "./types";
import NotesListScreen from "../screens/NotesListScreen";
import NoteDetailScreen from "../screens/NoteDetailScreen";
import NoteFormScreen from "../screens/NoteFormScreen";
import DesktopHeader from "../components/DesktopHeader";
import { colors, layout } from "../theme";

const Stack = createNativeStackNavigator<NotesStackParamList>();

export default function NotesStack() {
  const { width } = useWindowDimensions();
  const isDesktop  = width >= layout.desktopBreakpoint;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDesktop ? colors.surface : colors.primary,
        },
        headerTintColor:  isDesktop ? colors.textPrimary : "#fff",
        headerTitleStyle: { fontWeight: "800", fontSize: 17 },
        headerShadowVisible: !isDesktop,
      }}
    >
      <Stack.Screen
        name="NotesList"
        component={NotesListScreen}
        options={isDesktop
          ? { header: () => <DesktopHeader activeTab="notes" /> }
          : { title: "My Notes" }
        }
      />
      <Stack.Screen name="NoteDetail" component={NoteDetailScreen} options={{ title: "" }} />
      <Stack.Screen
        name="NoteForm"
        component={NoteFormScreen}
        options={({ route }) => ({
          title:           route.params?.noteId ? "Edit Note" : "New Note",
          presentation:    "modal",
          animation:       "slide_from_bottom",
          headerStyle:     { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
        })}
      />
    </Stack.Navigator>
  );
}
