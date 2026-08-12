export interface Customer {
  id: string;
  profile_id: string;
  customer_code: string;
  company_name: string | null;
  gst_number: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  preferred_contact: string | null;
  credit_limit: number;
  total_shipments: number;
  total_spent: number;
  created_at: string;
  updated_at: string;

  profiles: {
    full_name: string;
    email: string;
    phone: string;
    avatar_url: string;
    status: boolean;
    is_active: boolean;
  };
}

export interface CreateCustomerPayload {
  profile_id: string;
  customer_code: string;
  company_name?: string | null;
  gst_number?: string | null;
  billing_address?: string | null;
  shipping_address?: string | null;
  preferred_contact?: string | null;
  credit_limit?: number;
  total_shipments?: number;
  total_spent?: number;
}

export interface UpdateCustomerPayload {
  id: string;
  company_name?: string | null;
  gst_number?: string | null;
  billing_address?: string | null;
  shipping_address?: string | null;
  preferred_contact?: string | null;
  credit_limit?: number;
  total_shipments?: number;
  total_spent?: number;
}

export interface UpdateCustomerCreditLimitPayload {
  id: string;
  credit_limit: number;
}

export interface DeleteCustomerPayload {
  id: string;
}
