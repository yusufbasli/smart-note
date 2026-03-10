import React, { useState } from "react";
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
import { useAuthStore } from "../store/authStore";
import type { AuthScreenProps } from "../navigation/types";

export default function RegisterScreen({ navigation }: AuthScreenProps<"Register">) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const register = useAuthStore((s) => s.register);

  const handleRegister = async () => {
    setError("");
    if (!username.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setBusy(true);
    try {
      await register(username.trim(), email.trim(), password);
    } catch (e: any) {
      console.error("Register error:", e);
      const detail = e?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => d?.msg ?? "").join("\n")
        : detail ?? "Registration failed.";
      setError(msg);
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
            <Text style={s.subtitle}>Create your account</Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            {error ? <Text style={s.errorBox}>{error}</Text> : null}
            <View>
              <Text style={s.label}>Username</Text>
              <TextInput
                style={s.input}
                placeholder="letters, numbers, underscores"
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View>
              <Text style={s.label}>Email</Text>
              <TextInput
                style={s.input}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View>
              <Text style={s.label}>Password</Text>
              <TextInput
                style={s.input}
                placeholder="min 8 characters"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={[s.btn, busy && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={{ color: "#6b7280" }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={s.link}>Sign In</Text>
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
  errorBox:  { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fca5a5", borderRadius: 8, padding: 12, color: "#dc2626", fontSize: 14 },
});
