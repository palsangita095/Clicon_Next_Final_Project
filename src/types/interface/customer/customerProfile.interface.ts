
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: string;
  status: string | null;
  is_verified: boolean;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CustomerRow {
  id: string;
  profile_id: string; 
  customer_code: string | null;
  company_name: string | null;
  gst_number: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  preferred_contact: string | null;
  credit_limit: number | null;
  total_shipments: number | null;
  total_spent: number | null;
  created_at: string | null;
  updated_at: string | null; 
}

export interface CustomerProfileView extends ProfileRow {
  customer_id: string;
  customer_code: string | null;
  company_name: string | null;
  gst_number: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  preferred_contact: string | null;
  credit_limit: number | null;
  total_shipments: number | null;
  total_spent: number | null;
  customer_created_at: string | null;
  profile_created_at: string;
}

export interface RecentShipment {
  id: string;
  shipment_number: string;
  destination: string | null;
  created_at: string;
  status: "pending" | "in_transit" | "delivered" | "cancelled";
}

export interface UpdateProfileIdentityPayload {
  id: string;
  full_name: string;
  phone: string | null;
}

export interface UpsertCustomerPayload {
  profile_id: string; // Changed from user_id
  company_name: string | null;
  gst_number: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  preferred_contact: string | null;

}

export interface EditProfileFormValues {
  full_name: string;
  phone: string | null;
  company_name: string | null;
  gst_number: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  preferred_contact: string | null;
 
}

export interface NotificationPref {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}
