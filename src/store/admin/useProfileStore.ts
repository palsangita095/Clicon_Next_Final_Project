import { Profile } from "@/types/interface/admin/profiles.interface";
import { create } from "zustand";

interface ProfileStore {
  
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;

  
  selectedProfile: Profile | null;

  page: number;
  limit: number;

  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  
  openCreateDialog: () => void;
  closeCreateDialog: () => void;

  openEditDialog: (profile: Profile) => void;
  closeEditDialog: () => void;

  openDeleteDialog: (profile: Profile) => void;
  closeDeleteDialog: () => void;

  reset: () => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({

  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,

  selectedProfile: null,

  page: 1,
  limit: 10,

  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, page: 1 }),

  
  openCreateDialog: () =>
    set({
      isCreateDialogOpen: true,
    }),

  closeCreateDialog: () =>
    set({
      isCreateDialogOpen: false,
    }),

 
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

  
  reset: () =>
    set({
      isCreateDialogOpen: false,
      isEditDialogOpen: false,
      isDeleteDialogOpen: false,
      selectedProfile: null,
    }),
}));
