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
        // ✅ Redirect user back after confirmation
        emailRedirectTo:
          "https://freelancer-cashflow-guard.vercel.app/login",
      },
    });

    if (error) throw error;

    // ✅ Auto Create Profile Row (Only on Signup)
    if (data?.user) {
      await supabase.from("user_profiles").insert({
        user_id: data.user.id,
        username: email.split("@")[0],
        avatar_url: null,
      });
    }

    return data;
  },

  /* ========================
     LOGIN (FIXED ✅)
  ======================== */
  login: async (email, password) => {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) throw error;

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
