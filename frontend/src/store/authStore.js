import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  /* ========================
     INIT / SESSION RESTORE
  ======================== */
  fetchUser: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    set({ user, loading: false });
  },

  /* ========================
     SIGN UP (Correct)
  ======================== */
  signup: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          "https://freelancer-cashflow-guard.vercel.app/login",
      },
    });

    if (error) throw error;

    // ✅ Create Profile Row Automatically
    if (data.user) {
      await supabase.from("user_profiles").insert({
        user_id: data.user.id,
        username: email.split("@")[0],
        avatar_url: null,
      });
    }

    return data;
  },

  /* ========================
     LOGIN (✅ FIXED FOR iOS)
  ======================== */
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // ✅ Clean Friendly Messages
      if (error.message.toLowerCase().includes("email not confirmed")) {
        throw new Error(
          "Please confirm your email first (check inbox/spam)."
        );
      }

      if (error.message.toLowerCase().includes("rate limit")) {
        throw new Error(
          "Too many attempts. Please wait 1–2 minutes and try again."
        );
      }

      throw error;
    }

    set({ user: data.user });
    return data;
  },

  /* ========================
     LOGOUT
  ======================== */
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
