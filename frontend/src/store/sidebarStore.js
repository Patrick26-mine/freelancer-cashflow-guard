import { create } from "zustand";

export const useSidebarStore = create((set) => ({
  isCollapsed: true, // start collapsed
  setCollapsed: (value) => set({ isCollapsed: value }),
}));
