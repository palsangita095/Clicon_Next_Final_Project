import { Profile } from "@/types/interface/admin/profiles.interface";
import { create } from "zustand";

interface ProfileStore {
  // Dialog State
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;

  // Selected Profile
  selectedProfile: Profile | null;

  page: number;
  limit: number;

  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // Actions
  openCreateDialog: () => void;
  closeCreateDialog: () => void;

  openEditDialog: (profile: Profile) => void;
  closeEditDialog: () => void;

  openDeleteDialog: (profile: Profile) => void;
  closeDeleteDialog: () => void;

  reset: () => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  // Initial State
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,

  selectedProfile: null,

  page: 1,
  limit: 10,

  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, page: 1 }),

  // Create Dialog
  openCreateDialog: () =>
    set({
      isCreateDialogOpen: true,
    }),

  closeCreateDialog: () =>
    set({
      isCreateDialogOpen: false,
    }),

  // Edit Dialog
  openEditDialog: (profile) =>
    set({
      selectedProfile: profile,
      isEditDialogOpen: true,
    }),

  closeEditDialog: () =>
    set({
      selectedProfile: null,
      isEditDialogOpen: false,
    }),

  // Delete Dialog
  openDeleteDialog: (profile) =>
    set({
      selectedProfile: profile,
      isDeleteDialogOpen: true,
    }),

  closeDeleteDialog: () =>
    set({
      selectedProfile: null,
      isDeleteDialogOpen: false,
    }),

  // Reset Store
  reset: () =>
    set({
      isCreateDialogOpen: false,
      isEditDialogOpen: false,
      isDeleteDialogOpen: false,
      selectedProfile: null,
    }),
}));
