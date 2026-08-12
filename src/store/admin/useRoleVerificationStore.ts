import { create } from "zustand";
import type { RoleVerification } from "@/types/interface/admin/roleverification.interface";

interface RoleVerificationStore {
  isEditDialogOpen: boolean;
  selectedRow: RoleVerification | null;

  page: number;
  limit: number;

  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  openEditDialog: (row: RoleVerification) => void;
  closeEditDialog: () => void;

  reset: () => void;
}

export const useRoleVerificationStore = create<RoleVerificationStore>(
  (set) => ({
    isEditDialogOpen: false,
    selectedRow: null,

    page: 1,
    limit: 10,

    setPage: (page) => set({ page }),
    setLimit: (limit) => set({ limit, page: 1 }),

    openEditDialog: (row) => set({ selectedRow: row, isEditDialogOpen: true }),
    closeEditDialog: () => set({ selectedRow: null, isEditDialogOpen: false }),

    reset: () => set({ isEditDialogOpen: false, selectedRow: null }),
  }),
);
