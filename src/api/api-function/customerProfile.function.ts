import { supabase } from "@/lib/supabase.config";
import { getErrorMessage } from "@/services/helper/global.helper";
import type {
  ApiResponse,
  CustomerProfileView,
  RecentShipment,
  UpdateProfileIdentityPayload,
  UpsertCustomerPayload,
} from "@/types/interface/customer/customerProfile.interface";



const generateCustomerCode = (): string =>
  `CUST-${Math.floor(100000 + Math.random() * 900000)}`;


export const getCustomerProfileFns = async (
  userId: string,
): Promise<ApiResponse<CustomerProfileView>> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(`*, customers (*)`)
      .eq("id", userId)
      .single();

    if (error) throw error;

    const c = Array.isArray(data.customers)
      ? (data.customers[0] ?? null)
      : (data.customers ?? null);

    return {
      success: true,
      message: "Profile fetched successfully",
      data: {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        phone: data.phone,
        role: data.role,
        status: data.status,
        is_verified: data.is_verified,
        is_active: data.is_active,
        last_login: data.last_login,
        created_at: data.created_at,
        updated_at: data.updated_at,
        profile_created_at: data.created_at,
        customer_id: c?.id ?? null,
        customer_code: c?.customer_code ?? null,
        company_name: c?.company_name ?? null,
        gst_number: c?.gst_number ?? null,
        billing_address: c?.billing_address ?? null,
        shipping_address: c?.shipping_address ?? null,
        preferred_contact: c?.preferred_contact ?? null,
        credit_limit: c?.credit_limit ?? null,
        total_shipments: c?.total_shipments ?? null,
        total_spent: c?.total_spent ?? null,
        customer_created_at: c?.created_at ?? null,
      },
    };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};


export const getRecentShipmentsFns = async (
  customerId: string,
  limit = 5,
): Promise<ApiResponse<RecentShipment[]>> => {
  try {
    const { data, error } = await supabase
      .from("shipments")
      .select("id, shipment_number, drop_address, created_at, status")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const formattedShipments: RecentShipment[] = (data ?? []).map(
      (row: any) => ({
        id: row.id,
        shipment_number: row.shipment_number,
        destination: row.drop_address,
        created_at: row.created_at,
        status: row.status,
      }),
    );

    return {
      success: true,
      message: "Shipments fetched successfully",
      data: formattedShipments,
    };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};


export const updateProfileIdentityFns = async (
  payload: UpdateProfileIdentityPayload,
): Promise<ApiResponse> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: payload.full_name, phone: payload.phone })
      .eq("id", payload.id);

    if (error) throw error;
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};


export const upsertCustomerFns = async (
  payload: UpsertCustomerPayload,
): Promise<ApiResponse> => {
  try {
   
    const { data: existing, error: fetchError } = await supabase
      .from("customers")
      .select("id")
      .eq("profile_id", payload.profile_id)
      .maybeSingle(); // returns null (not an error) when no row found

    if (fetchError) throw fetchError;

    const editableFields = {
      company_name: payload.company_name,
      gst_number: payload.gst_number,
      billing_address: payload.billing_address,
      shipping_address: payload.shipping_address,
      preferred_contact: payload.preferred_contact,
     
    };

    if (!existing) {
      
      const { error } = await supabase.from("customers").insert({
        profile_id: payload.profile_id,
        customer_code: generateCustomerCode(),
        ...editableFields,
      });

      if (error) throw error;
    } else {
     
      const { error } = await supabase
        .from("customers")
        .update(editableFields)
        .eq("profile_id", payload.profile_id);

      if (error) throw error;
    }

    return { success: true, message: "Customer details saved successfully" };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};
