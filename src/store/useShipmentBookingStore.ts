// import { create } from "zustand";
// import { devtools } from "zustand/middleware";
// import type {
//   Shipment,
//   CreateShipmentPayload,
//   UpdateShipmentPayload,
//   UpdateShipmentStatusPayload,
// } from "@/types/interface/shipmentBooking.interface";
// import {
//   getShipmentsList,
//   getShipment,

//   updateShipmentStatus,
//   deleteShipment,
//   getShipmentsByCustomerFns,
//   createShipmentFns,
//   updateShipmentStatusFns,
// } from "@/api/api-function/shipmentBooking.function";
// import { ApiResponse } from "@/types/interface/customerProfile.interface";

// // ─── State Shape ──────────────────────────────────────────────────────────────

// interface ShipmentState {
//   // Data
//   shipments: Shipment[];
//   selectedShipment: Shipment | null;

//   // UI State
//   isLoading: boolean;
//   isMutating: boolean;
//   error: string | null;
// }

// // ─── Actions Shape ────────────────────────────────────────────────────────────

// interface ShipmentActions {
//   fetchShipments: () => Promise<void>;
//   fetchShipmentsByCustomer: (customerId: string) => Promise<void>;
//   fetchShipmentById: (id: string) => Promise<void>;
//   setSelectedShipment: (shipment: Shipment | null) => void;

//   addShipment: (
//     payload: CreateShipmentPayload,
//   ) => Promise<ApiResponse<Shipment>>;
//   // Added/Corrected return types for mutations
//   updateShipment: (
//     payload: UpdateShipmentPayload,
//   ) => Promise<ApiResponse<Shipment>>;
//   editShipment: (payload: UpdateShipmentPayload) => Promise<void>;
//   changeShipmentStatus: (payload: UpdateShipmentStatusPayload) => Promise<void>;
//   removeShipment: (id: string) => Promise<void>;

//   clearError: () => void;
//   reset: () => void;
// }

// // ─── Initial State ────────────────────────────────────────────────────────────

// const initialState: ShipmentState = {
//   shipments: [],
//   selectedShipment: null,
//   isLoading: false,
//   isMutating: false,
//   error: null,
// };

// // ─── Store ────────────────────────────────────────────────────────────────────

// export const useShipmentStore = create<ShipmentState & ShipmentActions>()(
//   devtools(
//     (set) => ({
//       ...initialState,

//       // ── Queries ──────────────────────────────────────────────────────────

//       fetchShipments: async () => {
//         set({ isLoading: true, error: null });
//         try {
//           const shipments = await getShipmentsList();
//           set({ shipments, isLoading: false });
//         } catch (err) {
//           set({ error: toMessage(err), isLoading: false });
//         }
//       },

//       fetchShipmentsByCustomer: async (customerId: string) => {
//         set({ isLoading: true, error: null });
//         try {
//           const shipments = await getShipmentsByCustomerFns(customerId);
//           set({ shipments, isLoading: false });
//         } catch (err) {
//           set({ error: toMessage(err), isLoading: false });
//         }
//       },

//       fetchShipmentById: async (id: string) => {
//         set({ isLoading: true, error: null });
//         try {
//           const shipment = await getShipment(id);
//           set({ selectedShipment: shipment, isLoading: false });
//         } catch (err) {
//           set({ error: toMessage(err), isLoading: false });
//         }
//       },

//       setSelectedShipment: (shipment) => set({ selectedShipment: shipment }),

//       // ── Mutations ────────────────────────────────────────────────────────

//       // Location: src/store/useShipmentStore.ts
//       addShipment: async (payload: CreateShipmentPayload) => {
//         const res = await createShipmentFns(payload);

//         if (res.success && res.data) {
//           set((state) => ({
//             shipments: [res.data!, ...state.shipments],
//           }));
//         }
//         return res; // Now matches Promise<ApiResponse<Shipment>>
//       },

//       // Add this inside the (set) => ({ ... }) block of your create function
//       updateShipment: async (payload: UpdateShipmentPayload) => {
//         set({ isMutating: true, error: null });
//         try {
//           // You'll need to create updateShipmentFns if you haven't yet
//           const res = await updateShipmentStatusFns(payload);
//           if (res.success && res.data) {
//             set((state) => ({
//               shipments: state.shipments.map((s) =>
//                 s.id === res.data!.id ? res.data! : s,
//               ),
//               selectedShipment:
//                 state.selectedShipment?.id === res.data!.id
//                   ? res.data!
//                   : state.selectedShipment,
//               isMutating: false,
//             }));
//           }
//           return res;
//         } catch (err) {
//           set({ error: toMessage(err), isMutating: false });
//           return { success: false, message: toMessage(err) };
//         }
//       },

//       // Location: src/store/useShipmentStore.ts

//       editShipment: async (payload) => {
//         set({ isMutating: true, error: null });
//         try {
//           const res = await updateShipmentStatusFns(payload); // Returns ApiResponse<Shipment>

//           if (res.success && res.data) {
//             const updated = res.data; // Now this is specifically the Shipment object

//             set((state) => ({
//               shipments: state.shipments.map((s) =>
//                 s.id === updated.id ? updated : s,
//               ),
//               selectedShipment:
//                 state.selectedShipment?.id === updated.id
//                   ? updated
//                   : state.selectedShipment,
//               isMutating: false,
//             }));
//           } else {
//             throw new Error(res.message);
//           }
//         } catch (err) {
//           set({ error: toMessage(err), isMutating: false });
//           throw err;
//         }
//       },

//       changeShipmentStatus: async (payload) => {
//         set({ isMutating: true, error: null });
//         try {
//           const updated = await updateShipmentStatus(payload);
//           set((state) => ({
//             shipments: state.shipments.map((s) =>
//               s.id === updated.id ? updated : s,
//             ),
//             selectedShipment:
//               state.selectedShipment?.id === updated.id
//                 ? updated
//                 : state.selectedShipment,
//             isMutating: false,
//           }));
//         } catch (err) {
//           set({ error: toMessage(err), isMutating: false });
//           throw err;
//         }
//       },

//       removeShipment: async (id) => {
//         set({ isMutating: true, error: null });
//         try {
//           await deleteShipment(id);
//           set((state) => ({
//             shipments: state.shipments.filter((s) => s.id !== id),
//             selectedShipment:
//               state.selectedShipment?.id === id ? null : state.selectedShipment,
//             isMutating: false,
//           }));
//         } catch (err) {
//           set({ error: toMessage(err), isMutating: false });
//           throw err;
//         }
//       },

//       // ── Utility ──────────────────────────────────────────────────────────

//       clearError: () => set({ error: null }),

//       reset: () => set(initialState),
//     }),
//     { name: "ShipmentStore" },
//   ),
// );

// // ─── Selector Hooks (keeps components clean) ──────────────────────────────────

// export const useShipments = () => useShipmentStore((s) => s.shipments);
// export const useSelectedShipment = () =>
//   useShipmentStore((s) => s.selectedShipment);
// export const useShipmentLoading = () => useShipmentStore((s) => s.isLoading);
// export const useShipmentMutating = () => useShipmentStore((s) => s.isMutating);
// export const useShipmentError = () => useShipmentStore((s) => s.error);

// // ─── Internal Helper ──────────────────────────────────────────────────────────

// const toMessage = (err: unknown): string =>
//   err instanceof Error ? err.message : "An unexpected error occurred.";
