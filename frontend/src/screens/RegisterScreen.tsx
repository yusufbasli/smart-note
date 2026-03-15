import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, useWindowDimensions,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import type { AuthScreenProps } from "../navigation/types";
import { colors, radius, shadow } from "../theme";

export default function RegisterScreen({ navigation }: AuthScreenProps<"Register">) {
  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState("");
  const register = useAuthStore((s) => s.register);

  const { width } = useWindowDimensions();
  const isDesktop  = width >= 768;

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
      setError(
        Array.isArray(detail)
          ? detail.map((d: any) => d?.msg ?? "").join("\n")
          : detail ?? "Registration failed."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={s.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[s.scroll, isDesktop && s.scrollDesktop]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand panel */}
          <View style={[s.brand, isDesktop && s.brandDesktop]}>
            <View style={s.brandIcon}><Text style={{ fontSize: 28 }}>📝</Text></View>
            <Text style={s.brandTitle}>Smart Note</Text>
            <Text style={s.brandSub}>Create your free account</Text>
            {isDesktop && (
              <View style={s.features}>
                {[
                  "🔒  Secure & private",
                  "✨  AI analysis on every note",
                  "✅  Recurring task support",
                  "📊  Personal analytics dashboard",
                ].map((f) => <Text key={f} style={s.featItem}>{f}</Text>)}
              </View>
            )}
          </View>

          {/* Form card */}
          <View style={[s.card, isDesktop && s.cardDesktop]}>
            <Text style={s.cardTitle}>Create account</Text>
            <Text style={s.cardSub}>Free forever — no credit card needed</Text>

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
              <Text style={s.footerText}>Already have an account?  </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={s.link}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: colors.navy },
  scroll:       { flexGrow: 1, justifyContent: "flex-end" },
  scrollDesktop:{
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    minHeight: "100%" as any, padding: 48,
  },

  brand: { paddingTop: 80, paddingBottom: 52, paddingHorizontal: 32, alignItems: "center" },
  brandDesktop: {
    flex: 1, maxWidth: 420, paddingTop: 0, paddingHorizontal: 0, alignItems: "flex-start",
  },
  brandIcon: {
    width: 70, height: 70, borderRadius: radius.xl,
    backgroundColor: "rgba(99,102,241,0.25)",
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  brandTitle: { fontSize: 36, fontWeight: "900", color: "#fff", letterSpacing: 0.3, marginBottom: 8 },
  brandSub:   { color: "rgba(255,255,255,0.5)", fontSize: 15 },
  features:   { marginTop: 44, gap: 18 },
  featItem:   { color: "rgba(255,255,255,0.68)", fontSize: 15, lineHeight: 22 },

  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 28, paddingTop: 36, paddingBottom: 44,
  },
  cardDesktop: { borderRadius: 20, width: 420, marginLeft: 64, ...shadow.md },
  cardTitle: { fontSize: 26, fontWeight: "800", color: colors.textPrimary, letterSpacing: 0.2 },
  cardSub:   { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 28 },

  field: { marginBottom: 18 },
  label: {
    fontSize: 11, fontWeight: "700", color: colors.textSecondary,
    marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.7,
  },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, backgroundColor: colors.bg, color: colors.textPrimary,
  },

  btn:     {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 16, alignItems: "center", marginTop: 8, ...shadow.primary,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16, letterSpacing: 0.3 },

  footer:     { flexDirection: "row", justifyContent: "center", marginTop: 28, flexWrap: "wrap" },
  footerText: { color: colors.textMuted, fontSize: 14 },
  link:       { color: colors.primary, fontWeight: "700", fontSize: 14 },

  errorBox: {
    backgroundColor: colors.dangerLight, borderRadius: radius.sm,
    padding: 12, marginBottom: 20,
    borderLeftWidth: 3, borderLeftColor: colors.danger,
  },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 18 },
});
