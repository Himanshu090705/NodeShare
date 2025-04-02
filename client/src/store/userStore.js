import { create } from "zustand";

const useUserStore = create((set) => ({
<<<<<<< HEAD
  isLogin: false,
  setIsLogin: (isLogin) => set({ isLogin }),
=======
  session: {},
  setAuthSession: (session) => set({ session })
>>>>>>> 28e6fdf48fdfdb7390e0687af8e65b096a5830eb
}));

export default useUserStore;
