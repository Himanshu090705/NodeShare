import { create } from "zustand";

const useUserStore = create((set) => ({
  session: {},
  setAuthSession: (session) => set({ session })
}));

export default useUserStore;
