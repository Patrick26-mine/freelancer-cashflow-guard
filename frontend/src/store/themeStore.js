import { create } from "zustand";

export const useThemeStore = create(() => ({
  colors: {
    bg: "#f8fafc",          // slate-50
    card: "#ffffff",
    border: "#e5e7eb",
    primary: "#6366f1",     // indigo-500
    danger: "#ef4444",
    text: "#0f172a",        // slate-900
    muted: "#64748b",       // slate-500
  },
}));
