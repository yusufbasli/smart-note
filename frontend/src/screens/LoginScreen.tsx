import React, { useState } from "react";
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
import { useAuthStore } from "../store/authStore";
import type { AuthScreenProps } from "../navigation/types";

export default function LoginScreen({ navigation }: AuthScreenProps<"Login">) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert("Validation", "Please fill in all fields.");
      return;
    }
    setBusy(true);
    try {
      await login(identifier.trim(), password);
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ?? "Login failed. Check your credentials.";
      Alert.alert("Error", msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.container}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Smart Note</Text>
            <Text style={s.subtitle}>Sign in to your account</Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            <View>
              <Text style={s.label}>Username or Email</Text>
              <TextInput
                style={s.input}
                placeholder="username or email"
                autoCapitalize="none"
                autoCorrect={false}
                value={identifier}
                onChangeText={setIdentifier}
              />
            </View>

            <View>
              <Text style={s.label}>Password</Text>
              <TextInput
                style={s.input}
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={[s.btn, busy && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={{ color: "#6b7280" }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={s.link}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24, justifyContent: "center" },
  header:    { marginBottom: 40, alignItems: "center" },
  title:     { fontSize: 28, fontWeight: "700", color: "#2563eb" },
  subtitle:  { color: "#9ca3af", marginTop: 4 },
  form:      { gap: 16 },
  label:     { fontSize: 13, fontWeight: "500", color: "#374151", marginBottom: 4 },
  input:     { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, backgroundColor: "#f9fafb" },
  btn:       { backgroundColor: "#2563eb", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  btnText:   { color: "#fff", fontWeight: "700", fontSize: 15 },
  footer:    { flexDirection: "row", justifyContent: "center", marginTop: 32 },
  link:      { color: "#2563eb", fontWeight: "600" },
});
