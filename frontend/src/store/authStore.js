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
     SIGN UP
  ======================== */
  signup: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Create profile row after signup
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email,
      });
    }

    return data;
  },

  /* ========================
     LOGIN
  ======================== */
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
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
