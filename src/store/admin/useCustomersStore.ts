import { Customer } from "@/types/interface/admin/customers.interface";
import { create } from "zustand";

interface CustomerStore {
  
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;


  selectedCustomer: Customer | null;

  page: number;
  limit: number;

  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

 
  openCreateDialog: () => void;
  closeCreateDialog: () => void;

  openEditDialog: (customer: Customer) => void;
  closeEditDialog: () => void;

  openDeleteDialog: (customer: Customer) => void;
  closeDeleteDialog: () => void;

  reset: () => void;
}

export const useCustomerStore = create<CustomerStore>((set) => ({
  
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,

  selectedCustomer: null,

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

  
  reset: () =>
    set({
      isCreateDialogOpen: false,
      isEditDialogOpen: false,
      isDeleteDialogOpen: false,
      selectedCustomer: null,
    }),
}));
