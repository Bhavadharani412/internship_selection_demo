import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
  cartOpen: boolean;
  searchOpen: boolean;
  recent: string[];
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  addRecent: (id: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      cartOpen: false,
      searchOpen: false,
      recent: [],
      setCartOpen: (cartOpen) => set({ cartOpen }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      addRecent: (id) =>
        set((state) => ({ recent: [id, ...state.recent.filter((item) => item !== id)].slice(0, 12) }))
    }),
    { name: "aurelia-ui", partialize: (state) => ({ recent: state.recent }) }
  )
);
