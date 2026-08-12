import { create } from "zustand";

interface DispatcherProfileState {
  isEditModalOpen: boolean;
  openEditModal: () => void;
  closeEditModal: () => void;
}

export const useDispatcherProfileStore = create<DispatcherProfileState>(
  (set) => ({
    isEditModalOpen: false,
    openEditModal: () => set({ isEditModalOpen: true }),
    closeEditModal: () => set({ isEditModalOpen: false }),
  }),
);
