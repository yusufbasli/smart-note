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
import { colors, radius, shadow } from "../theme";

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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Hero Header */}
        <View style={s.hero}>
          <View style={s.heroIconWrap}>
            <Text style={{ fontSize: 36 }}>📝</Text>
          </View>
          <Text style={s.heroTitle}>Smart Note</Text>
          <Text style={s.heroSub}>Create your account</Text>
        </View>

        {/* Form Card */}
        <View style={s.card}>
          <Text style={s.cardHeading}>Sign Up</Text>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={s.field}>
            <Text style={s.label}>Username</Text>
            <TextInput
              style={s.input}
              placeholder="letters, numbers, underscores"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Email</Text>
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <TextInput
              style={s.input}
              placeholder="min 8 characters"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleRegister}
              returnKeyType="go"
            />
          </View>

          <TouchableOpacity
            style={[s.btn, busy && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={busy}
          >
            {busy
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Create Account</Text>
            }
          </TouchableOpacity>

          <View style={s.footer}>
            <Text style={s.footerText}>Already have an account? </Text>
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
  hero:        { backgroundColor: colors.primaryDark, paddingTop: 72, paddingBottom: 60, alignItems: "center" },
  heroIconWrap:{ width: 76, height: 76, borderRadius: radius.xl, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  heroTitle:   { fontSize: 30, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  heroSub:     { color: "rgba(255,255,255,0.65)", marginTop: 6, fontSize: 14 },
  card:        { flex: 1, backgroundColor: colors.bg, marginTop: -28, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 28, paddingTop: 36, paddingBottom: 32 },
  cardHeading: { fontSize: 22, fontWeight: "700", color: colors.textPrimary, marginBottom: 24 },
  field:       { marginBottom: 16 },
  label:       { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 },
  input:       { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, backgroundColor: colors.surface, color: colors.textPrimary },
  btn:         { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: "center", marginTop: 8, ...shadow.primary },
  btnText:     { color: "#fff", fontWeight: "700", fontSize: 16, letterSpacing: 0.3 },
  footer:      { flexDirection: "row", justifyContent: "center", marginTop: 28 },
  footerText:  { color: colors.textMuted },
  link:        { color: colors.primary, fontWeight: "700" },
  errorBox:    { backgroundColor: colors.dangerLight, borderRadius: radius.sm, padding: 12, marginBottom: 16 },
  errorText:   { color: colors.danger, fontSize: 13, lineHeight: 18 },
});
