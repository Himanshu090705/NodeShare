import { create } from "zustand";

const useUserStore = create((set) => ({
  isLogin: false,
  setIsLogin: (isLogin) => set({ isLogin }),
}));

export default useUserStore;
