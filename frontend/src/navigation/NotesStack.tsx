import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NotesStackParamList } from "./types";
import NotesListScreen from "../screens/NotesListScreen";
import NoteDetailScreen from "../screens/NoteDetailScreen";
import NoteFormScreen from "../screens/NoteFormScreen";
import { colors } from "../theme";

const Stack = createNativeStackNavigator<NotesStackParamList>();

export default function NotesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "800", fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="NotesList"
        component={NotesListScreen}
        options={{ title: "My Notes" }}
      />
      <Stack.Screen
        name="NoteDetail"
        component={NoteDetailScreen}
        options={{ title: "Note" }}
      />
      <Stack.Screen
        name="NoteForm"
        component={NoteFormScreen}
        options={({ route }) => ({
          title: route.params?.noteId ? "Edit Note" : "New Note",
        })}
      />
    </Stack.Navigator>
  );
}
