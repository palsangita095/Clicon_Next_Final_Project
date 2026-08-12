export type NotificationType =
  | "verification_approved"
  | "verification_rejected"
  | "shipment_assigned"
  | "driver_assigned"
  | "delivery_out_for_delivery"
  | "delivery_completed"
  | "delivery_failed"
  | "shipment_status_update"
  | "general";

export interface AppNotification {
  id: string;
  profile_id?: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  source: "profile" | "customer" | "driver"; 
}

// export interface AppNotification {
//   id: string;
//   profile_id: string;
//   title: string;
//   message: string;
//   type: NotificationType;
//   read: boolean;
//   created_at: string;
//   link?: string | null;
// }

export interface CreateNotificationInput {
  profile_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
}
