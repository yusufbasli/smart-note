export const colors = {
  // Brand — indigo
  primary:      "#6366F1",
  primaryDark:  "#4338CA",
  primaryDeep:  "#3730A3",
  primaryLight: "#A5B4FC",
  primaryBg:    "#EEF2FF",

  // Dark backgrounds (hero, sidebar)
  navy:      "#0F172A",
  navyMid:   "#1E293B",
  navyLight: "#334155",

  // Accent
  accent: "#8B5CF6",

  // Semantic
  success:    "#10B981",
  successBg:  "#D1FAE5",
  warning:    "#F59E0B",
  danger:     "#EF4444",
  dangerLight:"#FEE2E2",
  dangerBg:   "#FEE2E2",

  // Surfaces
  bg:         "#F8FAFC",
  bgAlt:      "#F1F5F9",
  surface:    "#FFFFFF",
  border:     "#E2E8F0",
  borderLight:"#F1F5F9",

  // Text
  textPrimary:   "#0F172A",
  textSecondary: "#475569",
  textMuted:     "#94A3B8",
  textInverse:   "#FFFFFF",
};

export const radius = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, full: 9999,
};

export const shadow = {
  xs: {
    shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  sm: {
    shadowColor: "#64748B", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  md: {
    shadowColor: "#475569", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10, shadowRadius: 16, elevation: 6,
  },
  primary: {
    shadowColor: "#6366F1", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 12, elevation: 8,
  },
};

export const layout = {
  sidebarWidth:      240,
  desktopBreakpoint: 768,
  contentMaxWidth:   960,
  formMaxWidth:      640,
};

export const CATEGORY_META: Record<string, { bg: string; text: string; bar: string; icon: string }> = {
  "#work":     { bg: "#EEF2FF", text: "#4338CA", bar: "#6366F1", icon: "💼" },
  "#school":   { bg: "#F5F3FF", text: "#6D28D9", bar: "#8B5CF6", icon: "📚" },
  "#personal": { bg: "#ECFDF5", text: "#065F46", bar: "#10B981", icon: "🌿" },
  "#health":   { bg: "#FFF1F2", text: "#9F1239", bar: "#F43F5E", icon: "❤️" },
  "#finance":  { bg: "#FFFBEB", text: "#92400E", bar: "#F59E0B", icon: "💰" },
  "#other":    { bg: "#F8FAFC", text: "#475569", bar: "#94A3B8", icon: "📌" },
};
