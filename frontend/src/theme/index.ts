// ─── Global Design Tokens ────────────────────────────────────────────────────

export const colors = {
  // Brand
  primary:    "#4F46E5",
  primaryDark:"#3730A3",
  primaryLight:"#818CF8",
  accent:     "#7C3AED",

  // Semantic
  success:    "#059669",
  warning:    "#D97706",
  danger:     "#DC2626",
  dangerLight:"#FEE2E2",

  // Neutrals
  bg:         "#F8FAFC",
  surface:    "#FFFFFF",
  border:     "#E2E8F0",
  borderLight:"#F1F5F9",

  // Text
  textPrimary:  "#0F172A",
  textSecondary:"#475569",
  textMuted:    "#94A3B8",
  textInverse:  "#FFFFFF",
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadow = {
  sm: {
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  primary: {
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const CATEGORY_META: Record<string, { bg: string; text: string; bar: string; icon: string }> = {
  "#work":     { bg: "#EEF2FF", text: "#4338CA", bar: "#4F46E5", icon: "💼" },
  "#school":   { bg: "#F5F3FF", text: "#6D28D9", bar: "#7C3AED", icon: "📚" },
  "#personal": { bg: "#ECFDF5", text: "#065F46", bar: "#059669", icon: "🌿" },
  "#health":   { bg: "#FFF1F2", text: "#9F1239", bar: "#E11D48", icon: "❤️" },
  "#finance":  { bg: "#FFFBEB", text: "#92400E", bar: "#D97706", icon: "💰" },
  "#other":    { bg: "#F8FAFC", text: "#475569", bar: "#94A3B8", icon: "📌" },
};
