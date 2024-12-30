import { create } from "zustand";

const useFileStore = create((set) => ({
  fileData: [],
  setFileData: (fileData) =>
    set((state) => ({ fileData: [...state.fileData, fileData] })),
}));

export default useFileStore;
