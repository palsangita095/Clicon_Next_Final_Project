// // Location: src/store/useCustomerProfileStore.ts

// import { create } from "zustand";
// import { toast } from "sonner";
// import {
//   getCustomerProfileFns,
//   getRecentShipmentsFns,
//   updateProfileIdentityFns,
//   upsertCustomerFns,
// } from "@/api/api-function/customerProfile.function";
// import {
//   CustomerProfileView,
//   EditProfileFormValues,
//   NotificationPref,
//   RecentShipment,
// } from "@/types/interface/customerProfile.interface";

// interface CustomerProfileState {
//   status: "idle" | "loading" | "success" | "error";
//   error: string | null;
//   profile: CustomerProfileView | null;
//   shipments: RecentShipment[];
//   saveStatus: "idle" | "saving" | "error";
//   saveError: string | null;
//   notificationPrefs: NotificationPref[];

//   fetchProfile: (userId: string) => Promise<void>;
//   updateProfile: (
//     userId: string,
//     values: EditProfileFormValues,
//   ) => Promise<boolean>;
//   toggleNotif: (id: string) => void;
//   reset: () => void;
// }

// const DEFAULT_NOTIF_PREFS: NotificationPref[] = [
//   {
//     id: "shipment_alerts",
//     label: "Shipment alerts",
//     description: "Real-time status updates for your shipments",
//     enabled: true,
//   },
//   {
//     id: "email_notifs",
//     label: "Email notifications",
//     description: "Booking confirmations and invoices",
//     enabled: true,
//   },
//   {
//     id: "sms_notifs",
//     label: "SMS notifications",
//     description: "Delivery OTPs and ETA alerts",
//     enabled: false,
//   },
// ];

// const INITIAL_STATE = {
//   status: "idle" as const,
//   error: null,
//   profile: null,
//   shipments: [],
//   saveStatus: "idle" as const,
//   saveError: null,
//   notificationPrefs: DEFAULT_NOTIF_PREFS,
// };

// export const useCustomerProfileStore = create<CustomerProfileState>(
//   (set, get) => ({
//     ...INITIAL_STATE,

//     fetchProfile: async (userId: string) => {
//       set({ status: "loading", error: null });

//       console.log('userID', userId)

//       const profileRes = await getCustomerProfileFns(userId);

//       console.log('profile res ', profileRes)

//       if (!profileRes.success || !profileRes.data) {
//         set({ status: "error", error: profileRes.message });
//         toast.error(profileRes.message);
//         return;
//       }

//       let shipmentsData: RecentShipment[] = [];
//       if (profileRes.data.customer_id) {
//         const shipmentRes = await getRecentShipmentsFns(
//           profileRes.data.customer_id,
//         );
//         if (shipmentRes.success && shipmentRes.data) {
//           shipmentsData = shipmentRes.data;
//         }
//       }

//       set({
//         status: "success",
//         profile: profileRes.data,
//         shipments: shipmentsData,
//       });
//     },

//     updateProfile: async (userId: string, values: EditProfileFormValues) => {
//       set({ saveStatus: "saving", saveError: null });

//     const [identityRes, customerRes] = await Promise.all([
//       updateProfileIdentityFns({
//         id: userId,
//         full_name: values.full_name,
//         phone: values.phone,
//       }),
//       upsertCustomerFns({
//         profile_id: userId, // <-- THIS IS THE ONLY CHANGE NEEDED HERE
//         company_name: values.company_name,
//         gst_number: values.gst_number,
//         billing_address: values.billing_address,
//         shipping_address: values.shipping_address,
//         preferred_contact: values.preferred_contact,
//         address: values.address,
//         city: values.city,
//         state: values.state,
//         country: values.country,
//       }),
//     ]);

//       if (!identityRes.success || !customerRes.success) {
//         const errorMessage = !identityRes.success
//           ? identityRes.message
//           : customerRes.message;
//         set({ saveStatus: "error", saveError: errorMessage });
//         toast.error(errorMessage);
//         return false;
//       }

//       // Optimistic Update using standard spread operators (No Immer)
//       const currentProfile = get().profile;
//       if (currentProfile) {
//         set({
//           saveStatus: "idle",
//           profile: {
//             ...currentProfile,
//             full_name: values.full_name,
//             phone: values.phone,
//             company_name: values.company_name,
//             gst_number: values.gst_number,
//             billing_address: values.billing_address,
//             shipping_address: values.shipping_address,
//             preferred_contact: values.preferred_contact,
//             address: values.address,
//             city: values.city,
//             state: values.state,
//             country: values.country,
//           },
//         });
//       }

//       toast.success("Profile saved successfully");
//       return true;
//     },

//     toggleNotif: (id: string) => {
//       set((state) => ({
//         notificationPrefs: state.notificationPrefs.map((pref) =>
//           pref.id === id ? { ...pref, enabled: !pref.enabled } : pref,
//         ),
//       }));
//     },

//     reset: () => set(INITIAL_STATE),
//   }),
// );
