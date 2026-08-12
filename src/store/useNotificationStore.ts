// src/store/useNotificationStore.ts
import { create } from "zustand";

/**
 * This store intentionally holds ZERO notification data.
 * Data lives in the TanStack Query cache (shared, deduped, realtime-synced).
 * This store only holds transient UI state, so any component — a sidebar link,
 * a "view all" button elsewhere, the bell itself — can open/close the panel
 * without prop drilling.
 */
interface NotificationUIState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useNotificationStore = create<NotificationUIState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
