import { Customer } from "@/types/interface/admin/customers.interface";
import { create } from "zustand";

interface CustomerStore {
  // Dialog State
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;

  // Selected Customer
  selectedCustomer: Customer | null;

  page: number;
  limit: number;

  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // Actions
  openCreateDialog: () => void;
  closeCreateDialog: () => void;

  openEditDialog: (customer: Customer) => void;
  closeEditDialog: () => void;

  openDeleteDialog: (customer: Customer) => void;
  closeDeleteDialog: () => void;

  reset: () => void;
}

export const useCustomerStore = create<CustomerStore>((set) => ({
  // Initial State
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,

  selectedCustomer: null,

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
  openEditDialog: (customer) =>
    set({
      selectedCustomer: customer,
      isEditDialogOpen: true,
    }),

  closeEditDialog: () =>
    set({
      selectedCustomer: null,
      isEditDialogOpen: false,
    }),

  // Delete Dialog
  openDeleteDialog: (customer) =>
    set({
      selectedCustomer: customer,
      isDeleteDialogOpen: true,
    }),

  closeDeleteDialog: () =>
    set({
      selectedCustomer: null,
      isDeleteDialogOpen: false,
    }),

  // Reset Store
  reset: () =>
    set({
      isCreateDialogOpen: false,
      isEditDialogOpen: false,
      isDeleteDialogOpen: false,
      selectedCustomer: null,
    }),
}));
